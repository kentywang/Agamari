import store from '../store';
import socket from '../socket';

import { getMeshData, setCannonPosition, setMeshPosition } from './utils';
import { myColors, fixedTimeStep, maxSubSteps } from './config';

import { forOwn } from 'lodash';

import { loadGame, loadEnvironment } from './game';
import { controls, Player} from './player';
import { Food } from './food';

import {  removeAllFood } from '../reducers/food';
import {  stopGame } from '../reducers/gameState';

const THREE = require('three');
const CANNON = require('../../public/cannon.min.js');

let animateTimeout;
let scene, camera, canvas, renderer, composer, stats, pass, shader;
let world, groundMaterial, ballMaterial, shadowLight;
let geometry, material, groundShape, groundBody, hemisphereLight, ambientLight;
let timeFromStart = Date.now();
let time, lastTime;
let someColors = myColors();
let afkCall;

export const init = () => {

  // set afk status to false
  window.onfocus = () => clearTimeout(afkCall);

  // start timer for player kick
  window.onblur = () => {
    afkCall = setTimeout(()=> {
      store.dispatch(stopGame());
      store.dispatch(removeAllFood());
      socket.emit('leave');
    }, 60 * 1000);
  };

  let { players, food } = store.getState();

  // initialize THREE scene, camera, renderer
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(65,
                                       window.innerWidth / window.innerHeight,
                                       1,
                                       2500);
  canvas = document.getElementById('canvas');
  renderer = new THREE.WebGLRenderer({alpha: true, canvas});
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize(window.innerWidth / 1,
                   window.innerHeight / 1,
                   false);
  scene.add(camera);

  // shading
  renderer.shadowMap.enabled = true;
  renderer.shadowMapSoft = true;

  // initialize Cannon world
  world = new CANNON.World();
  world.gravity.set(0, 0, 0);
  world.broadphase = new CANNON.NaiveBroadphase();

  // initialize all existing players in room
  let newPlayer, newFood;

  forOwn(players, (data, id) => {
    let isMainPlayer = id === socket.id;
    newPlayer = new Player(id, data, isMainPlayer);
    newPlayer.init();
  });

  forOwn(food, (data, id) => {
    newFood = new Food(id, data);
    newFood.init();
  });

  // adjust friction between ball & ground
  groundMaterial = new CANNON.Material('groundMaterial');
  ballMaterial = new CANNON.Material('ballMaterial');
  var groundGroundCm = new CANNON.ContactMaterial(ballMaterial, groundMaterial, {
      friction: 0.9,
      restitution: 0.0,
      contactEquationStiffness: 1e8,
      contactEquationRelaxation: 3,
      frictionEquationStiffness: 1e8,
      frictionEquationRegularizationTime: 3,
  });
  var ballCm = new CANNON.ContactMaterial(ballMaterial, ballMaterial, {
      friction: 0.0,
      restitution: 0.9
  });
  world.addContactMaterial(groundGroundCm);
  world.addContactMaterial(ballCm);

  // planet
  createLevel();

  // lighting
  hemisphereLight = new THREE.HemisphereLight('#004570', someColors['pink'], 0.8);

  shadowLight = new THREE.DirectionalLight('#4ECDC4', 0.3);

  shadowLight.castShadow = true;

  shadowLight.shadow.camera.left = -400;
  shadowLight.shadow.camera.right = 400;
  shadowLight.shadow.camera.top = 400;
  shadowLight.shadow.camera.bottom = -400;
  shadowLight.shadow.camera.near = 1;
  shadowLight.shadow.camera.far = 1000;

  shadowLight.shadow.mapSize.width = 512;
  shadowLight.shadow.mapSize.height = 512;

  scene.add(hemisphereLight);
  scene.add(shadowLight);

  ambientLight = new THREE.AmbientLight(someColors['green'], 0.5);
  scene.add(ambientLight);

  loadGame();

  // FPS monitor
  // stats = new Stats();
  // stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
  // document.body.appendChild( stats.dom );

  // effect composer for post-processing (renderer goes thru this)
  var parameters = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat, stencilBuffer: false };

  var renderTarget = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, parameters );

  composer = new THREE.EffectComposer( renderer, renderTarget );
  composer.addPass( new THREE.RenderPass( scene, camera ) );

  var vignetteShader = new THREE.ShaderPass( THREE.VignetteShader );
  vignetteShader.renderToScreen = true;
  composer.addPass( vignetteShader );

  // Events
  window.addEventListener( 'resize', onWindowResize, false );
};

