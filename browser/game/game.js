import store from '../store';
import socket from '../socket';

import { scene, camera } from './main';
import { forOwn } from 'lodash';

const THREE = require('three');

let player;

const loadGame = () => {
  // load the environment
  loadEnvironment();
};

export function loadEnvironment() {
  let { players } = store.getState();

  forOwn(players, (data, id) => {
    let playerObject = scene.getObjectByName(id);

    let { x, y, z, qx, qy, qz, qw, scale, volume} = data;

    // set location and rotation for other players based on server socket message
    if (playerObject && playerObject.cannon) {
       if (id !== socket.id) {
        playerObject.position.x = x;
        playerObject.position.y = y;
        playerObject.position.z = z;
        playerObject.quaternion.x = qx;
        playerObject.quaternion.y = qy;
        playerObject.quaternion.z = qz;
        playerObject.quaternion.w = qw;

        // position name text according to scale
        if (playerObject.sprite) {
          playerObject.sprite.position.copy(playerObject.position);
          playerObject.sprite.position.add(playerObject.sprite.position.clone().normalize().multiplyScalar(scale * 15))
        }
      }

      // add mass to self according to scale
      if (id === socket.id){
        playerObject.cannon.mass = 28 + (scale * 6);
      }

      // scale name text
      if (playerObject.sprite){
        playerObject.sprite.scale.set(scale * 50,
                                      scale * 25,
                                      scale * 0.5);
      }

      // grow ball while preserving food size
      playerObject.scale.x = playerObject.scale.y = playerObject.scale.z = scale;

      playerObject.children[0].scale.x =
        playerObject.children[0].scale.y =
        playerObject.children[0].scale.z = 1 / scale;

      // grow just players' ball physics body
      playerObject.cannon.shapes[0].radius = scale * 10;

      // camera sees more further out, less closer
      camera.far += (scale * 0.3);
    }

  });
}

export { loadGame, player };
