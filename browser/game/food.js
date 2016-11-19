
const THREE = require('three');

import { scene, camera, canvas, renderer } from './main';
import {foodID} from './game';


let food_sphere;

export const Player = function( foodID ) {
	this.foodID = playerID;
	this.food;

	const food_sphere_geometry = new THREE.SphereGeometry( 0.3 );
	const food_sphere_material = new THREE.MeshBasicMaterial( {color: 0x7777ff, wireframe: false} );


	var scope = this;

	this.init = function() {
		scope.food = new THREE.Mesh( food_sphere_geometry, food_sphere_material );
		

			let maxFoodNumber=10
			for (var i = 0; i < maxFoodNumber; i++) {

				
				let randomX = scene.position.x = Math.random() * 2 - 1;
				let randomY = scene.position.y = Math.random() * 2 - 1;
				let randomZ = scene.position.z = Math.random() * 2 - 1;

				scene.add( scope.food );
				scope.mesh.position = new THREE.Vector3(randomX, randomY, randomZ)

		};
	};
};

export {controls};