export function animate() {
   //   stats.begin();

  animateTimeout = setTimeout( function() {
    requestAnimationFrame( animate );

    // emit positional data to server
    socket.emit('update_position', getMeshData(playerMesh));
  }, 1000 / 30 );

  let { gameState, players } = store.getState();

  if (!gameState.isPlaying) clearTimeout(animateTimeout);

  let playerMesh = scene.getObjectByName(socket.id);

  if (playerMesh) {
    // Set the direction of the light
    shadowLight.position.copy(playerMesh.position);
    shadowLight.position.multiplyScalar(1.2);

    // receive and process controls and camera
    if ( controls ) controls.update();

    // sync THREE mesh with Cannon mesh
    // Cannon's y & z are swapped from THREE, and w is flipped
    if (playerMesh.cannon) setMeshPosition(playerMesh);

    // for all other players
    forOwn(players, (currentPlayer, id) => {
      let currentMesh = scene.getObjectByName(id);
      if (currentPlayer !== socket.id && currentMesh) setCannonPosition(currentMesh);
    });

    // run physics
    time = Date.now();
    if (lastTime !== undefined) {
       let dt = (time - lastTime) / 1000;
       world.step(fixedTimeStep, dt, maxSubSteps);
    }
    lastTime = time;
    loadEnvironment();
    render();
  } else {
    store.dispatch(stopGame());
    store.dispatch(removeAllFood());
    socket.emit('leave');
    clearTimeout(animateTimeout);
  }



  // stats.end();
}

function render() {
  renderer.clear();
  composer.render();
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize(window.innerWidth / 1,
                   window.innerHeight / 1,
                   false);
}

function createLevel(){
 // planet creation
  var planet_geometry = new THREE.TetrahedronBufferGeometry( 500, 4 );
  var planet_material = new THREE.MeshPhongMaterial( { color: someColors['red'], shading: THREE.FlatShading});
  var planet = new THREE.Mesh( planet_geometry, planet_material );

  planet.receiveShadow = true;

  scene.add(planet);

  // create Cannon planet
  var planetShape = new CANNON.Sphere(500);
  var planetBody = new CANNON.Body({ mass: 0, material: groundMaterial, shape: planetShape });
  world.add(planetBody);

  // create stars
  var particleCount = 1800,
    particles = new THREE.Geometry(),
    pMaterial = new THREE.PointsMaterial({
      color: 0xFFFFFF,
      size: 2
    });

  for (var p = 0; p < particleCount; p++) {
    var pX = Math.random() * 1000 - 500,
        pY = Math.random() * 1000 - 500,
        pZ = Math.random() * 1000 - 500,
        particle = new THREE.Vector3(pX, pY, pZ)
        particle.normalize().multiplyScalar(Math.random() * 1000 + 600)
    // add it to the geometry
    particles.vertices.push(particle);
  }

  // create the particle system
  var particleSystem = new THREE.Points(
      particles,
      pMaterial);

  scene.add(particleSystem);
}

export { scene, camera, canvas, renderer, world, groundMaterial, ballMaterial, timeFromStart, clearTimeout };

