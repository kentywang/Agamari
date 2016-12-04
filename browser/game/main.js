const THREE = require('three');
const CANNON = require('../../public/cannon.min.js');

import { forOwn } from 'lodash';
import { getMeshData, setCannonPosition, setMeshPosition } from './utils';
import { myColors, fixedTimeStep, maxSubSteps } from './config';
import store from '../store';
import socket from '../socket';

import { loadGame, loadEnvironment } from './game';
import {controls, Player} from './player';
import { Food } from './food';
let animateTimeout;
let scene, camera, canvas, renderer, composer, stats, pass, shader;
let world, groundMaterial, ballMaterial, shadowLight;
let geometry, material, groundShape, groundBody, hemisphereLight, ambientLight;
let timeFromStart = Date.now();
// variables for physics
let time, lastTime;
// camera
let raycastReference, raycastHeight;

let someColors = myColors();





var mCurrent = new THREE.Matrix4();
      var mPrev = new THREE.Matrix4();
      var tmpArray = new THREE.Matrix4();
      var camTranslateSpeed = new THREE.Vector3();
      var prevCamPos = new THREE.Vector3();





/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Full-screen textured quad shader
 */

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

/**
 * @author alteredq / http://alteredqualia.com/
 * @author davidedc / http://www.sketchpatch.net/
 *
 * NVIDIA FXAA by Timothy Lottes
 * http://timothylottes.blogspot.com/2011/06/fxaa3-source-released.html
 * - WebGL port by @supereggbert
 * http://www.glge.org/demos/fxaa/
 */

THREE.FXAAShader = {

  uniforms: {

    "tDiffuse":   { value: null },
    "resolution": { value: new THREE.Vector2( 1 / 1024, 1 / 512 ) }

  },

  vertexShader: [

    "void main() {",

      "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

    "}"

  ].join( "\n" ),

  fragmentShader: [

    "uniform sampler2D tDiffuse;",
    "uniform vec2 resolution;",

    "#define FXAA_REDUCE_MIN   (1.0/128.0)",
    "#define FXAA_REDUCE_MUL   (1.0/8.0)",
    "#define FXAA_SPAN_MAX     8.0",

    "void main() {",

      "vec3 rgbNW = texture2D( tDiffuse, ( gl_FragCoord.xy + vec2( -1.0, -1.0 ) ) * resolution ).xyz;",
      "vec3 rgbNE = texture2D( tDiffuse, ( gl_FragCoord.xy + vec2( 1.0, -1.0 ) ) * resolution ).xyz;",
      "vec3 rgbSW = texture2D( tDiffuse, ( gl_FragCoord.xy + vec2( -1.0, 1.0 ) ) * resolution ).xyz;",
      "vec3 rgbSE = texture2D( tDiffuse, ( gl_FragCoord.xy + vec2( 1.0, 1.0 ) ) * resolution ).xyz;",
      "vec4 rgbaM  = texture2D( tDiffuse,  gl_FragCoord.xy  * resolution );",
      "vec3 rgbM  = rgbaM.xyz;",
      "vec3 luma = vec3( 0.299, 0.587, 0.114 );",

      "float lumaNW = dot( rgbNW, luma );",
      "float lumaNE = dot( rgbNE, luma );",
      "float lumaSW = dot( rgbSW, luma );",
      "float lumaSE = dot( rgbSE, luma );",
      "float lumaM  = dot( rgbM,  luma );",
      "float lumaMin = min( lumaM, min( min( lumaNW, lumaNE ), min( lumaSW, lumaSE ) ) );",
      "float lumaMax = max( lumaM, max( max( lumaNW, lumaNE) , max( lumaSW, lumaSE ) ) );",

      "vec2 dir;",
      "dir.x = -((lumaNW + lumaNE) - (lumaSW + lumaSE));",
      "dir.y =  ((lumaNW + lumaSW) - (lumaNE + lumaSE));",

      "float dirReduce = max( ( lumaNW + lumaNE + lumaSW + lumaSE ) * ( 0.25 * FXAA_REDUCE_MUL ), FXAA_REDUCE_MIN );",

      "float rcpDirMin = 1.0 / ( min( abs( dir.x ), abs( dir.y ) ) + dirReduce );",
      "dir = min( vec2( FXAA_SPAN_MAX,  FXAA_SPAN_MAX),",
          "max( vec2(-FXAA_SPAN_MAX, -FXAA_SPAN_MAX),",
            "dir * rcpDirMin)) * resolution;",
      "vec4 rgbA = (1.0/2.0) * (",
          "texture2D(tDiffuse,  gl_FragCoord.xy  * resolution + dir * (1.0/3.0 - 0.5)) +",
      "texture2D(tDiffuse,  gl_FragCoord.xy  * resolution + dir * (2.0/3.0 - 0.5)));",
        "vec4 rgbB = rgbA * (1.0/2.0) + (1.0/4.0) * (",
      "texture2D(tDiffuse,  gl_FragCoord.xy  * resolution + dir * (0.0/3.0 - 0.5)) +",
          "texture2D(tDiffuse,  gl_FragCoord.xy  * resolution + dir * (3.0/3.0 - 0.5)));",
        "float lumaB = dot(rgbB, vec4(luma, 0.0));",

      "if ( ( lumaB < lumaMin ) || ( lumaB > lumaMax ) ) {",

        "gl_FragColor = rgbA;",

      "} else {",
        "gl_FragColor = rgbB;",

      "}",

    "}"

  ].join( "\n" )

};





