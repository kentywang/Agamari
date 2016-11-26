import { scene, world, groundMaterial, myColors } from './main';
import socket from '../socket';
const THREE = require('three');
const CANNON = require('../../public/cannon.min.js');


let controls, ball_geometry, ball_material, sphereShape;

export const Food = function( id, data ) {
  this.data = data;
  this.mesh;
  this.cannonMesh;
  let scope = this;
  this.eaten = false;

  var count = 0;
  for (var prop in myColors){
    if (Math.random() < 1/++count){
      var color = prop;
    }
  }

  if (data.type === 'sphere') {
    // create THREE object
    ball_geometry = new THREE.TetrahedronGeometry( data.parms[0], 1 );
    ball_material = new THREE.MeshPhongMaterial( {color: myColors[color], shading: THREE.FlatShading} );
    // create Cannon object
    sphereShape = new CANNON.Sphere(data.parms[0]);
    scope.cannonMesh = new CANNON.Body({mass: 0, material: groundMaterial, shape: sphereShape});
  }

  if (data.type === 'box') {
    // create THREE object
    ball_geometry = new THREE.BoxGeometry( data.parms[0], data.parms[1], data.parms[2] );
    ball_material = new THREE.MeshPhongMaterial( {color: myColors[color], shading: THREE.FlatShading} );
    // create Cannon object
    sphereShape = new CANNON.Box(new CANNON.Vec3(data.parms[0]/2, data.parms[1]/2, data.parms[2]/2));
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
    //console.log(world.bodies.length)

    // disable collisions
    scope.cannonMesh.collisionResponse = 0; 

    scope.cannonMesh.addEventListener('collide', e => {
      //console.log("crash")
      if(!scope.eaten){
        let player = scene.getObjectByName(socket.id);
        if (player) {
          for (let i = 0; i < world.contacts.length; i++){
            let c = world.contacts[i];
            if ((c.bi === scope.cannonMesh && c.bj === player.cannon) || (c.bi === player.cannon && c.bj === scope.cannonMesh)) {
              let playerVol = store.getState().players[socket.id].volume;
              let foodVol = scope.mesh.cannon.shapes[0].volume();

             //console.log("vol", foodVol, scope.mesh.cannon.shapes[0].halfExtents || scope.mesh.cannon.shapes[0].radius)
              // player must be 10 times the volume of food to eat it
              if(playerVol > foodVol * 10){
                // pass new volume so that server can update its store if/when food eaten goes thru
                var volume = foodVol + store.getState().players[socket.id].volume;

                scope.eaten = true;
                socket.emit('eat_food', id, volume);
              }
            }
          }
        }
      }
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
