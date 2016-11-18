const THREE = require('three');
import store from '../store';

import { scene, camera, canvas, renderer } from './main';


export const loadGame = () => {
  let { color } = store.getState().gameState;
  const geometry = new THREE.BoxGeometry( 1, 1, 1 );
  const material = new THREE.MeshBasicMaterial( { color } );
  const cube = new THREE.Mesh( geometry, material );
  scene.add( cube );
}


// const THREE = require('three');
// import store from '../store';

// export const loadGame = ({color}) => {
//   let state = store.getState();
//   let scene = state.scene;
//   console.log(state);
//   const geometry = new THREE.BoxGeometry( 1, 1, 1 );
//   const material = new THREE.MeshBasicMaterial( { color } );
//   const cube = new THREE.Mesh( geometry, material );
//   scene.add( cube );
// }