export const init = () => {

// set afk status to false
window.onfocus= ()=>socket.emit("untime_me");

// start timer for player kick
window.onblur = ()=>socket.emit("time_me");

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

  //This is the object that follows the ball and keeps its z/y rotation
  //It casts rays outwards to detect objects for the player
  raycastReference = new THREE.Object3D();
  // raycastHeight = 1;
  // raycastReference.position.y = raycastHeight;
  scene.add(raycastReference);

  //Attach the camera to lock behind the ball
 // raycastReference.add(camera);
scene.add(camera)
  //setupCollisions(raycastReference);


  // shading
  renderer.shadowMap.enabled = true;
  renderer.shadowMapSoft = true;


  // store set playerID to socket.id from store
  // playerID = socket.id;


  // initialize Cannon world
  world = new CANNON.World();
  world.gravity.set(0, 0, 0);
  world.broadphase = new CANNON.NaiveBroadphase();


  // initialize all existing players in room
  let newPlayer, newFood;

  forOwn(players, (data, id) => {
    //console.log(data)
    let isMainPlayer = id === socket.id;
    newPlayer = new Player(id, data, isMainPlayer);
    newPlayer.init();
    // if (isMainPlayer) player = newPlayer;
  });

  forOwn(food, (data, id) => {
    newFood = new Food(id, data);
    newFood.init();
  });


  // Adjust friction between ball & ground
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

  createLevel();

  // add some fog
  //scene.fog = new THREE.Fog(myColors['blue'], 50, 950);


  // A hemiplane light is a gradient colored light;
  // the first parameter is the sky color, the second parameter is the ground color,
  // the third parameter is the intensity of the light
  hemisphereLight = new THREE.HemisphereLight("#004570", someColors["pink"], 0.8);

  // A directional light shines from a specific direction.
  // It acts like the sun, that means that all the rays produced are parallel.
  shadowLight = new THREE.DirectionalLight("#4ECDC4", 0.3);

  // Allow shadow casting
  shadowLight.castShadow = true;

  // define the visible area of the projected shadow
  shadowLight.shadow.camera.left = -400;
  shadowLight.shadow.camera.right = 400;
  shadowLight.shadow.camera.top = 400;
  shadowLight.shadow.camera.bottom = -400;
  shadowLight.shadow.camera.near = 1;
  shadowLight.shadow.camera.far = 1000;

  // define the resolution of the shadow; the higher the better,
  // but also the more expensive and less performant

  shadowLight.shadow.mapSize.width = 512;
  shadowLight.shadow.mapSize.height = 512;

  // to activate the lights, just add them to the scene
  scene.add(hemisphereLight);
  scene.add(shadowLight);

  // an ambient light modifies the global color of a scene and makes the shadows softer

  ambientLight = new THREE.AmbientLight(someColors['green'], 0.5);
  scene.add(ambientLight);


  loadGame();

 stats = new Stats();
stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild( stats.dom );





  var width = window.innerWidth || 1;
  var height = window.innerHeight || 1;
  var parameters = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat, stencilBuffer: false };

  var renderTarget = new THREE.WebGLRenderTarget( width, height, parameters );

  composer = new THREE.EffectComposer( renderer, renderTarget );
  composer.addPass( new THREE.RenderPass( scene, camera ) );

  var vignetteShader = new THREE.ShaderPass( THREE.VignetteShader );
  //vignetteShader.uniforms[ 'scale' ].value = 4;
  vignetteShader.renderToScreen = true;
  composer.addPass( vignetteShader );

  // Events
  window.addEventListener( 'resize', onWindowResize, false );
};

