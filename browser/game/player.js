const THREE = require('three');
const CANNON = require('../../public/cannon.min.js');
const PlayerControls = require('../../public/PlayerControls');

import { scene, camera, world, groundMaterial, myColors } from './main';
import socket from '../socket';


let controls;

export const Player = function( id, data, isMainPlayer) {
  this.id = id;
  this.isMainPlayer = isMainPlayer;
  this.mesh;
  this.cannonMesh;
  var scope = this;


  // create THREE ball
  var ball_geometry = new THREE.TetrahedronGeometry( 10, 2 );
  var ball_material = new THREE.MeshPhongMaterial( {color: myColors['grey'], shading: THREE.FlatShading} );


  // create Cannon box
  var sphereShape = new CANNON.Sphere(10);
  if (this.isMainPlayer){
    scope.cannonMesh = new CANNON.Body({mass: 50, material: groundMaterial, shape: sphereShape});
    scope.cannonMesh.linearDamping = scope.cannonMesh.angularDamping = 0.4;
  } else {
    scope.cannonMesh = new CANNON.Body({mass: 0, shape: sphereShape});
  }


  this.init = function() {
    // let playerData = store.getState().gameState.players[scope.id];

    // mesh the ball geom and mat
    scope.mesh = new THREE.Mesh( ball_geometry, ball_material );
    scope.mesh.castShadow = true;

    scope.mesh.position.x = data.x;
    scope.mesh.position.y = data.y;
    scope.mesh.position.z = data.z;
    scope.mesh.rotation.x = data.rx;
    scope.mesh.rotation.y = data.ry;
    scope.mesh.rotation.z = data.rz;

    scope.mesh.name = id;

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

    if (!scope.isMainPlayer){
      scope.cannonMesh.addEventListener('collide', e => {
        let player = scene.getObjectByName(socket.id);

        if (player) {
          for (let i = 0; i < world.contacts.length; i++){
            let c = world.contacts[i];
            console.log("world contact", c.bi === scope.cannonMesh, c.bj === player.cannon , c.bi === player.cannon , c.bj === scope.cannonMesh);
            if ((c.bi === scope.cannonMesh && c.bj === player.cannon) ||
                 (c.bi === player.cannon && c.bj === scope.cannonMesh)) {
                console.log("scale,", scope.mesh.scale.x, player.scale.x)
              if(scope.mesh.scale.x > player.scale.x){
                socket.emit('got_eaten', scope.id);
              }
            }
          }
        }

      });
    }

    // add controls and camera
    if ( scope.isMainPlayer ) {
      controls = new THREE.PlayerControls( camera, scope.mesh, scope.cannonMesh );
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

export { controls };
