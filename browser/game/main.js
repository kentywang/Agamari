const THREE = require('three');
const CANNON = require('../../public/cannon.min.js');

import { forOwn } from 'lodash';
import { getMeshData, setCannonPosition, setMeshPosition } from './utils';
import { myColors, fixedTimeStep, maxSubSteps } from './config';
import store from '../store';
// import socket from '../socket';
import { emit } from '../reducers/user';
import { loadGame, loadEnvironment } from './game';
import {controls, Player} from './player';
import { Food } from './food';

let scene, camera, canvas, renderer, plane;
let world, groundMaterial, shadowLight;
let geometry, material, groundShape, groundBody, hemisphereLight, ambientLight;
// variables for physics
let time, lastTime;
// camera
let raycastReference, raycastHeight;

export const init = () => {
  let { user, players, food } = store.getState();
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
    raycastHeight = 1;
    raycastReference.position.y = raycastHeight;
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
    world.gravity.set(0, 0, -200);
    world.broadphase = new CANNON.NaiveBroadphase();


    // initialize all existing players in room
    let newPlayer, newFood;
    console.log('players', players);
    forOwn(players, (data, id) => {
      let isMainPlayer = id == user.id;
      newPlayer = new Player(id, data, isMainPlayer);
      console.log('created player', newPlayer);
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
        friction: 0.5,
        restitution: 0.2,
        contactEquationStiffness: 1e8,
        contactEquationRelaxation: 3,
        frictionEquationStiffness: 1e8,
        frictionEquationRegularizationTime: 3,
    });
    world.addContactMaterial(groundGroundCm);


    // create THREE plane
    geometry = new THREE.BoxGeometry( 800, 5, 800 );
    material = new THREE.MeshPhongMaterial( { color: myColors['blue'], shading: THREE.FlatShading});
    plane = new THREE.Mesh( geometry, material );

    plane.receiveShadow = true;

    scene.add( plane );


    // create Cannon plane
    groundShape = new CANNON.Box(new CANNON.Vec3(400, 400, 2.5));
    groundBody = new CANNON.Body({ mass: 0, material: groundMaterial, shape: groundShape });

    world.add(groundBody);


    // add some fog
    scene.fog = new THREE.Fog(myColors['blue'], 50, 950);


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
    ambientLight = new THREE.AmbientLight(myColors['red'], 0.5);
    scene.add(ambientLight);

    loadGame();

    //botInit();

    // Events
    window.addEventListener( 'resize', onWindowResize, false );
};

export function animate() {
  let { user, players } = store.getState();
  requestAnimationFrame( animate );
  let playerMesh = scene.getObjectByName(user.id.toString());
    //Updates the raycast reference so that it follows the position of the player
    raycastReference.position.set(playerMesh.position.x, raycastHeight, playerMesh.position.z);

    // Set the direction of the light
    shadowLight.position.set(playerMesh.position.x + 150, playerMesh.position.y + 300, playerMesh.position.z + 150);

    // receive and process controls and camera
    if ( controls ) controls.update();

    // sync THREE mesh with Cannon mesh
    // Cannon's y & z are swapped from THREE, and w is flipped
  if (playerMesh.cannon) setMeshPosition(playerMesh);


    // for all other players
    forOwn(players, (currentPlayer, id) => {
      let currentMesh = scene.getObjectByName(id);
      if (currentPlayer !== user.id && currentMesh) setCannonPosition(currentMesh);
    });

    // run physics
    time = Date.now();
    if (lastTime !== undefined) {
       let dt = (time - lastTime) / 1000;
       world.step(fixedTimeStep, dt, maxSubSteps);
    }
    lastTime = time;
    // this dispatch happens 60 times a second,
    // updating the local state with player's new info and emitting to server
    emit('update_position', getMeshData(playerMesh));

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

export const resetScene = () => {
  scene = null;
  camera = null;
  canvas = null;
  renderer = null;
  plane = null;
  world = null;
  groundMaterial = null;
  raycastReference = null;
}

export { scene, camera, canvas, renderer, plane, world, groundMaterial, myColors, raycastReference };

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
