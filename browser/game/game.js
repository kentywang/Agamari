const THREE = require('three');

import store from '../store';
import socket from '../socket';

import { scene, camera, plane, myColors } from './main';
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
    //remove self from server db here
  };
};

export function loadEnvironment() {
  let { players } = store.getState();

  // Kenty: added if statement below to get around undefined plane error
  if (plane) plane.material.color = new THREE.Color(myColors[color]);

  // set location and rotation for other players
  // (I should probably use player.setOrientation instead)
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

        playerObject.sprite.position.x = playerObject.position.x;
        playerObject.sprite.position.y = playerObject.position.y + (scale * 5);
        playerObject.sprite.position.z = playerObject.position.z;
      }

      if (id === socket.id){
        playerObject.cannon.mass = volume * 0.01;
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

      // grow just ball physics body
      playerObject.cannon.shapes[0].radius = scale * 10;

      // camera sees more further out, less closer
      camera.far += (scale * 0.3);
      //camera.near += (data.scale * .01);
    }

  });
  //makeFood();
}

// function initMainPlayer() {
//   player = new Player( playerID, true);
//   player.init();
// }

export { loadGame, player };
