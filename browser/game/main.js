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

let scene, camera, canvas, renderer;
let world, groundMaterial, shadowLight;
let geometry, material, groundShape, groundBody, hemisphereLight, ambientLight;
// variables for physics
let time, lastTime;
// camera
let raycastReference, raycastHeight;

export const init = () => {
  let { players, food } = store.getState();
  // initialize THREE scene, camera, renderer
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(65,
                                       window.innerWidth / window.innerHeight,
                                       1,
                                       1000);

  canvas = document.getElementById('canvas');

  renderer = new THREE.WebGLRenderer({alpha: true, canvas});
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize(window.innerWidth / 2,
                   window.innerHeight / 2,
                   false);

  //This is the object that follows the ball and keeps its z/y rotation
  //It casts rays outwards to detect objects for the player
  raycastReference = new THREE.Object3D();
  // raycastHeight = 1;
  // raycastReference.position.y = raycastHeight;
  scene.add(raycastReference);

  //Attach the camera to lock behind the ball
  raycastReference.add(camera);

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
  var groundGroundCm = new CANNON.ContactMaterial(groundMaterial, groundMaterial, {
      friction: 0.9,
      restitution: 0.0,
      contactEquationStiffness: 1e8,
      contactEquationRelaxation: 3,
      frictionEquationStiffness: 1e8,
      frictionEquationRegularizationTime: 3,
  });
  world.addContactMaterial(groundGroundCm);

  createLevel();

  // add some fog
  //scene.fog = new THREE.Fog(myColors['blue'], 50, 950);


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

  ambientLight = new THREE.AmbientLight(myColors['green'], 0.5);
  scene.add(ambientLight);

  loadGame();

  //botInit();

  // Events
  window.addEventListener( 'resize', onWindowResize, false );
};

export function animate() {
  requestAnimationFrame( animate );
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
    shadowLight.position.set(playerMesh.position.x + 150, playerMesh.position.y + 300, playerMesh.position.z + 150);

    // receive and process controls and camera
    if ( controls ) controls.update();

    // sync THREE mesh with Cannon mesh
    // Cannon's y & z are swapped from THREE, and w is flipped
  if (playerMesh.cannon) setMeshPosition(playerMesh);

   let { players } = store.getState();


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

  // this dispatch happens 60 times a second,
  // updating the local state with player's new info and emitting to server
  socket.emit('update_position', getMeshData(playerMesh));

  loadEnvironment();
  render();
}

function render() {
  renderer.clear();
  renderer.render( scene, camera );
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize(window.innerWidth / 2,
                   window.innerHeight / 2,
                   false);
}

function createLevel(){
 // planet creation
 var planet_geometry = new THREE.SphereGeometry( 400, 8, 8 );
 var planet_material = new THREE.MeshPhongMaterial( { color: myColors['pink'], shading: THREE.FlatShading});
 var planet = new THREE.Mesh( planet_geometry, planet_material );

  planet.receiveShadow = true;

 scene.add(planet);

 // create THREE plane
  var box_geometry = new THREE.BoxGeometry( 200, 5, 1000 );
  var box_geometry2 = new THREE.BoxGeometry( 600, 5, 200 );
  var box_material = new THREE.MeshPhongMaterial( { color: myColors['blue'], shading: THREE.FlatShading});
  var plane = new THREE.Mesh( box_geometry, box_material );
  var plane2 = new THREE.Mesh( box_geometry, box_material );
  var plane3 = new THREE.Mesh( box_geometry2, box_material );
  var plane4 = new THREE.Mesh( box_geometry2, box_material );
  plane.position.set(0,450,0);
  plane2.position.set(800,450,0);
  plane3.position.set(400,450,400);
  plane4.position.set(400,450,-400);

  plane.receiveShadow = true;
  plane2.receiveShadow = true;
  plane3.receiveShadow = true;
  plane4.receiveShadow = true;

  var topPlane = new THREE.Group();

  //topPlane.add( plane );
  topPlane.add( plane2 );
  topPlane.add( plane3 );
  topPlane.add( plane4 );

  scene.add(topPlane);

  // create Cannon planet
  var planetShape = new CANNON.Sphere(400);
  var planetBody = new CANNON.Body({ mass: 0, material: groundMaterial, shape: planetShape });
  world.add(planetBody);

  // create Cannon plane
  var groundShape = new CANNON.Box(new CANNON.Vec3(100, 500, 2.5));
  var groundShape2 = new CANNON.Box(new CANNON.Vec3(300, 100, 2.5));
  var groundBody = new CANNON.Body({ mass: 0, material: groundMaterial, shape: groundShape });
  var groundBody2 = new CANNON.Body({ mass: 0, material: groundMaterial, shape: groundShape });
  var groundBody3 = new CANNON.Body({ mass: 0, material: groundMaterial, shape: groundShape2 });
  var groundBody4 = new CANNON.Body({ mass: 0, material: groundMaterial, shape: groundShape2 });

  groundBody.position.set(0,0,450);
  groundBody2.position.set(800,0,450);
  groundBody3.position.set(400,400,450);
  groundBody4.position.set(400,-400,450);

 // world.add(groundBody);
  world.add(groundBody2);
  world.add(groundBody3);
  world.add(groundBody4);
}

export { scene, camera, canvas, renderer, world, groundMaterial, myColors, raycastReference };

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
