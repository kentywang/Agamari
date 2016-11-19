const THREE = require('three');
let scene, camera, canvas, renderer, sphere;

import store from '../store';
import { loadGame, player } from './game';
import {controls} from './player';
import {updateLocation} from '../reducers/gameState';

let playerID;

export const init = () => {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
  camera.position.z = 5;

  canvas = document.getElementById('canvas');

  renderer = new THREE.WebGLRenderer({alpha: true, canvas});
  renderer.setSize( window.innerWidth, window.innerHeight );

  playerID = store.getState().auth.id;


  // Events
  window.addEventListener( "resize", onWindowResize, false );

  let { color } = store.getState().gameState;
  var sphere_geometry = new THREE.SphereGeometry( 1 );
  var sphere_material = new THREE.MeshBasicMaterial( { color });
  sphere = new THREE.Mesh( sphere_geometry, sphere_material );
  loadGame();

  scene.add( sphere );
  console.log(scene);
}

export function animate() {
  requestAnimationFrame( animate );

  if ( controls ) {
    controls.update();
  }

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


export { scene, camera, canvas, renderer, playerID, sphere };