export function animate() {
   //   stats.begin();

    // monitored code goes here

   
  animateTimeout = setTimeout( function() {
    //console.log('looping');
        requestAnimationFrame( animate );  

        // this dispatch happens 30 times a second,
        // updating the local state with player's new info and emitting to server
        socket.emit('update_position', getMeshData(playerMesh));
    }, 1000 / 30 );
  let { gameState, players } = store.getState();

  if (!gameState.isPlaying) clearTimeout(animateTimeout);
  let playerMesh = scene.getObjectByName(socket.id);
  if (playerMesh) {
    //Updates the raycast reference so that it follows the position of the player
    raycastReference.position.set(playerMesh.position.x, playerMesh.position.y, playerMesh.position.z);

    var playerPosition = new THREE.Vector3(playerMesh.position.x, playerMesh.position.y, playerMesh.position.z);

    var playerNormalToPlanet = playerPosition.normalize();

    var quaternionOnPlanet = new THREE.Quaternion();
    quaternionOnPlanet.setFromUnitVectors(new THREE.Vector3(0,1,0), playerNormalToPlanet);

    raycastReference.quaternion.copy(quaternionOnPlanet);

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
  }

  loadEnvironment();
  render();
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

  // now create the individual particles
  for (var p = 0; p < particleCount; p++) {

    // create a particle with random
    // position values, -250 -> 250
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

  // add it to the scene
  scene.add(particleSystem);

   // ring creation
 // var ring_geometry = new THREE.RingGeometry( 2350, 2450, 30, 1 );
 // var ring_material = new THREE.MeshPhongMaterial( { color: "#F8B195", side: THREE.DoubleSide});
 // var ring = new THREE.Mesh( ring_geometry, ring_material );
 // scene.add(ring);

}

export { scene, camera, canvas, renderer, world, groundMaterial, ballMaterial, raycastReference, timeFromStart, clearTimeout };

// function botInit(){
  // const bot_geometry = new THREE.BoxGeometry(1,1,1);
  // const bot_material = new THREE.MeshBasicMaterial( {color: 0x7777ff, wireframe: false} );
  // const bot = new THREE.Mesh( bot_geometry, bot_material );

  // bot.position.x = 1;
  // bot.position.y = 0;
  // bot.position.z = 1;
  // scene.add(bot);

  // //create random directions for bot
  //   let reverseDirectionX;
  //   let reverseDirectionY;
  //   let direction;
  //   let counter = 0;
  //   function animate() {
  //     //counter 300 lopps then change direction
  //         if(counter%300===0){
  //           reverseDirectionX = Math.floor(Math.random()*2) == 1 ? 1 : -1;
  //           reverseDirectionY = Math.floor(Math.random()*2) == 1 ? 1 : -1;

  //           direction =  new THREE.Vector3(0.1*reverseDirectionX, 0, 0.2*reverseDirectionY); // amount to move per frame
  //           //counter=0;
  //         }
  //          console.log(direction);
  //         bot.position.add(direction); // add to position
  //         requestAnimationFrame(animate); // keep looping
  //         counter++
  //       }
  // requestAnimationFrame(animate);
// }

// function makeFood(){
//  const food_plane_geometry = new THREE.planeGeometry( 0.3 );
//  const food_plane_material = new THREE.MeshBasicMaterial( {color: 0x66669, wireframe: false} );

//  let gameBorderPosition = 100;

//  for (var i = 0; i < 10; i++) {
//    const food = new THREE.Mesh( food_plane_geometry, food_plane_material );

//    let xPostion = Math.floor(Math.random()*gameBorderPosition);
//    xPostion *= Math.floor(Math.random()*2) == 1 ? 1 : -1;

//    let zPostion = Math.floor(Math.random()*gameBorderPosition);
//    zPostion *= Math.floor(Math.random()*2) == 1 ? 1 : -1;

//    food.position.x = xPostion;
//    food.position.y = 0;
//    food.position.z = zPostion;
//    scene.add( food );
//  }
// };
