const THREE = require('three');
const PlayerControls = require('../../public/PlayerControls');
import { scene, camera, canvas, renderer } from './main';
import {playerID} from './main';

import store from '../store';

let controls;

export const Player = function( playerID ) {
	this.playerID = playerID;
	this.isMainPlayer = false;
	this.mesh;

	var cube_geometry = new THREE.BoxGeometry( 1, 1, 1 );
	var cube_material = new THREE.MeshBasicMaterial( {color: 0x7777ff, wireframe: false} );
	var scope = this;

	this.init = function() {
		// console.log()
		let playerData = store.getState().gameState.players[scope.playerID];
		console.log("player data:    ", playerData);
		scope.mesh = new THREE.Mesh( cube_geometry, cube_material );

		scope.mesh.name = playerID;

		scope.mesh.position.x = playerData.x;
		scope.mesh.position.y = playerData.y;
		scope.mesh.position.z = playerData.z;

		console.log("scope mesh", scope.mesh)
		scene.add( scope.mesh );

		//console.log(scope.playerID)
		if ( scope.isMainPlayer ) {
			controls = new THREE.PlayerControls( camera , scope.mesh );
			controls.init();
		}

	};

	this.setOrientation = function( position, rotation ) {
		if ( scope.mesh ) {
			scope.mesh.position.copy( position );
			scope.mesh.rotation.x = rotation.x;
			scope.mesh.rotation.y = rotation.y;
			scope.mesh.rotation.z = rotation.z;

		}
	};

	// Kenty: I added this method to get a player's positional data
	this.getPlayerData = function() {
		return {
				x: scope.mesh.position.x,
				y: scope.mesh.position.y,
				z: scope.mesh.position.z,
				rx: scope.mesh.rotation.x,
				ry: scope.mesh.rotation.y,
				rz: scope.mesh.rotation.z
		};
	};
};

export {controls};
