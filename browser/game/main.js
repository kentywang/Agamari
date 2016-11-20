const THREE = require('three');
const CANNON = require('../../public/cannon.min.js');
let scene, camera, canvas, renderer, sphere;
let world;

import store from '../store';
import { loadGame, player } from './game';
import {controls} from './player';
import {updateLocation} from '../reducers/gameState';

let playerID;

// variables for physics
var time;
var lastTime;
var fixedTimeStep = 1.0 / 60.0; // seconds
var maxSubSteps = 3;


export const init = () => {
  // initialize THREE scene, camera, renderer
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
  camera.position.z = 5;
  canvas = document.getElementById('canvas');
  renderer = new THREE.WebGLRenderer({alpha: true, canvas});
  renderer.setSize( window.innerWidth, window.innerHeight );

  // store set playerID to socket.id from store
  playerID = store.getState().auth.id;

  // initialize Cannon world
  world = new CANNON.World();
  world.gravity.set(0,0,-10);
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

  // create THREE plane
  let { color } = store.getState().gameState;
  var sphere_geometry = new THREE.PlaneGeometry( 100,100 );
  var sphere_material = new THREE.MeshBasicMaterial( { color });
  sphere = new THREE.Mesh( sphere_geometry, sphere_material );
  sphere.rotation.set(-Math.PI/2, Math.PI/2000, Math.PI); 

  scene.add( sphere );
  
  // create Cannon plane
  var groundShape = new CANNON.Plane();
  var groundBody = new CANNON.Body({ mass: 0, shape: groundShape });
  world.add(groundBody);




  loadGame();

  //console.log(scene);

  // Events
  window.addEventListener( "resize", onWindowResize, false );

}

export function animate() {
  requestAnimationFrame( animate );

  if ( controls ) {
    controls.update();
  }

  // sync THREE mesh with Cannon mesh
  // Cannon's z seems to by Three's y, and vice versa
  player.mesh.position.x = player.cannonMesh.position.x;
  player.mesh.position.z = player.cannonMesh.position.y;
  player.mesh.position.y = player.cannonMesh.position.z;
  player.mesh.quaternion.x = player.cannonMesh.quaternion.x;
  player.mesh.quaternion.y = player.cannonMesh.quaternion.y;
  player.mesh.quaternion.z = player.cannonMesh.quaternion.z;
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


export { scene, camera, canvas, renderer, playerID, sphere, world };
