import { scene, world, groundMaterial, myColors } from './main';
import socket from '../socket';
import store from '../store';
const THREE = require('three');
const CANNON = require('../../public/cannon.min.js');


// let controls, ball_geometry, ball_material, sphereShape;
let count, color, geometry, material, shape, mesh, player, controls;

export class Food {
  constructor(id, data) {
    this.id = id;
    this.initialData = data;
    this.eaten = false;
    this.mesh;

    this.init = this.init.bind(this);
  }

  init() {
    // Pick a random color
    count = 0;
    for (var prop in myColors){
      if (Math.random() < 1 / ++count){
        color = prop;
      }
    }

    // Pick a random shape of random dimensions and create mesh/cannon mesh
    let { type, parms, x, z } = this.initialData;
    switch (type) {
      case 'box':
        geometry = new THREE.BoxGeometry( parms[0], parms[1], parms[2] );
        material = new THREE.MeshPhongMaterial( {color: myColors[color], shading: THREE.FlatShading} );
        shape = new CANNON.Box(new CANNON.Vec3(parms[0] / 2, parms[1] / 2, parms[2] / 2));
        break;
      case 'sphere':
      default:
        geometry = new THREE.TetrahedronGeometry( parms[0], 1 );
        material = new THREE.MeshPhongMaterial( {color: myColors[color], shading: THREE.FlatShading} );
        shape = new CANNON.Sphere(parms[0]);
    }

    mesh = new THREE.Mesh( geometry, material );
    mesh.name = this.id;
    mesh.castShadow = true;
    mesh.position.x = x;
    mesh.position.y = 800+ 10 + parms[0] * 2;
    mesh.position.z = z;
    mesh.cannon = new CANNON.Body({ shape, mass: 0, material: groundMaterial });

    mesh.cannon.position.x = mesh.position.x;
    mesh.cannon.position.z = mesh.position.y;
    mesh.cannon.position.y = mesh.position.z;
    mesh.cannon.quaternion.x = mesh.quaternion.x;
    mesh.cannon.quaternion.y = mesh.quaternion.y;
    mesh.cannon.quaternion.z = mesh.quaternion.z;
    mesh.cannon.quaternion.w = mesh.quaternion.w;

    scene.add(mesh);
    world.add(mesh.cannon);

    this.mesh = mesh;

    this.mesh.cannon.collisionResponse = 0;
    this.mesh.cannon.addEventListener('collide', e => {
      player = scene.getObjectByName(socket.id);
      if (!this.eaten) {
        if (player) {
          for (let contact of world.contacts) {
            let foodHits = contact.bi === this.mesh.cannon;
            let playerIsHit = contact.bj === player.cannon;
            let playerHits = contact.bi === player.cannon;
            let foodIsHit = contact.bj === this.mesh.cannon;
            if (foodHits && playerIsHit || playerHits && foodIsHit) {
                  let playerVol = store.getState().players[socket.id].volume;
                  let foodVol = this.mesh.cannon.shapes[0].volume();

                  // player must be 12 times the volume of food to eat it, and can't be more than 144 the volume
                  if (playerVol > foodVol * 12 && playerVol < foodVol * 144) {
                    // pass new volume so that server can update its store if/when food eaten goes thru
                    this.eaten = true;
                    socket.emit('eat_food', this.id, foodVol + playerVol);
                  }
            }
          }
        }
      }
    });

  }
}

export {controls};
