const THREE = require('three');

import store from '../store';
import socket from '../socket';

import { scene, camera } from './main';
import { forOwn } from 'lodash';


let player;
let color = 'red';

const loadGame = () => {
  // load the environment
  loadEnvironment();

  window.onunload = function() {
    //remove self from server db here
  };

  window.onbeforeunload = function() {
    //remove self from server db herew
  };
};

export function loadEnvironment() {
  let { players } = store.getState();

  // set location and rotation for other players
  forOwn(players, (data, id) => {
    let playerObject = scene.getObjectByName(id);
    let { x, y, z, qx, qy, qz, qw, scale, volume} = data;
    if (playerObject && playerObject.cannon) {
       if (id !== socket.id) {
        playerObject.position.x = x;
        playerObject.position.y = y;
        playerObject.position.z = z;
        playerObject.quaternion.x = qx;
        playerObject.quaternion.y = qy;
        playerObject.quaternion.z = qz;
        playerObject.quaternion.w = qw;

        if (playerObject.sprite) {
          playerObject.sprite.position.copy(playerObject.position);
          playerObject.sprite.position.add(playerObject.sprite.position.clone().normalize().multiplyScalar(scale * 12))
        }
      }

      // if (id === socket.id){
      //   playerObject.cannon.mass = volume * 0.01;
      // }

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

      // grow just ball physics body
      playerObject.cannon.shapes[0].radius = scale * 10;

      // camera sees more further out, less closer
      camera.far += (scale * 0.3);
    }

  });
  //makeFood();
}

// function initMainPlayer() {
//   player = new Player( playerID, true);
//   player.init();
// }

export { loadGame, player };
