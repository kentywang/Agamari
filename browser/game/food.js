import store from '../store';
import {removeFoodAndAddMass, addFoodPointer} from '../reducers/gameState';
import {socket} from '../components/App';
import { scene, camera, canvas, renderer, world, groundMaterial, playerID, myColors } from './main';
import {player} from './game';

const THREE = require('three');
const CANNON = require('../../public/cannon.min.js');


let controls;

export const Food = function( foodObj, index ) {
	this.foodData = foodObj;
	this.index = index;
	this.mesh;
	this.cannonMesh;
	var scope = this;
	//console.log(this.index)


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

		scope.mesh.position.x = this.foodData.x;
		scope.mesh.position.y = 20;
		scope.mesh.position.z = this.foodData.z;

		scene.add( scope.mesh );


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
		store.dispatch(addFoodPointer(scope.index, scope.mesh, scope.cannonMesh));

		scope.cannonMesh.addEventListener("collide", function(e){
			world.remove(scope.cannonMesh);
			let playerRadius = player.cannonMesh.shapes[0].radius;
			//let playerbsRadius = player.cannonMesh.shapes[0].boundingSphereRadius;

			player.cannonMesh.shapes[0].radius+=1;
			player.cannonMesh.shapes[0].boundingSphereRadius+=1;
			player.cannonMesh.mass += 5;

			//remove the food 
			scene.remove(scope.mesh);

			player.mesh.scale.x=player.mesh.scale.y=player.mesh.scale.z +=0.1;

			// update local store
			//console.log("getstate", store.getState())
			store.getState().gameState.food.forEach((item,index) => {
				if(item.x === scope.foodData.x && item.z === scope.foodData.z){
					console.log("removing food and emitting")
					// Why isn't this emitting when placed after the dispatch?
					store.getState().socket.emit('ate_food_got_bigger', player.playerID, index);

					store.dispatch(removeFoodAndAddMass(player.playerID, index));

				}
			});

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

function removeFood(index) {
	console.log("removing food at ", store.getState())
	// the meshes don't exist even though they did in ADD FooD PoINTER, could RECEIVE_GAMESTATE be changing it??
	scene.remove(store.getState().gameState.food[index].mesh);
	world.remove(store.getState().gameState.food[index].cannonMesh);
}

export {removeFood};