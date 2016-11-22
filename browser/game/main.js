import store from '../store';
import {updateLocation} from '../reducers/gameState';
import { loadGame, player } from './game';

import {controls, Player} from './player';
import {Food} from './food';
import {socket} from '../components/App';


const THREE = require('three');
const CANNON = require('../../public/cannon.min.js');

let scene, camera, canvas, renderer, plane;
let world, groundMaterial, shadowLight;


// our color pallet
var myColors = {
  grey:"#556270",
  green:"#C7F464",
  blue:"#4ECDC4",
  pink:"#FF6B6B",
  red:"#C44D58"
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



  // initialize Cannon world
  world = new CANNON.World();
  world.gravity.set(0,0,-200);
  world.broadphase = new CANNON.NaiveBroadphase();


  // initialize all existing players in room
  let { auth } = store.getState();
  let { players } = store.getState().gameState;
  let newPlayer;

  for (let player in players){
    if(player != socket.id){
          newPlayer = new Player(player);
          newPlayer.init();
    }
  }


  // initialize all existing food in room
  let { food } = store.getState().gameState;
  //console.log("fooding", food)
  let newFood;

  food.forEach((item, index)=>{
    newFood = new Food(item, index);
    newFood.init();
  });


  // Adjust friction between ball & ground
  groundMaterial = new CANNON.Material("groundMaterial");
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
  let { color } = store.getState().gameState;

  var box_geometry = new THREE.BoxGeometry( 400, 5, 400 );
  var box_material = new THREE.MeshPhongMaterial( { color: myColors['blue'] , shading:THREE.FlatShading});
  plane = new THREE.Mesh( box_geometry, box_material );

  plane.receiveShadow = true;

  scene.add( plane );


  // create Cannon plane
  var groundShape = new CANNON.Box(new CANNON.Vec3(200,200,2.5));
  var groundBody = new CANNON.Body({ mass: 0, material: groundMaterial, shape: groundShape });

  world.add(groundBody);


  // add some fog
  scene.fog = new THREE.Fog(myColors['blue'], 50, 950);


  // add lighting
  var hemisphereLight;

  // A hemiplane light is a gradient colored light;
  // the first parameter is the sky color, the second parameter is the ground color,
  // the third parameter is the intensity of the light
  hemisphereLight = new THREE.HemisphereLight(0xaaaaaa,0x000000, .9)

  // A directional light shines from a specific direction.
  // It acts like the sun, that means that all the rays produced are parallel.
  shadowLight = new THREE.DirectionalLight(0xffffff, .9);

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
  var ambientLight = new THREE.AmbientLight(myColors["red"], .5);
  scene.add(ambientLight);


  loadGame();


  //botInit();

  // Events
  window.addEventListener( "resize", onWindowResize, false );
}

export function animate() {
  requestAnimationFrame( animate );


  // Set the direction of the light
  shadowLight.position.set(player.mesh.position.x + 150, player.mesh.position.y + 300, player.mesh.position.z + 150);


  // receive and process controls and camera
  if ( controls ) {
    controls.update();
  }

  // sync THREE mesh with Cannon mesh
  // Cannon's y & z are swapped from THREE, and w is flipped
  player.mesh.position.x = player.cannonMesh.position.x;
  player.mesh.position.z = player.cannonMesh.position.y;
  player.mesh.position.y = player.cannonMesh.position.z;
  player.mesh.quaternion.x = -player.cannonMesh.quaternion.x;
  player.mesh.quaternion.z = -player.cannonMesh.quaternion.y;
  player.mesh.quaternion.y = -player.cannonMesh.quaternion.z;
  player.mesh.quaternion.w = player.cannonMesh.quaternion.w;


  // run physics
  time = Date.now()
  if(lastTime !== undefined){
     var dt = (time - lastTime) / 1000;
     world.step(fixedTimeStep, dt, maxSubSteps);
  }
  lastTime = time;


  // this dispatch happens 60 times a second, updating the local state with player's new info and emitting to server
  let prevData = store.getState().gameState.players[player.id];
  let currData = player.getPlayerData();
  if (JSON.stringify(prevData) !== JSON.stringify(currData)) {
    let action = updateLocation(player.id, player.getPlayerData());
    store.dispatch(action);
    socket.emit('state_changed', action);
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


export { scene, camera, canvas, renderer, plane, world, groundMaterial, myColors };

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
