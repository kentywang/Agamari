import store from '../store';
import {updateLocation} from '../reducers/gameState';
import { loadGame, player } from './game';
import {controls} from './player';

const THREE = require('three');
const CANNON = require('../../public/cannon.min.js');

let scene, camera, canvas, renderer, plane;
let world, groundMaterial, shadowLight;

let playerID;

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

// food (dev only)
let cone, coneBody;
let cone2, coneBody2;
let cone3, coneBody3;

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
  playerID = store.getState().auth.id;


  // initialize Cannon world
  world = new CANNON.World();
  world.gravity.set(0,0,-200);
  world.broadphase = new CANNON.NaiveBroadphase();


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

  var box_geometry = new THREE.BoxGeometry( 200, 5, 200 );
  var box_material = new THREE.MeshPhongMaterial( { color: myColors['blue'] , shading:THREE.FlatShading});
  plane = new THREE.Mesh( box_geometry, box_material );

  plane.receiveShadow = true;

  scene.add( plane );
  

  // create Cannon plane
  var groundShape = new CANNON.Box(new CANNON.Vec3(100,100,2.5));
  var groundBody = new CANNON.Body({ mass: 0, material: groundMaterial, shape: groundShape });


  world.add(groundBody);





  // create THREE food (for dev build only)
  var cone_geometry = new THREE.BoxGeometry( 4, 4, 4 );
  var cone_material = new THREE.MeshPhongMaterial( { color: myColors['blue'] , shading:THREE.FlatShading});
  cone = new THREE.Mesh( cone_geometry, cone_material );
  var cone_geometry2 = new THREE.TetrahedronGeometry(4,2);
  cone2 = new THREE.Mesh( cone_geometry2, cone_material );
  var cone_geometry3 = new THREE.BoxGeometry( 5, 2, 2 );
  cone3 = new THREE.Mesh( cone_geometry3, cone_material );

  cone.castShadow = true;
  cone2.castShadow = true;
  cone3.castShadow = true;
  cone.position.set(60,10,0);
    cone2.position.set(-50,10,0);
      cone3.position.set(90,10,0);

  scene.add( cone );
    scene.add( cone2 );
      scene.add( cone3 );

  
  // create Cannon food
  var coneShape = new CANNON.Box(new CANNON.Vec3(2,2,2));
  coneBody = new CANNON.Body({ mass: 0, material: groundMaterial, shape: coneShape });

  coneBody.position.x = cone.position.x;
  coneBody.position.z = cone.position.y;
  coneBody.position.y = cone.position.z;
  world.add(coneBody);

  var coneShape2 = new CANNON.Sphere(4);
  coneBody2 = new CANNON.Body({ mass: 0, material: groundMaterial, shape: coneShape2 });

  coneBody2.position.x = cone2.position.x;
  coneBody2.position.z = cone2.position.y;
  coneBody2.position.y = cone2.position.z;
  world.add(coneBody2);

  var coneShape3 = new CANNON.Box(new CANNON.Vec3(2.5,1,1));
  coneBody3 = new CANNON.Body({ mass: 0, material: groundMaterial, shape: coneShape3 });

  coneBody3.position.x = cone3.position.x;
  coneBody3.position.z = cone3.position.y;
  coneBody3.position.y = cone3.position.z;
  world.add(coneBody3);

  coneBody.addEventListener("collide", function(e){
    world.remove(coneBody);


    // hell yes. -- Kenty
    player.cannonMesh.addShape(coneShape, player.cannonMesh.quaternion.inverse().vmult(new CANNON.Vec3(cone.position.x - player.mesh.position.x,cone.position.z - player.mesh.position.z,cone.position.y - player.mesh.position.y)), player.cannonMesh.quaternion.inverse());

    cone.position.set( cone.position.x - player.mesh.position.x,cone.position.y - player.mesh.position.y,cone.position.z - player.mesh.position.z )

    var pivot1 = new THREE.Object3D();
    pivot1.quaternion.z = player.mesh.quaternion.z;
    pivot1.quaternion.x = player.mesh.quaternion.x;
    pivot1.quaternion.y = player.mesh.quaternion.y;
    pivot1.quaternion.w = -player.mesh.quaternion.w;

    pivot1.add(cone);
    player.mesh.add(pivot1);
  } );

  coneBody2.addEventListener("collide", function(e){
    world.remove(coneBody2);


    // hell yes. -- Kenty
    player.cannonMesh.addShape(coneShape, player.cannonMesh.quaternion.inverse().vmult(new CANNON.Vec3(cone2.position.x - player.mesh.position.x,cone2.position.z - player.mesh.position.z,cone2.position.y - player.mesh.position.y)), player.cannonMesh.quaternion.inverse());

    cone2.position.set( cone2.position.x - player.mesh.position.x,cone2.position.y - player.mesh.position.y,cone2.position.z - player.mesh.position.z )

    var pivot1 = new THREE.Object3D();
    pivot1.quaternion.z = player.mesh.quaternion.z;
    pivot1.quaternion.x = player.mesh.quaternion.x;
    pivot1.quaternion.y = player.mesh.quaternion.y;
    pivot1.quaternion.w = -player.mesh.quaternion.w;

    pivot1.add(cone2);
    player.mesh.add(pivot1);
  } );
var stop = false;
  coneBody3.addEventListener("collide", function(e){
    console.log("......aaaaaarttt!")
   if(stop){return}
    stop= true;
    world.remove(coneBody3);


    // hell yes. -- Kenty
    player.cannonMesh.addShape(coneShape, player.cannonMesh.quaternion.inverse().vmult(new CANNON.Vec3(cone3.position.x - player.mesh.position.x,cone3.position.z - player.mesh.position.z,cone3.position.y - player.mesh.position.y)), player.cannonMesh.quaternion.inverse());

    cone3.position.set( cone3.position.x - player.mesh.position.x,cone3.position.y - player.mesh.position.y,cone3.position.z - player.mesh.position.z )

    var pivot1 = new THREE.Object3D();
    pivot1.quaternion.z = player.mesh.quaternion.z;
    pivot1.quaternion.x = player.mesh.quaternion.x;
    pivot1.quaternion.y = player.mesh.quaternion.y;
    pivot1.quaternion.w = -player.mesh.quaternion.w;

    pivot1.add(cone3);
    player.mesh.add(pivot1);
  } );




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




  // Events
  window.addEventListener( "resize", onWindowResize, false );
}

export function animate() {
  requestAnimationFrame( animate );

  // check if fallen off plane
  if(player.mesh.position.y < -5){
    alert("game over");
  }


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
  //console.log("hello");

  // run physics
  time = Date.now()
  if(lastTime !== undefined){
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


export { scene, camera, canvas, renderer, playerID, plane, world, groundMaterial, myColors };