const THREE = require('three');
let scene, camera, canvas, renderer;
import { loadGame } from './game';

export const init = () => {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
  camera.position.z = 5;

  canvas = document.getElementById('canvas');

  renderer = new THREE.WebGLRenderer({alpha: true, canvas});
  renderer.setSize( window.innerWidth, window.innerHeight );

  function render() {
    loadGame();
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }

  render();
}
// init({color:'blue'});

export { scene, camera, canvas, renderer };

// export const init = ({color}) => {
//   const scene = new THREE.Scene();
//   const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

//   const canvas = document.getElementById('canvas');
//   const renderer = new THREE.WebGLRenderer({alpha: true, canvas});
//   renderer.setSize( window.innerWidth, window.innerHeight );

//   const geometry = new THREE.BoxGeometry( 1, 1, 1 );
//   const material = new THREE.MeshBasicMaterial( { color } );
//   const cube = new THREE.Mesh( geometry, material );
//   scene.add( cube );

//   camera.position.z = 5;

//   const render = () => {
//     requestAnimationFrame( render );

//     cube.rotation.x += 0.1;
//     cube.rotation.y += 0.1;

//     renderer.render(scene, camera);
//   };
//   render();
// };
