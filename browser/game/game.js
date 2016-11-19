const THREE = require('three');
import store from '../store';

import { scene, camera, canvas, renderer } from './main';
import {Player} from './player';

let playerID = "007";
let player;

const loadGame = () => {
	// load the environment
	loadEnvironment();
	// load the player
	initMainPlayer();

	//listenToOtherPlayers();

	window.onunload = function() {
		//fbRef.child( "Players/" + playerID ).remove();
	};

	window.onbeforeunload = function() {
		//fbRef.child( "Players/" + playerID ).remove();
	};
}

export function loadEnvironment() {
	let { color } = store.getState().gameState;
	var sphere_geometry = new THREE.SphereGeometry( 1 );
	var sphere_material = new THREE.MeshBasicMaterial( { color });
	var sphere = new THREE.Mesh( sphere_geometry, sphere_material );

	scene.add( sphere );
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
	player.isMainPlayer = true;
	player.init();
}

export { loadGame, playerID };
