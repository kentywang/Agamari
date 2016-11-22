import store from '../store';
import {addPlayer} from '../reducers/gameState';
import { scene, camera, canvas, renderer, plane, playerID, myColors } from './main';
import {Player} from './player';
import {socket} from '../components/App';

const THREE = require('three');

let player;

const loadGame = () => {
	// load the environment
	loadEnvironment();

	// load the player
	// initMainPlayer();


	window.onunload = function() {
		//remove self from server db here
	};

	window.onbeforeunload = function() {
		//remove self from server db here
	};
}

export function loadEnvironment() {
	let { color, players } = store.getState().gameState;

	// Kenty: added if statement below to get around undefined plane error
	if (plane) plane.material.color = new THREE.Color(myColors[color]);

	let currentPlayer;
	let data;

	// set location and rotation for other players (I should probably use player.setOrientation instead)
	for (let id in players){
  		// Kenty: added '&& scene.getobj' to if statement below to get around undefined error
	  	if(id != socket.id && scene.getObjectByName(id)){
	  		currentPlayer = scene.getObjectByName(id);
	  		data = players[id];

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
