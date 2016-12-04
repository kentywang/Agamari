const THREE = require('three');
const CANNON = require('../../public/cannon.min.js');
const PlayerControls = require('./PlayerControls');

import { makeTextSprite } from './utils';
import { scene,
         camera,
         world,
         groundMaterial, ballMaterial,
         raycastReference } from './main';
import { Food } from './food';
import socket from '../socket';
import store from '../store';
import { myColors } from './config';

let geometry, material, shape, mesh, pivot, name, sprite, controls;

let lastEaten = Date.now();


export class Player {
  constructor(id, data, isMainPlayer) {
    this.id = id;
    this.initialData = data;
    this.isMainPlayer = isMainPlayer;
    this.mesh;
    //this.lastEaten;

    this.init = this.init.bind(this);
  }

  init() {
    let { isMainPlayer, id, initialData } = this;

    let someColors = myColors();

    let aFewColors =
    [ '#6C5B7B',
      '#355C7D',
      '#99B898',
      '#2A363B',
      '#A8A7A7',
      '#b45431',
      '#37797b',
      '#547980'];
    let randomColor = aFewColors[~~(Math.random() * aFewColors.length)];

    // THREE
    geometry = new THREE.TetrahedronBufferGeometry( 10, 2 );
    material = new THREE.MeshPhongMaterial({ color: randomColor,
                                             shading: THREE.FlatShading });
    mesh = new THREE.Mesh( geometry, material );

    // Cannon
    shape = new CANNON.Sphere(10);
    if (isMainPlayer) {
      mesh.cannon = new CANNON.Body({ shape,
                                      mass: 35,
                                      material: ballMaterial });
      mesh.cannon.linearDamping = mesh.cannon.angularDamping = 0.41;
    } else {
      mesh.cannon = new CANNON.Body({ shape, mass: 0 });
    }

    mesh.castShadow = true;

    mesh.position.x = initialData.x;
    mesh.position.y = initialData.y;
    mesh.position.z = initialData.z;
    mesh.position.normalize().multiplyScalar(500);
    mesh.position.multiplyScalar(1.4);
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

    // Use the preStep callback to apply the gravity force on the planet and moon.
    // This callback is evoked each timestep.
    if(isMainPlayer){
        // physics for planet
        mesh.cannon.preStep = function(){
          // Get the vector pointing from the ball to the planet center
          var ball_to_planet = new CANNON.Vec3();
          this.position.negate(ball_to_planet);
          // Get distance from planet to ball
          var distance = ball_to_planet.norm();
          // Now apply force on moon
          // Fore is pointing in the ball-planet direction
          ball_to_planet.normalize();
          ball_to_planet = ball_to_planet.scale(3000000 * this.mass/Math.pow(distance,2))
          world.gravity.set(ball_to_planet.x, ball_to_planet.y, ball_to_planet.z); // changing gravity seems to apply friction, whereas just applying force doesn't
         //  ball_to_planet.mult(100000000*this.mass/Math.pow(distance,2),this.force);

          // gravity for moon
          //if(moonStillExists){
            // var ball_to_moon = new CANNON.Vec3(0,-1600,0);
            // ball_to_moon.vadd(this.position);
            // var distanceMoon = this.position.distanceTo(new CANNON.Vec3(0,-750,0));
            // ball_to_moon.normalize();
            // ball_to_moon.mult(10000000000*this.mass/Math.pow(distanceMoon,2), this.force);
          //}
      }
    }

    // show name on player if not self
    if (!isMainPlayer) {
      let { nickname } = initialData;
      name = nickname.length > 8 ? nickname.slice(0, 7) : nickname;
      sprite = makeTextSprite(name, 70);
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
        if (player && Date.now() - lastEaten > 3000) {
          //console.log(Date.now() - lastEaten > 3000)
          for (let contact of world.contacts){
            let thisHits = contact.bi === this.mesh.cannon,
                mainIsHit = contact.bj === player.cannon,
                mainHits = contact.bi === player.cannon,
                thisIsHit = contact.bj === this.mesh.cannon;
            if (thisHits && mainIsHit || mainHits && thisIsHit) {
              let mainVol = players[socket.id].volume;
              let thisVol = players[this.id].volume;

              if (thisVol > mainVol){
    
                lastEaten = Date.now();
                socket.emit('got_eaten', id, thisVol + mainVol);
              }
            }
          }
        }
      });

