const THREE = require('three');
const CANNON = require('../../public/cannon.min.js');
const TargetCamera = require('../../public/THREE.TargetCamera.min.js');
let scene, camera, canvas, renderer, sphere;
let world, groundMaterial;

import store from '../store';
import { loadGame, player } from './game';
import {controls} from './player';
import {updateLocation} from '../reducers/gameState';

let playerID;

// color pallet
var myColors = {
  brown:"#666547",
  red:"#fb2e01",
  teal:"#6fcb9f",
  pale:"#ffe28a",
  yellow:"#fffeb3"
};

// variables for physics
var time;
var lastTime;
var fixedTimeStep = 1.0 / 60.0; // seconds
var maxSubSteps = 3;


export const init = () => {
  // initialize THREE scene, camera, renderer
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 500 );
  canvas = document.getElementById('canvas');
  renderer = new THREE.WebGLRenderer({alpha: true, canvas});
  renderer.setSize( window.innerWidth, window.innerHeight );

  // shading
  renderer.shadowMapEnabled = true;
  renderer.shadowMapSoft = true;

  // store set playerID to socket.id from store
  playerID = store.getState().auth.id;

  // initialize Cannon world
  world = new CANNON.World();
  world.gravity.set(-3,-3,-10);
  world.broadphase = new CANNON.NaiveBroadphase();






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

  // initialize all existing players in room
  let { auth } = store.getState();
  let { players } = store.getState().gameState;
  let newPlayer;

  for (let player in players){
    if(player != auth.id){
          newPlayer = new Player(player);
          newPlayer.init();
    }
  }


  // define contact friction between 
  // Adjust constraint equation parameters for ground/ground contact
  groundMaterial = new CANNON.Material("groundMaterial");
  var ground_ground_cm = new CANNON.ContactMaterial(groundMaterial, groundMaterial, {
      friction: .9,
      restitution: 0.2,
      contactEquationStiffness: 1e8,
      contactEquationRelaxation: 3,
      frictionEquationStiffness: 1e8,
      frictionEquationRegularizationTime: 3,
  });
  // Add contact material to the world
  world.addContactMaterial(ground_ground_cm);

  // create THREE planet
  // let { color } = store.getState().gameState;
  // var sphere_geometry = new THREE.SphereGeometry( 30, 32, 32 );
  // var sphere_material = new THREE.MeshPhongMaterial( { color: myColors['red'] , shading:THREE.FlatShading});
  // sphere = new THREE.Mesh( sphere_geometry, sphere_material );
  // sphere.receiveShadow = true;
  let { color } = store.getState().gameState;
  var sphere_geometry = new THREE.PlaneGeometry( 20, 20 );
  var sphere_material = new THREE.MeshPhongMaterial( { color: myColors['red'] , shading:THREE.FlatShading});
  sphere = new THREE.Mesh( sphere_geometry, sphere_material );
  sphere.receiveShadow = true;
  sphere.rotation.set(-Math.PI/2, Math.PI/2000, Math.PI); 

  scene.add( sphere );
  
  // create Cannon planet
  // var groundShape = new CANNON.Sphere(30);
  // var groundBody = new CANNON.Body({ mass: 0, material: groundMaterial, shape: groundShape });
  // world.add(groundBody);
  var groundShape = new CANNON.Plane();
  var groundBody = new CANNON.Body({ mass: 0, material: groundMaterial, shape: groundShape });
  world.add(groundBody);

  // add some fog
  scene.fog = new THREE.Fog(myColors['pale'], 50, 950);

  // create ground so I know which direction is up...
  // var arst = new THREE.PlaneGeometry( 1000,1000 );
  // var aarst = new THREE.MeshBasicMaterial( {color: myColors['pale']});
  // var corgi = new THREE.Mesh( arst, aarst );
  // corgi.position.set(0,-100,0)
  // corgi.rotation.set(-Math.PI/2, Math.PI/2000, Math.PI); 
  // scene.add( corgi );


  // add lighting
  var hemisphereLight, shadowLight;

  // A hemisphere light is a gradient colored light; 
  // the first parameter is the sky color, the second parameter is the ground color, 
  // the third parameter is the intensity of the light
  hemisphereLight = new THREE.HemisphereLight(0xaaaaaa,0x000000, .9)
  
  // A directional light shines from a specific direction. 
  // It acts like the sun, that means that all the rays produced are parallel. 
  shadowLight = new THREE.DirectionalLight(0xffffff, .9);

  // Set the direction of the light  
  shadowLight.position.set(0, 60, 20);
  
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
  shadowLight.shadow.mapSize.width = 2048;
  shadowLight.shadow.mapSize.height = 2048;
  
  // to activate the lights, just add them to the scene
  scene.add(hemisphereLight);  
  scene.add(shadowLight);

  // an ambient light modifies the global color of a scene and makes the shadows softer
var ambientLight = new THREE.AmbientLight(0xdc8874, .5);
scene.add(ambientLight);






  loadGame();

  //console.log(scene);

  // Events
  window.addEventListener( "resize", onWindowResize, false );

}

export function animate() {
  requestAnimationFrame( animate );

  // update camera position
  // camera.update();


  // receive and process controls
  if ( controls ) {
    controls.update();
  }

  // sync THREE mesh with Cannon mesh
  // Cannon's yz are swapped, and w is flipped
  player.mesh.position.x = player.cannonMesh.position.x;
  player.mesh.position.z = player.cannonMesh.position.y;
  player.mesh.position.y = player.cannonMesh.position.z;
  player.mesh.quaternion.x = -player.cannonMesh.quaternion.x;
  player.mesh.quaternion.z = -player.cannonMesh.quaternion.y;
  player.mesh.quaternion.y = -player.cannonMesh.quaternion.z;
  player.mesh.quaternion.w = player.cannonMesh.quaternion.w;
  //console.log(player.cannonMesh.position, player.cannonMesh.quaternion)

  // run physics
  time = Date.now()
  if(lastTime !== undefined){
    //console.log("running phys")
     var dt = (time - lastTime) / 1000;
     world.step(fixedTimeStep, dt, maxSubSteps);
  }
  lastTime = time;

  // this dispatch happens 60 times a second, updating the local state with player's new info and emitting to server
  let prevData = store.getState().gameState.players[player.playerID];
  let currData = player.getPlayerData();
  if (JSON.stringify(prevData) !== JSON.stringify(currData)) {
    let action = updateLocation(player.playerID, player.getPlayerData());
    store.dispatch(action);
    store.getState().socket.emit('state_changed', action);
  }
  render();
}

function render() {

  renderer.clear();
  renderer.render( scene, camera );
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );
}


export { scene, camera, canvas, renderer, playerID, sphere, world, groundMaterial, myColors };
