import store from '../store';
import {removeFoodAndAddMass} from '../reducers/gameState';
import {socket} from '../components/App';
import { scene, camera, canvas, renderer, world, groundMaterial, playerID, myColors } from './main';
import {player} from './game';

const THREE = require('three');
const CANNON = require('../../public/cannon.min.js');


let controls;

export const Food = function( id, foodObj ) {
	//console.log(foodObj);
	this.foodID = id;
	this.foodData = foodObj;

	this.mesh;
	this.cannonMesh;
	var scope = this;
//	console.log("in food")


	if(foodObj.type == "sphere"){
		// create THREE object
		var ball_geometry = new THREE.TetrahedronGeometry( 3, 1 );
		var ball_material = new THREE.MeshPhongMaterial( {color: myColors["blue"], shading:THREE.FlatShading} );

		// create Cannon object
		var sphereShape = new CANNON.Sphere(3);
		scope.cannonMesh = new CANNON.Body({mass: 0, material: groundMaterial, shape: sphereShape});
	}


	this.init = function() {
		// mesh the ball geom and mat
		scope.mesh = new THREE.Mesh( ball_geometry, ball_material );
		scope.mesh.castShadow = true;
		console.log("food Data:",this.foodData);
		scope.mesh.position.x = this.foodData.x;
		scope.mesh.position.y = 20;
		scope.mesh.position.z = this.foodData.z;

		scene.add( scope.mesh );
		console.log("scope mesh",scope.mesh);
		scope.mesh.name = scope.foodID;


		// add Cannon box
		scope.cannonMesh.position.x = scope.mesh.position.x;
		scope.cannonMesh.position.z = scope.mesh.position.y;
		scope.cannonMesh.position.y = scope.mesh.position.z;
		scope.cannonMesh.quaternion.x = scope.mesh.quaternion.x;
		scope.cannonMesh.quaternion.y = scope.mesh.quaternion.y;
		scope.cannonMesh.quaternion.z = scope.mesh.quaternion.z;
		scope.cannonMesh.quaternion.w = scope.mesh.quaternion.w;

		world.add(scope.cannonMesh);


		// add pointed to meshes in local state food array
		//store.dispatch(addFoodPointer(scope.index, scope.mesh, scope.cannonMesh));

		scope.cannonMesh.addEventListener("collide", function(e){
			world.remove(scope.cannonMesh);
			let playerRadius = player.cannonMesh.shapes[0].radius;
			//let playerbsRadius = player.cannonMesh.shapes[0].boundingSphereRadius;

			player.cannonMesh.shapes[0].radius+=1;
			player.cannonMesh.shapes[0].boundingSphereRadius+=1;
			player.cannonMesh.mass += 5;

			//remove the food 
			scene.remove(scope.mesh);

			// scale player
			player.mesh.scale.x=player.mesh.scale.y=player.mesh.scale.z +=0.1;

			// update local store
			//console.log("getstate", store.getState())
			//let foodToRemove = store.getState().gameState.food[scope.foodID];
					// Why isn't this emitting when placed after the dispatch?

			store.getState().socket.emit('ate_food_got_bigger', player.playerID, scope.foodID);

			store.dispatch(removeFoodAndAddMass(player.playerID, scope.foodID));


			// emit event to server
		});
	};

	// this.setOrientation = function( position, rotation ) {
	// 	if ( scope.mesh ) {
	// 		scope.mesh.position.copy( position );
	// 		scope.mesh.rotation.x = rotation.x;
	// 		scope.mesh.rotation.y = rotation.y;
	// 		scope.mesh.rotation.z = rotation.z;
	// 	}
	// };

	// // Kenty: I added this method to get a player's positional data
	// this.getPlayerData = function() {
	// 	return {
	// 			x: scope.mesh.position.x,
	// 			y: scope.mesh.position.y,
	// 			z: scope.mesh.position.z,
	// 			rx: scope.mesh.rotation.x,
	// 			ry: scope.mesh.rotation.y,
	// 			rz: scope.mesh.rotation.z
	// 	};
	// };
};