import { scene, world, groundMaterial } from './main';
import { myColors } from './config';
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
    let someColors = myColors();
    // Pick a random color
    count = 0;

    // never allow food to be same color as planet or players
    someColors["pink"] = null;
    for (var prop in someColors){
      if (Math.random() < 1 / ++count){
        color = prop;
      }
    }

    // Pick a random shape of random dimensions and create mesh/cannon mesh
    let { type, parms, x, y, z } = this.initialData;
    //console.log(type, parms[0])
    switch (type) {
      case 'box':
        geometry = new THREE.BoxGeometry( parms[0], parms[1], parms[2] );
        material = new THREE.MeshPhongMaterial( {color: someColors[color], shading: THREE.FlatShading} );
        shape = new CANNON.Box(new CANNON.Vec3(parms[0] / 2, parms[1] / 2, parms[2] / 2));
        break;
      case 'moon':
        geometry = new THREE.IcosahedronGeometry( parms[0], 1 );
        material = new THREE.MeshPhongMaterial( {color: "#F8B195", shading: THREE.FlatShading} );
        shape = new CANNON.Sphere(parms[0]);
        break;
      case 'bomb':
        geometry = new THREE.IcosahedronGeometry( 50, 0);
        material = new THREE.MeshPhongMaterial( {color: "black", shininess: 100, envMaps: "reflection", specular: "grey", shading: THREE.FlatShading} );
        shape = new CANNON.Sphere(50);
        break;
      case 'sphere':
      default:
        geometry = new THREE.TetrahedronGeometry( parms[0], 1 );
        material = new THREE.MeshPhongMaterial( {color: someColors[color], shading: THREE.FlatShading} );
        shape = new CANNON.Sphere(parms[0]);
    }

    mesh = new THREE.Mesh( geometry, material );
    mesh.name = this.id;
    mesh.castShadow = true;
    mesh.position.x = x;
    mesh.position.y = y;
    mesh.position.z = z;
    if(type === "moon"){  
        mesh.position.normalize().multiplyScalar(820);
        mesh.position.add(mesh.position.clone().normalize().multiplyScalar(parms[0] * 2.5));
    }else if(type === "bomb"){
        mesh.position.normalize().multiplyScalar(500);
    }else{
      mesh.position.normalize().multiplyScalar(500);
      mesh.position.add(mesh.position.clone().normalize().multiplyScalar(parms[0] * 2.5));
    }
    mesh.lookAt(new THREE.Vector3(0,0,0));

    mesh.cannon = new CANNON.Body({ shape, mass: 0, material: groundMaterial });

    mesh.cannon.position.x = mesh.position.x;
    mesh.cannon.position.z = mesh.position.y;
    mesh.cannon.position.y = mesh.position.z;
    mesh.cannon.quaternion.x = -mesh.quaternion.x;
    mesh.cannon.quaternion.z = -mesh.quaternion.y;
    mesh.cannon.quaternion.y = -mesh.quaternion.z;
    mesh.cannon.quaternion.w = mesh.quaternion.w;

    scene.add(mesh);
    world.add(mesh.cannon);

    this.mesh = mesh;
    if(type !== "bomb"){
      this.mesh.cannon.collisionResponse = 0;
    }
    if (type == 'bomb') {
      this.mesh.cannon.collisionResponse = 1;
    }
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

                  if (type !== "bomb" && playerVol > foodVol) {
                    this.eaten = true;
                    socket.emit('eat_food', this.id, foodVol + playerVol);
                  }

                  // eat much smaller bombs
                  // else if(type === "bomb" && playerVol > foodVol * 8) {
                  //   this.eaten = true;
                  //   socket.emit('eat_food', this.id, foodVol + playerVol);
                  // }

                  // no effect with bigger bombs
                  // else if(type === "bomb" && playerVol < foodVol * 2) {
                    
                  // }

                  // all other bombs are explosive
                  else if(type === "bomb" && playerVol>10000){
                    this.eaten = true;
                    socket.emit('eat_food', this.id, foodVol + playerVol * 20);
                  }
            }
          }
        }
      }
    });

  }
}

export {controls};
