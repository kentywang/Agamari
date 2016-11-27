const THREE = require('three');
const CANNON = require('../../public/cannon.min.js');
const PlayerControls = require('./PlayerControls');

import { makeTextSprite } from './utils';
import { scene,
         camera,
         world,
         groundMaterial,
         myColors,
         raycastReference } from './main';
import { Food } from './food';
import socket from '../socket';
import store from '../store';

let geometry, material, shape, mesh, pivot, name, sprite, controls;


export class Player {
  constructor(id, data, isMainPlayer) {
    this.id = id;
    this.initialData = data;
    this.isMainPlayer = isMainPlayer;
    this.mesh;
    this.lastEaten;

    this.init = this.init.bind(this);
  }

  init() {
    let { isMainPlayer, id, initialData, lastEaten } = this;

    // THREE
    geometry = new THREE.TetrahedronGeometry( 10, 2 );
    material = new THREE.MeshPhongMaterial({ color: myColors['grey'],
                                             shading: THREE.FlatShading });
    mesh = new THREE.Mesh( geometry, material );

    // Cannon
    shape = new CANNON.Sphere(10);
    if (isMainPlayer) {
      mesh.cannon = new CANNON.Body({ shape,
                                      mass: 42,
                                      material: groundMaterial });
      mesh.cannon.linearDamping = mesh.cannon.angularDamping = 0.4;
    } else {
      mesh.cannon = new CANNON.Body({ shape, mass: 0 });
    }

    mesh.castShadow = true;

    mesh.position.x = initialData.x;
    mesh.position.y = initialData.y;
    mesh.position.z = initialData.z;
    mesh.quaternion.x = initialData.qx;
    mesh.quaternion.y = initialData.qy;
    mesh.quaternion.z = initialData.qz;
    mesh.quaternion.w = initialData.qw;

    mesh.name = id;
    mesh.nickname = initialData.nickname;

    // add pivot to attach food to
    pivot = new THREE.Group();
    mesh.add(pivot);


    // add Cannon box
    mesh.cannon.position.x = mesh.position.x;
    mesh.cannon.position.z = mesh.position.y;
    mesh.cannon.position.y = mesh.position.z;
    mesh.cannon.quaternion.x = -mesh.quaternion.x;
    mesh.cannon.quaternion.z = -mesh.quaternion.y;
    mesh.cannon.quaternion.y = -mesh.quaternion.z;
    mesh.cannon.quaternion.w = mesh.quaternion.w;

    scene.add( mesh );
    world.add(mesh.cannon);

    // Use the preStep callback to apply the gravity force on the moon.
    // This callback is evoked each timestep.
    mesh.cannon.preStep = function(){
      // Get the vector pointing from the moon to the planet center
      var moon_to_planet = new CANNON.Vec3();
      this.position.negate(moon_to_planet);
      // Get distance from planet to moon
      var distance = moon_to_planet.norm();
      // Now apply force on moon
      // Fore is pointing in the moon-planet direction
      moon_to_planet.normalize();
      moon_to_planet = moon_to_planet.scale(6000000 * this.mass/Math.pow(distance,2))
      world.gravity.set(moon_to_planet.x, moon_to_planet.y, moon_to_planet.z); // changing gravity seems to apply friction, whereas just applying force doesn't
      // moon_to_planet.mult(100000000*this.mass/Math.pow(distance,2),this.force);
    }

    // show name on player if not self
    if (!isMainPlayer) {
      let { nickname } = initialData;
      name = nickname.length > 12 ? nickname.slice(0, 11) + '...' : nickname;
      sprite = makeTextSprite(name, 50);
      mesh.sprite = sprite;
      scene.add(sprite); // might run into issues with children
    }

    this.mesh = mesh;

    // collision handler
    if (!isMainPlayer) {
      this.mesh.cannon.addEventListener('collide', e => {
        let { players } = store.getState();
        let player = scene.getObjectByName(socket.id);
        // cooldown timer for being eaten
        if (player && (!lastEaten || (Date.now() - lastEaten) > 3000)) {
          for (let contact of world.contacts){
            let thisHits = contact.bi === this.mesh.cannon,
                mainIsHit = contact.bj === player.cannon,
                mainHits = contact.bi === player.cannon,
                thisIsHit = contact.bj === this.mesh.cannon;
            if (thisHits && mainIsHit || mainHits && thisIsHit) {
              let mainVol = players[socket.id].volume;
              let thisVol = players[this.id].volume;

              //player must be 12 times the volume of enemy to eat it
              if (thisVol > mainVol * 12 ){
                this.lastEaten = Date.now();
                socket.emit('got_eaten', id, thisVol + mainVol);
              }
            }
          }
        }
      });

      if (initialData.diet) {
          initialData.diet.forEach(e => {
          let playerData = {
            x: e.x,
            y: e.y,
            z: e.z,
            qx: e.qx,
            qy: e.qy,
            qz: e.qz,
            qw: e.qw
          };

          let newFood = new Food(null, e.food);
          newFood.init();
          let foodObject = newFood.mesh;
          let player = this.mesh;
          let newQuat = new CANNON.Quaternion(-playerData.qx,
                                              -playerData.qz,
                                              -playerData.qy,
                                              playerData.qw);
          let threeQuat = new THREE.Quaternion(playerData.qx,
                                               playerData.qy,
                                               playerData.qz,
                                               playerData.qw);

          // attach food to player
          world.remove(foodObject.cannon);
          let vec1 = new CANNON.Vec3((foodObject.position.x - playerData.x) * 0.8,
                                     (foodObject.position.z - playerData.z) * 0.8,
                                     (foodObject.position.y - playerData.y) * 0.8);

          let vmult = newQuat.inverse().vmult(vec1);
          player.cannon.addShape(foodObject.cannon.shapes[0], vmult, newQuat.inverse());

          let invQuat = threeQuat.inverse();
          let vec2 = new THREE.Vector3((foodObject.position.x - playerData.x) * 0.8,
                                      (foodObject.position.y - playerData.y) * 0.8,
                                      (foodObject.position.z - playerData.z) * 0.8);
          let vecRot = vec2.applyQuaternion(invQuat);

          foodObject.position.set(vecRot.x, vecRot.y, vecRot.z);
          foodObject.quaternion.set(invQuat.x, invQuat.y, invQuat.z, invQuat.w);

          // add to pivot obj of player
          player.children[0].add(foodObject);
        });
      }
    }

    // add controls and camera
    if ( isMainPlayer ) {
      controls = new THREE.PlayerControls( camera,
                                           this.mesh,
                                           this.mesh.cannon,
                                           raycastReference,
                                           id );
    }
  }

  setOrientation(position, quaternion) {
    if (this.mesh) {
      this.mesh.position.copy( position );
      this.mesh.quaternion.x = quaternion.x;
      this.mesh.quaternion.y = quaternion.y;
      this.mesh.quaternion.z = quaternion.z;
      this.mesh.quaternion.w = quaternion.w;
    }
  }

  get meshData() {
    return {
      x: this.mesh.position.x,
      y: this.mesh.position.y,
      z: this.mesh.position.z,
      qx: this.mesh.quaternion.x,
      qy: this.mesh.quaternion.y,
      qz: this.mesh.quaternion.z,
      qw: this.mesh.quaternion.w
    };
  }
}

export { controls };
