const THREE = require('three');
const CANNON = require('../../public/cannon.min.js');
const PlayerControls = require('../../public/PlayerControls');
import { scene, camera, canvas, renderer, world } from './main';
import {playerID} from './main';
//import {player} from './game';

import store from '../store';

let controls;

export const Player = function( playerID, isMainPlayer ) {
	this.playerID = playerID;
	this.isMainPlayer = isMainPlayer;
	this.mesh;
	this.cannonMesh;
	var scope = this;

	// create THREE box
	var cube_geometry = new THREE.SphereGeometry( 1, 8, 8 );
	var cube_material = new THREE.MeshBasicMaterial( {color: 0x7777ff, wireframe: false} );

	// create Cannon box
	if(this.isMainPlayer){
		var sphereShape = new CANNON.Sphere(1);
		scope.cannonMesh = new CANNON.Body({mass: 5, shape: sphereShape});
	}


	this.init = function() {
		let playerData = store.getState().gameState.players[scope.playerID];
		//console.log(playerData)
		//console.log("player data:    ", playerData);
		scope.mesh = new THREE.Mesh( cube_geometry, cube_material );

		scope.mesh.name = playerID;

		scope.mesh.position.x = playerData.x;
		scope.mesh.position.y = playerData.y;
		scope.mesh.position.z = playerData.z;

		scope.mesh.rotation.x = playerData.rx;
		scope.mesh.rotation.y = playerData.ry;
		scope.mesh.rotation.z = playerData.rz;

		//console.log("scope mesh", scope.mesh)
		scene.add( scope.mesh );

		// add Cannon box
		// Cannon's z seems to by Three's y, and vice versa
		if(scope.isMainPlayer){
			scope.cannonMesh.position.x = scope.mesh.position.x;
  			scope.cannonMesh.position.z = scope.mesh.position.y;
  			scope.cannonMesh.position.y = scope.mesh.position.z;
  			scope.cannonMesh.quaternion.x = scope.mesh.quaternion.x;
  			scope.cannonMesh.quaternion.y = scope.mesh.quaternion.y;
  			scope.cannonMesh.quaternion.z = scope.mesh.quaternion.z;
  			scope.cannonMesh.quaternion.w = scope.mesh.quaternion.w;

			world.add(scope.cannonMesh);
		}

		//console.log(scope.playerID)
		if ( scope.isMainPlayer ) {
			controls = new THREE.PlayerControls( camera , scope.mesh, scope.cannonMesh );
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
