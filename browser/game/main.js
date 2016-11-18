const THREE = require('three');
let scene, camera, canvas, renderer;

import { loadGame } from './game';
import {controls} from './player';

export const init = () => {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
  camera.position.z = 5;

  canvas = document.getElementById('canvas');

  renderer = new THREE.WebGLRenderer({alpha: true, canvas});
  renderer.setSize( window.innerWidth, window.innerHeight );

  loadGame();

  // Events
  window.addEventListener( "resize", onWindowResize, false );
}

export function animate() {
  requestAnimationFrame( animate );

  if ( controls ) {
    controls.update();
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


export { scene, camera, canvas, renderer };