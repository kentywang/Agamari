import { scene, player, world, groundMaterial, myColors } from './main';
import { socket } from '../components/App';
const THREE = require('three');
const CANNON = require('../../public/cannon.min.js');


let controls, ball_geometry, ball_material, sphereShape;

export const Food = function( id, data ) {
  this.data = data;
  this.mesh;
  this.cannonMesh;
  let scope = this;


  if (data.type === 'sphere') {
    // create THREE object
    ball_geometry = new THREE.TetrahedronGeometry( 2, 1 );
    ball_material = new THREE.MeshPhongMaterial( {color: myColors['blue'], shading: THREE.FlatShading} );
    // create Cannon object
    sphereShape = new CANNON.Sphere(2);
    scope.cannonMesh = new CANNON.Body({mass: 0, material: groundMaterial, shape: sphereShape});
  }


  this.init = function() {
    // mesh the ball geom and mat
    scope.mesh = new THREE.Mesh( ball_geometry, ball_material );
    scope.mesh.name = id;
    scope.mesh.castShadow = true;

    scope.mesh.position.x = this.data.x;
    scope.mesh.position.y = 12;
    scope.mesh.position.z = this.data.z;

    scene.add( scope.mesh );


    // add Cannon box
    scope.cannonMesh.position.x = scope.mesh.position.x;
    scope.cannonMesh.position.z = scope.mesh.position.y;
    scope.cannonMesh.position.y = scope.mesh.position.z;
    scope.cannonMesh.quaternion.x = scope.mesh.quaternion.x;
    scope.cannonMesh.quaternion.y = scope.mesh.quaternion.y;
    scope.cannonMesh.quaternion.z = scope.mesh.quaternion.z;
    scope.cannonMesh.quaternion.w = scope.mesh.quaternion.w;
    scope.mesh.cannon = scope.cannonMesh;
    world.add(scope.cannonMesh);

    scope.cannonMesh.addEventListener('collide', e => {
      world.remove(scope.cannonMesh);
      let playerRadius = player.cannonMesh.shapes[0].radius;

      // console.log('radius', playerRadius);
      // player.cannonMesh.shapes[0].radius += 0;
      // console.log('mass', player.cannonMesh.mass);
      // player.cannonMesh.mass += 0;
      // console.log(player.cannonMesh.mass);

      //remove the food
      //also need to remove food from game state eventually
      socket.emit('eat_food', id);
      // scene.remove(scope.mesh);

      // player.mesh.scale.x = player.mesh.scale.y = player.mesh.scale.z += 1;
    });
  };

  // this.setOrientation = function( position, rotation ) {
  //  if ( scope.mesh ) {
  //    scope.mesh.position.copy( position );
  //    scope.mesh.rotation.x = rotation.x;
  //    scope.mesh.rotation.y = rotation.y;
  //    scope.mesh.rotation.z = rotation.z;
  //  }
  // };

  // // Kenty: I added this method to get a player's positional data
  // this.getPlayerData = function() {
  //  return {
  //      x: scope.mesh.position.x,
  //      y: scope.mesh.position.y,
  //      z: scope.mesh.position.z,
  //      rx: scope.mesh.rotation.x,
  //      ry: scope.mesh.rotation.y,
  //      rz: scope.mesh.rotation.z
  //  };
  // };
};

export {controls};
