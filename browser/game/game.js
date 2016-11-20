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
  // console.log('sphere', sphere);
  // console.log('scene', scene);
  // console.log('camera', camera);
  // console.log('canvas', canvas);
  // console.log('renderer', renderer);
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

	let { auth } = store.getState();
  let { color, players } = store.getState().gameState;
  sphere.material.color = new THREE.Color(color);

  // scene.add( sphere );
  let currentPlayer;
  let data;

  for (let player in players){
  	if(player != auth.id){
  		//console.log("player is this:       ", player)
  		currentPlayer = scene.getObjectByName(player);
  		data = players[player];
  		currentPlayer.position.x = data.x;
  		currentPlayer.position.y = data.y;
  		currentPlayer.position.z = data.z;
  		currentPlayer.rotation.rx = data.rx;
  		currentPlayer.rotation.ry = data.ry;
  		currentPlayer.rotation.rz = data.rz;
  	}
  }

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

// <<<<<<< HEAD
// 	// 	scene.add( mesh );
// 	// }
// =======
// 		scene.add( mesh );
// 	}

// 	const food_sphere_geometry = new THREE.SphereGeometry( 0.3 );
// 	const food_sphere_material = new THREE.MeshBasicMaterial( {color: 0x66669, wireframe: false} );

// 	let gameBorderPosition = 100;

// 	for (var i = 0; i < 10; i++) {
// 		const food = new THREE.Mesh( food_sphere_geometry, food_sphere_material );

// 		let xPostion = Math.floor(Math.random()*gameBorderPosition);
// 		xPostion *= Math.floor(Math.random()*2) == 1 ? 1 : -1;

// 		let zPostion = Math.floor(Math.random()*gameBorderPosition);
// 		zPostion *= Math.floor(Math.random()*2) == 1 ? 1 : -1;

// 		food.position.x = xPostion;
// 		food.position.y = 0;
// 		food.position.z = zPostion;
// 		scene.add( food );
// 	}


// >>>>>>> dddb3b4bc8bce0a3c1863a1cab943c57ea610854
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