// Shaders
THREE.CopyShader = {

  uniforms: {

    "tDiffuse": { value: null },
    "opacity":  { value: 1.0 }

  },

  vertexShader: [

    "varying vec2 vUv;",

    "void main() {",

      "vUv = uv;",
      "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

    "}"

  ].join( "\n" ),

  fragmentShader: [

    "uniform float opacity;",

    "uniform sampler2D tDiffuse;",

    "varying vec2 vUv;",

    "void main() {",

      "vec4 texel = texture2D( tDiffuse, vUv );",
      "gl_FragColor = opacity * texel;",

    "}"

  ].join( "\n" )

};
/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.EffectComposer = function ( renderer, renderTarget ) {

  this.renderer = renderer;

  if ( renderTarget === undefined ) {

    var parameters = {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      stencilBuffer: false
    };
    var size = renderer.getSize();
    renderTarget = new THREE.WebGLRenderTarget( size.width, size.height, parameters );

  }

  this.renderTarget1 = renderTarget;
  this.renderTarget2 = renderTarget.clone();

  this.writeBuffer = this.renderTarget1;
  this.readBuffer = this.renderTarget2;

  this.passes = [];

  if ( THREE.CopyShader === undefined )
    console.error( "THREE.EffectComposer relies on THREE.CopyShader" );

  this.copyPass = new THREE.ShaderPass( THREE.CopyShader );

};

Object.assign( THREE.EffectComposer.prototype, {

  swapBuffers: function() {

    var tmp = this.readBuffer;
    this.readBuffer = this.writeBuffer;
    this.writeBuffer = tmp;

  },

  addPass: function ( pass ) {

    this.passes.push( pass );

    var size = this.renderer.getSize();
    pass.setSize( size.width, size.height );

  },

  insertPass: function ( pass, index ) {

    this.passes.splice( index, 0, pass );

  },

  render: function ( delta ) {

    var maskActive = false;

    var pass, i, il = this.passes.length;

    for ( i = 0; i < il; i ++ ) {

      pass = this.passes[ i ];

      if ( pass.enabled === false ) continue;

      pass.render( this.renderer, this.writeBuffer, this.readBuffer, delta, maskActive );

      if ( pass.needsSwap ) {

        if ( maskActive ) {

          var context = this.renderer.context;

          context.stencilFunc( context.NOTEQUAL, 1, 0xffffffff );

          this.copyPass.render( this.renderer, this.writeBuffer, this.readBuffer, delta );

          context.stencilFunc( context.EQUAL, 1, 0xffffffff );

        }

        this.swapBuffers();

      }

      if ( THREE.MaskPass !== undefined ) {

        if ( pass instanceof THREE.MaskPass ) {

          maskActive = true;

        } else if ( pass instanceof THREE.ClearMaskPass ) {

          maskActive = false;

        }

      }

    }

  },

  reset: function ( renderTarget ) {

    if ( renderTarget === undefined ) {

      var size = this.renderer.getSize();

      renderTarget = this.renderTarget1.clone();
      renderTarget.setSize( size.width, size.height );

    }

    this.renderTarget1.dispose();
    this.renderTarget2.dispose();
    this.renderTarget1 = renderTarget;
    this.renderTarget2 = renderTarget.clone();

    this.writeBuffer = this.renderTarget1;
    this.readBuffer = this.renderTarget2;

  },

  setSize: function ( width, height ) {

    this.renderTarget1.setSize( width, height );
    this.renderTarget2.setSize( width, height );

    for ( var i = 0; i < this.passes.length; i ++ ) {

      this.passes[i].setSize( width, height );

    }

  }

} );


THREE.Pass = function () {

  // if set to true, the pass is processed by the composer
  this.enabled = true;

  // if set to true, the pass indicates to swap read and write buffer after rendering
  this.needsSwap = true;

  // if set to true, the pass clears its buffer before rendering
  this.clear = false;

  // if set to true, the result of the pass is rendered to screen
  this.renderToScreen = false;

};

Object.assign( THREE.Pass.prototype, {

  setSize: function( width, height ) {},

  render: function ( renderer, writeBuffer, readBuffer, delta, maskActive ) {

    console.error( "THREE.Pass: .render() must be implemented in derived pass." );

  }

} );

/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.RenderPass = function ( scene, camera, overrideMaterial, clearColor, clearAlpha ) {

  THREE.Pass.call( this );

  this.scene = scene;
  this.camera = camera;

  this.overrideMaterial = overrideMaterial;

  this.clearColor = clearColor;
  this.clearAlpha = ( clearAlpha !== undefined ) ? clearAlpha : 0;

  this.clear = true;
  this.needsSwap = false;

};

