const THREE = require('three');
import store from '../store';
import {addPlayer} from '../reducers/gameState';

import { scene, camera, canvas, renderer, sphere } from './main';
import {Player} from './player';
import {playerID} from './main';

let player;

const loadGame = () => {
	// load the environment
	loadEnvironment();
	// load the player
	initMainPlayer();
  console.log('sphere', sphere);
  console.log('scene', scene);
  console.log('camera', camera);
  console.log('canvas', canvas);
  console.log('renderer', renderer);
	//listenToOtherPlayers();

	window.onunload = function() {
		//fbRef.child( "Players/" + playerID ).remove();
	};

	window.onbeforeunload = function() {
		//fbRef.child( "Players/" + playerID ).remove();
	};
}

export function loadEnvironment() {
	// let { color } = store.getState().gameState;
	// var sphere_geometry = new THREE.SphereGeometry( 1 );
	// var sphere_material = new THREE.MeshBasicMaterial( { color });
	// var sphere = new THREE.Mesh( sphere_geometry, sphere_material );


  let { color } = store.getState().gameState;
  sphere.material.color = new THREE.Color(color);

  // scene.add( sphere );


	// for(var other in players){
	// 	var cube_geometry = new THREE.BoxGeometry( 1, 1, 1 );
	// 	var cube_material = new THREE.MeshBasicMaterial( {color: 0x7777ff, wireframe: false} );
	// 	var mesh = new THREE.Mesh( cube_geometry, cube_material );

	// 	mesh.position.x = other.x;
	// 	mesh.position.y = other.y;
	// 	mesh.position.z = other.z;
	// 	mesh.rotation.x = other.rx;
	// 	mesh.rotation.y = other.ry;
	// 	mesh.rotation.z = other.rz;

	// 	scene.add( mesh );
	// }
}

function initMainPlayer() {

	// fbRef.child( "Players/" + playerID ).set({
	// 	isOnline: true,
	// 	orientation: {
	// 		position: {x: 0, y:0, z:0},
	// 		rotation: {x: 0, y:0, z:0}
	// 	}
	// });


	player = new Player( playerID );
	//console.log(player)
	player.isMainPlayer = true;
	player.init();
}

export { loadGame, player };
