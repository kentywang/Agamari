import store from '../store';
import socket from '../socket';

import { makeTextSprite } from './utils';
import {
  ballMaterial, camera, scene, world,
} from './main';
import { myColors } from './config';

const THREE = require('three');
const CANNON = require('../../public/cannon.min.js');
const PlayerControls = require('./PlayerControls');

let geometry; let material; let shape; let mesh; let pivot; let name; let sprite; let
  controls;

let lastEaten = Date.now();

export class Player {
  constructor(id, data, isMainPlayer) {
    this.id = id;
    this.initialData = data;
    this.isMainPlayer = isMainPlayer;
    this.mesh;

    this.init = this.init.bind(this);
  }

  get meshData() {
    return {
      x: this.mesh.position.x,
      y: this.mesh.position.y,
      z: this.mesh.position.z,
      qx: this.mesh.quaternion.x,
      qy: this.mesh.quaternion.y,
      qz: this.mesh.quaternion.z,
      qw: this.mesh.quaternion.w,
    };
  }

  init() {
    const { isMainPlayer, id, initialData } = this;

    const someColors = myColors();

    const aFewColors = ['#6C5B7B',
      '#355C7D',
      '#99B898',
      '#2A363B',
      '#A8A7A7',
      '#b45431',
      '#37797b',
      '#547980'];
    const randomColor = aFewColors[~~(Math.random() * aFewColors.length)];

    // THREE
    geometry = new THREE.TetrahedronBufferGeometry(10, 2);
    material = new THREE.MeshPhongMaterial({
      color: randomColor,
      shading: THREE.FlatShading,
    });
    mesh = new THREE.Mesh(geometry, material);

    // Cannon
    shape = new CANNON.Sphere(10);
    if (isMainPlayer) {
      mesh.cannon = new CANNON.Body({
        shape,
        mass: 35,
        material: ballMaterial,
      });
      mesh.cannon.linearDamping = mesh.cannon.angularDamping = 0.41;
    } else {
      mesh.cannon = new CANNON.Body({ shape, mass: 0 });
    }

    mesh.castShadow = true;

    // set spawn position according to server socket message
    mesh.position.x = initialData.x;
    mesh.position.y = initialData.y;
    mesh.position.z = initialData.z;

    // set spawn somewhere a bit in the air
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

    // add Cannon body
    mesh.cannon.position.x = mesh.position.x;
    mesh.cannon.position.z = mesh.position.y;
    mesh.cannon.position.y = mesh.position.z;
    mesh.cannon.quaternion.x = -mesh.quaternion.x;
    mesh.cannon.quaternion.z = -mesh.quaternion.y;
    mesh.cannon.quaternion.y = -mesh.quaternion.z;
    mesh.cannon.quaternion.w = mesh.quaternion.w;

    scene.add(mesh);
    world.add(mesh.cannon);

    // use the Cannon preStep callback, evoked each timestep, to apply the gravity from the planet center to the main player.
    if (isMainPlayer) {
      mesh.cannon.preStep = function () {
        let ball_to_planet = new CANNON.Vec3();
        this.position.negate(ball_to_planet);

        const distance = ball_to_planet.norm();

        ball_to_planet.normalize();
        ball_to_planet = ball_to_planet.scale(4500000 * this.mass / distance ** 2);
        world.gravity.set(ball_to_planet.x, ball_to_planet.y, ball_to_planet.z); // changing gravity seems to apply friction, whereas just applying force doesn't
      };
    }

    this.mesh = mesh;

    if (!isMainPlayer) {
      // show name on player if not main player
      const { nickname } = initialData;
      name = nickname.length > 8 ? nickname.slice(0, 7) : nickname;
      sprite = makeTextSprite(name, 70);
      mesh.sprite = sprite;
      scene.add(sprite);

      // set no collisions with other players (mitigate latency issues)
      this.mesh.cannon.collisionResponse = 0;

      // collision handler
      this.mesh.cannon.addEventListener('collide', (e) => {
        const { players } = store.getState();
        const player = scene.getObjectByName(socket.id);
        // cooldown timer for being eaten
        if (player && Date.now() - lastEaten > 5000) {
          // ensure collision was between this player and main player
          for (const contact of world.contacts) {
            const thisHits = contact.bi === this.mesh.cannon;
            const mainIsHit = contact.bj === player.cannon;
            const mainHits = contact.bi === player.cannon;
            const thisIsHit = contact.bj === this.mesh.cannon;
            if (thisHits && mainIsHit || mainHits && thisIsHit) {
              const mainVol = players[socket.id].volume;
              const thisVol = players[this.id].volume;

              // if main player smaller, emit event
              if (thisVol > mainVol) {
                lastEaten = Date.now();
                socket.emit('got_eaten', id, thisVol + mainVol);
              }
            }
          }
        }
      });
    }

    // add controls and camera
    if (isMainPlayer) {
      controls = new THREE.PlayerControls(
        camera,
        this.mesh,
        this.mesh.cannon,
        id,
      );
    }
  }
}

export { controls };
