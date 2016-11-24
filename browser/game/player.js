import { scene, camera, world, groundMaterial, myColors } from './main';
import { socket } from '../components/App';

const THREE = require('three');
const CANNON = require('../../public/cannon.min.js');
const PlayerControls = require('../../public/PlayerControls');

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
    scope.mesh.quaternion.x = data.qx;
    scope.mesh.quaternion.y = data.qy;
    scope.mesh.quaternion.z = data.qz;
    scope.mesh.quaternion.w = data.qw;

    scope.mesh.name = id;

    scene.add( scope.mesh );


    // add Cannon box
    scope.cannonMesh.position.x = scope.mesh.position.x;
    scope.cannonMesh.position.z = scope.mesh.position.y;
    scope.cannonMesh.position.y = scope.mesh.position.z;
    scope.cannonMesh.quaternion.x = -scope.mesh.quaternion.x;
    scope.cannonMesh.quaternion.z = -scope.mesh.quaternion.y;
    scope.cannonMesh.quaternion.y = -scope.mesh.quaternion.z;
    scope.cannonMesh.quaternion.w = scope.mesh.quaternion.w;

    scope.mesh.cannon = scope.cannonMesh;
    world.add(scope.cannonMesh);

    if (!scope.isMainPlayer){
      scope.cannonMesh.addEventListener('collide', e => {
        let player = scene.getObjectByName(socket.id);
        if (player) {
          for (let i = 0; i < world.contacts.length; i++){
            let c = world.contacts[i];
            if ((c.bi === scope.cannonMesh && c.bj === player.cannon) || (c.bi === player.cannon && c.bj === scope.cannonMesh)) {
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

  this.setOrientation = function( position, quaternion ) {
    if ( scope.mesh ) {
      scope.mesh.position.copy( position );
      scope.mesh.quaternion.x = quaternion.x;
      scope.mesh.quaternion.y = quaternion.y;
      scope.mesh.quaternion.z = quaternion.z;
      scope.mesh.quaternion.w = quaternion.w;
    }
  };

  // Kenty: I added this method to get a player's positional data
  this.getPlayerData = function() {
    return {
      x: scope.mesh.position.x,
      y: scope.mesh.position.y,
      z: scope.mesh.position.z,
      qx: scope.mesh.quaternion.x,
      qy: scope.mesh.quaternion.y,
      qz: scope.mesh.quaternion.z,
      qw: scope.mesh.quaternion.w
    };
  };
};

export { controls };