      // if (initialData.diet) {
      //     initialData.diet.forEach(e => {
      //     let playerData = {
      //       x: e.x,
      //       y: e.y,
      //       z: e.z,
      //       qx: e.qx,
      //       qy: e.qy,
      //       qz: e.qz,
      //       qw: e.qw
      //     };
      //     if (e.food){
      //       let newFood = new Food(null, e.food);
      //       newFood.init();
      //       let foodObject = newFood.mesh;
      //       let player = this.mesh;
      //       let newQuat = new CANNON.Quaternion(-playerData.qx,
      //                                           -playerData.qz,
      //                                           -playerData.qy,
      //                                           playerData.qw);
      //       let threeQuat = new THREE.Quaternion(playerData.qx,
      //                                            playerData.qy,
      //                                            playerData.qz,
      //                                            playerData.qw);

      //       // attach food to player
      //       world.remove(foodObject.cannon);
      //       let vec1 = new CANNON.Vec3((foodObject.position.x - playerData.x) * 0.5,
      //                                  (foodObject.position.z - playerData.z) * 0.5,
      //                                  (foodObject.position.y - playerData.y) * 0.5);

      //       let vmult = newQuat.inverse().vmult(vec1);
      //       player.cannon.addShape(foodObject.cannon.shapes[0], vmult, newQuat.inverse());

      //       let invQuat = threeQuat.inverse();
      //       let vec2 = new THREE.Vector3((foodObject.position.x - playerData.x) * 0.5,
      //                                   (foodObject.position.y - playerData.y) * 0.5,
      //                                   (foodObject.position.z - playerData.z) * 0.5);
      //       let vecRot = vec2.applyQuaternion(invQuat);

      //       foodObject.position.set(vecRot.x, vecRot.y, vecRot.z);
      //       foodObject.quaternion.set(invQuat.x, invQuat.y, invQuat.z, invQuat.w);

      //       // add to pivot obj of player
      //       player.children[0].add(foodObject);

      //       while (player.cannon.shapes.length > 50) {
      //        player.cannon.shapes.splice(1, 1);
      //        player.cannon.shapeOffsets.splice(1, 1);
      //        player.cannon.shapeOrientations.splice(1, 1);
      //        player.children[0].children.splice(0, 1);
      //      }
      //     }else if(e.eatenPlayer){
      //       // Not working yet
      //       // // create mesh for adding eaten player(s)
      //       // var oldEatenPlayer = new THREE.Mesh( geometry, material );
      //       // oldEatenPlayer.scale.set(e.eatenPlayer.scale)

      //       // let foodObject = oldEatenPlayer;
      //       // let player = this.mesh;
      //       // let eatenData = e.eatenPlayer;

      //       // let newQuat = new CANNON.Quaternion(-playerData.qx,
      //       //                                     -playerData.qz,
      //       //                                     -playerData.qy,
      //       //                                     playerData.qw);
      //       // let newEatenQuat = new CANNON.Quaternion(-eatenData.qx,-eatenData.qz,-eatenData.qy,eatenData.qw);
      //       // let threeQuat = new THREE.Quaternion(playerData.qx,
      //       //                                      playerData.qy,
      //       //                                      playerData.qz,
      //       //                                      playerData.qw);
      //       // let threeEatenQuat = new CANNON.Quaternion(-playerData.qx,-playerData.qz,-playerData.qy, playerData.qw);

      //       // // attach player to eater
      //       // if (foodObject) {

      //       //   let vec1 = new CANNON.Vec3((eatenData.x - playerData.x) * .5,
      //       //                              (eatenData.z - playerData.z) * .5,
      //       //                              (eatenData.y - playerData.y) * .5);
      //       //   let vmult = newQuat.inverse().vmult(vec1);

      //       //   player.cannon.addShape(new CANNON.Sphere(e.eatenPlayer.scale * 10), vmult, newQuat.inverse());

      //       //   let invQuat = threeQuat.inverse();
      //       //   let vec2 = new THREE.Vector3((eatenData.x - playerData.x) * .5,
      //       //                               (eatenData.y - playerData.y) * .5,
      //       //                               (eatenData.z - playerData.z) * .5);
      //       //   let vecRot = vec2.applyQuaternion(invQuat);

      //       //   // create new clone of player to add
      //       //   // var clone = foodObject.clone();
      //       //   // clone.name = "";

      //       //   foodObject.position.set(vecRot.x, vecRot.y, vecRot.z);
      //       //   foodObject.quaternion.multiply(invQuat);

      //       //   // add to pivot obj of player
      //       //   player.children[0].add(foodObject);

      //       //}
      //     }
      //   });
      // }
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
