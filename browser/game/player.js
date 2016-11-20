const THREE = require('three');
const CANNON = require('../../public/cannon.min.js');
const PlayerControls = require('../../public/PlayerControls');
import { scene, camera, canvas, renderer, world, groundMaterial } from './main';
import {playerID} from './main';
//import {player} from './game';

import store from '../store';
import {myColors} from '../game/main';

let controls;

export const Player = function( playerID, isMainPlayer ) {
	this.playerID = playerID;
	this.isMainPlayer = isMainPlayer;
	this.mesh;
	this.cannonMesh;
	var scope = this;

	// create THREE box
	var cube_geometry = new THREE.SphereGeometry( 1, 6, 6 );
	var cube_material = new THREE.MeshPhongMaterial( {color: myColors["brown"], shading:THREE.FlatShading} );

	// create Cannon box
	if(this.isMainPlayer){
		var sphereShape = new CANNON.Sphere(1);
		scope.cannonMesh = new CANNON.Body({mass: 5, material: groundMaterial, shape: sphereShape});
		scope.cannonMesh.linearDamping = scope.cannonMesh.angularDamping = 0.9; // this is the damping value
	}


	this.init = function() {
		let playerData = store.getState().gameState.players[scope.playerID];
		//console.log(playerData)
		//console.log("player data:    ", playerData);
		scope.mesh = new THREE.Mesh( cube_geometry, cube_material );
		scope.mesh.useQuaternion = true;
		scope.mesh.castShadow = true;

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
		// Cannon's position z seems to by Three's y, and vice versa (for quaternions, z and x seem switched)
		// also, quaternion w seems to need to be reversed
		if(scope.isMainPlayer){
			scope.cannonMesh.position.x = scope.mesh.position.x;
  			scope.cannonMesh.position.z = scope.mesh.position.y;
  			scope.cannonMesh.position.y = scope.mesh.position.z;
  			scope.cannonMesh.quaternion.x = scope.mesh.quaternion.x;
  			scope.cannonMesh.quaternion.y = scope.mesh.quaternion.y;
  			scope.cannonMesh.quaternion.z = scope.mesh.quaternion.z;
  			 scope.cannonMesh.quaternion.w = scope.mesh.quaternion.w;

  	// 		// get point gravity to center of planet
			// scope.cannonMesh.preStep = function(){
   //          // Get the vector pointing from the moon to the planet center
   //          var moon_to_planet = new CANNON.Vec3();
   //          this.position.negate(moon_to_planet);
   //          // Get distance from planet to moon
   //          var distance = moon_to_planet.norm();
   //          // Now apply force on moon
   //          // Fore is pointing in the moon-planet direction
   //          moon_to_planet.normalize();
   //          moon_to_planet.mult(150000/Math.pow(distance,2),this.force);
   //        }

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