THREE.RenderPass.prototype = Object.assign( Object.create( THREE.Pass.prototype ), {

  constructor: THREE.RenderPass,

  render: function ( renderer, writeBuffer, readBuffer, delta, maskActive ) {

    var oldAutoClear = renderer.autoClear;
    renderer.autoClear = false;

    this.scene.overrideMaterial = this.overrideMaterial;

    var oldClearColor, oldClearAlpha;

    if ( this.clearColor ) {

      oldClearColor = renderer.getClearColor().getHex();
      oldClearAlpha = renderer.getClearAlpha();

      renderer.setClearColor( this.clearColor, this.clearAlpha );

    }

    renderer.render( this.scene, this.camera, this.renderToScreen ? null : readBuffer, this.clear );

    if ( this.clearColor ) {

      renderer.setClearColor( oldClearColor, oldClearAlpha );

    }

    this.scene.overrideMaterial = null;
    renderer.autoClear = oldAutoClear;
  }

} );

/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.ShaderPass = function ( shader, textureID ) {

  THREE.Pass.call( this );

  this.textureID = ( textureID !== undefined ) ? textureID : "tDiffuse";

  if ( shader instanceof THREE.ShaderMaterial ) {

    this.uniforms = shader.uniforms;

    this.material = shader;

  } else if ( shader ) {

    this.uniforms = THREE.UniformsUtils.clone( shader.uniforms );

    this.material = new THREE.ShaderMaterial( {

      defines: shader.defines || {},
      uniforms: this.uniforms,
      vertexShader: shader.vertexShader,
      fragmentShader: shader.fragmentShader

    } );

  }

  this.camera = new THREE.OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );
  this.scene = new THREE.Scene();

  this.quad = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), null );
  this.scene.add( this.quad );

};

THREE.ShaderPass.prototype = Object.assign( Object.create( THREE.Pass.prototype ), {

  constructor: THREE.ShaderPass,

  render: function( renderer, writeBuffer, readBuffer, delta, maskActive ) {

    if ( this.uniforms[ this.textureID ] ) {

      this.uniforms[ this.textureID ].value = readBuffer.texture;

    }

    this.quad.material = this.material;

    if ( this.renderToScreen ) {

      renderer.render( this.scene, this.camera );

    } else {

      renderer.render( this.scene, this.camera, writeBuffer, this.clear );

    }

  }

} );

/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Vignette shader
 * based on PaintEffect postprocess from ro.me
 * http://code.google.com/p/3-dreams-of-black/source/browse/deploy/js/effects/PaintEffect.js
 */

THREE.VignetteShader = {

  uniforms: {

    "tDiffuse": { value: null },
    "offset":   { value: 1.0 },
    "darkness": { value: 1.0 }

  },

  vertexShader: [

    "varying vec2 vUv;",

    "void main() {",

      "vUv = uv;",
      "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

    "}"

  ].join( "\n" ),

  fragmentShader: [

    "uniform float offset;",
    "uniform float darkness;",

    "uniform sampler2D tDiffuse;",

    "varying vec2 vUv;",

    "void main() {",

      // Eskil's vignette

      "vec4 texel = texture2D( tDiffuse, vUv );",
      "vec2 uv = ( vUv - vec2( 0.5 ) ) * vec2( offset );",
      "gl_FragColor = vec4( mix( texel.rgb, vec3( 1.0 - darkness ), dot( uv, uv ) ), texel.a );",

      /*
      // alternative version from glfx.js
      // this one makes more "dusty" look (as opposed to "burned")

      "vec4 color = texture2D( tDiffuse, vUv );",
      "float dist = distance( vUv, vec2( 0.5 ) );",
      "color.rgb *= smoothstep( 0.8, offset * 0.799, dist *( darkness + offset ) );",
      "gl_FragColor = color;",
      */

    "}"

  ].join( "\n" )

};

