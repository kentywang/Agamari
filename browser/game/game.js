import store from '../store';
import {addPlayer} from '../reducers/gameState';
import { scene, camera, canvas, renderer, plane, playerID, myColors } from './main';
import {Player} from './player';

const THREE = require('three');

let player;

const loadGame = () => {
	// load the environment
	loadEnvironment();

	// load the player
	initMainPlayer();


	window.onunload = function() {
		//remove self from server db here
	};

	window.onbeforeunload = function() {
		//remove self from server db here
	};
}

export function loadEnvironment() {
	let { auth } = store.getState();
	let { color, players } = store.getState().gameState;

	// Kenty: added if statement below to get around undefined plane error
	if (plane) plane.material.color = new THREE.Color(myColors[color]);

	let currentPlayer;
	let data;

	// set location and rotation for other players (I should probably use player.setOrientation instead)
	for (let player in players){
  		// Kenty: added '&& scene.getobj' to if statement below to get around undefined error
	  	if(player != auth.id && scene.getObjectByName(player)){
	  		currentPlayer = scene.getObjectByName(player);
	  		data = players[player];

	  		currentPlayer.position.x = data.x;
	  		currentPlayer.position.y = data.y;
	  		currentPlayer.position.z = data.z;
	  		currentPlayer.rotation.x = data.rx;
	  		currentPlayer.rotation.y = data.ry;
	  		currentPlayer.rotation.z = data.rz;
	  	}
	}

	//makeFood();
}

function initMainPlayer() {
	player = new Player( playerID, true);
	player.init();
}

export { loadGame, player };

// function makeFood(){
// 	const food_plane_geometry = new THREE.planeGeometry( 0.3 );
// 	const food_plane_material = new THREE.MeshBasicMaterial( {color: 0x66669, wireframe: false} );

// 	let gameBorderPosition = 100;

// 	for (var i = 0; i < 10; i++) {
// 		const food = new THREE.Mesh( food_plane_geometry, food_plane_material );

// 		let xPostion = Math.floor(Math.random()*gameBorderPosition);
// 		xPostion *= Math.floor(Math.random()*2) == 1 ? 1 : -1;

// 		let zPostion = Math.floor(Math.random()*gameBorderPosition);
// 		zPostion *= Math.floor(Math.random()*2) == 1 ? 1 : -1;

// 		food.position.x = xPostion;
// 		food.position.y = 0;
// 		food.position.z = zPostion;
// 		scene.add( food );
// 	}
// };
