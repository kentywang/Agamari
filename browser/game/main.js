import store from '../store';
import { loadGame } from './game';

import {controls, Player} from './player';
import {Food} from './food';
import {socket} from '../components/App';
import { forOwn } from 'lodash';

const THREE = require('three');
const CANNON = require('../../public/cannon.min.js');


let scene, camera, canvas, renderer, plane;
let world, groundMaterial, shadowLight;


let player;

// our color pallet
var myColors = {
  grey: '#556270',
  green: '#C7F464',
  blue: '#4ECDC4',
  pink: '#FF6B6B',
  red: '#C44D58'
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
  renderer.shadowMap.enabled = true;
  renderer.shadowMapSoft = true;


  // store set playerID to socket.id from store
  // playerID = socket.id;


  // initialize Cannon world
  world = new CANNON.World();
  world.gravity.set(0, 0, -200);
  world.broadphase = new CANNON.NaiveBroadphase();


  // initialize all existing players in room
  let { players, food } = store.getState();
  let newPlayer, newFood;

  forOwn(players, (data, id) => {
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
  var ground_ground_cm = new CANNON.ContactMaterial(groundMaterial, groundMaterial, {
      friction: .5,
      restitution: 0.2,
      contactEquationStiffness: 1e8,
      contactEquationRelaxation: 3,
      frictionEquationStiffness: 1e8,
      frictionEquationRegularizationTime: 3,
  });
  world.addContactMaterial(ground_ground_cm);


  // create THREE plane
  var box_geometry = new THREE.BoxGeometry( 400, 5, 400 );
  var box_material = new THREE.MeshPhongMaterial( { color: myColors['blue'], shading: THREE.FlatShading});
  plane = new THREE.Mesh( box_geometry, box_material );

  plane.receiveShadow = true;

  scene.add( plane );


  // create Cannon plane
  var groundShape = new CANNON.Box(new CANNON.Vec3(200, 200, 2.5));
  var groundBody = new CANNON.Body({ mass: 0, material: groundMaterial, shape: groundShape });

  world.add(groundBody);


  // add some fog
  scene.fog = new THREE.Fog(myColors['blue'], 50, 950);


  // add lighting
  var hemisphereLight;

  // A hemiplane light is a gradient colored light;
  // the first parameter is the sky color, the second parameter is the ground color,
  // the third parameter is the intensity of the light
  hemisphereLight = new THREE.HemisphereLight(0xaaaaaa, 0x000000, 0.9);

  // A directional light shines from a specific direction.
  // It acts like the sun, that means that all the rays produced are parallel.
  shadowLight = new THREE.DirectionalLight(0xffffff, 0.9);

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

  shadowLight.shadow.mapSize.width = 1024;
  shadowLight.shadow.mapSize.height = 1024;

  // to activate the lights, just add them to the scene
  scene.add(hemisphereLight);
  scene.add(shadowLight);

  // an ambient light modifies the global color of a scene and makes the shadows softer
  var ambientLight = new THREE.AmbientLight(myColors['red'], 0.5);
  scene.add(ambientLight);


  loadGame();


  //botInit();

  // Events
  window.addEventListener( 'resize', onWindowResize, false );
};

export function animate() {
  requestAnimationFrame( animate );
  //console.log('scene', scene);
  let playerMesh = scene.getObjectByName(socket.id);
  let cannonMesh = playerMesh.cannon;
  // Set the direction of the light
  shadowLight.position.set(playerMesh.position.x + 150, playerMesh.position.y + 300, playerMesh.position.z + 150);


  // receive and process controls and camera
  if ( controls ) {
    controls.update();
  }

  // sync THREE mesh with Cannon mesh
  // Cannon's y & z are swapped from THREE, and w is flipped
  playerMesh.position.x = cannonMesh.position.x;
  playerMesh.position.z = cannonMesh.position.y;
  playerMesh.position.y = cannonMesh.position.z;
  playerMesh.quaternion.x = -cannonMesh.quaternion.x;
  playerMesh.quaternion.z = -cannonMesh.quaternion.y;
  playerMesh.quaternion.y = -cannonMesh.quaternion.z;
  playerMesh.quaternion.w = cannonMesh.quaternion.w;


 let { players } = store.getState();


  // for all other players
  forOwn(players, (currentPlayer, id) => {
    let playerObject = scene.getObjectByName(id);
    if (currentPlayer !== socket.id && playerObject) {
      playerObject.cannon.position.x = playerObject.position.x;
      playerObject.cannon.position.z = playerObject.position.y;
      playerObject.cannon.position.y = playerObject.position.z;
      playerObject.cannon.quaternion.x = -playerObject.quaternion.x;
      playerObject.cannon.quaternion.z = -playerObject.quaternion.y;
      playerObject.cannon.quaternion.y = -playerObject.quaternion.z;
      playerObject.cannon.quaternion.w = playerObject.quaternion.w;
    }
  });

  // run physics
  time = Date.now();
  if (lastTime !== undefined) {
     var dt = (time - lastTime) / 1000;
     world.step(fixedTimeStep, dt, maxSubSteps);
  }
  lastTime = time;

  const getMeshData = mesh => {
    return {
      x: mesh.position.x,
      y: mesh.position.y,
      z: mesh.position.z,
      rx: mesh.rotation.x,
      ry: mesh.rotation.y,
      rz: mesh.rotation.z
    };
  };


  // this dispatch happens 60 times a second, updating the local state with player's new info and emitting to server
  // let prevData = players[player.id];
  // let currData = player.getPlayerData();
  socket.emit('update_position', getMeshData(playerMesh));

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


export { scene, camera, canvas, renderer, player, plane, world, groundMaterial, myColors };

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
