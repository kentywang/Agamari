const THREE = require('three');

import store from '../store';
import socket from '../socket';

import { scene, camera, playerID, myColors } from './main';
import { Player } from './player';
import { forOwn } from 'lodash';


let player;
let color = 'red';

const loadGame = () => {
  // load the environment
  loadEnvironment();

  // load the player
  // initMainPlayer();


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
  // if (plane) plane.material.color = new THREE.Color(myColors[color]);

  // set location and rotation for other players (I should probably use player.setOrientation instead)
  forOwn(players, (data, id) => {
    let playerObject = scene.getObjectByName(id);
    if (playerObject && playerObject.cannon) {
       if (id !== socket.id) {
        playerObject.position.x = data.x;
        playerObject.position.y = data.y;
        playerObject.position.z = data.z;
        playerObject.quaternion.x = data.qx;
        playerObject.quaternion.y = data.qy;
        playerObject.quaternion.z = data.qz;
        playerObject.quaternion.w = data.qw;

        playerObject.sprite.position.x = playerObject.position.x;
        playerObject.sprite.position.y = playerObject.position.y + (data.scale * 5);
        playerObject.sprite.position.z = playerObject.position.z;
      }
      if (id === socket.id){
        playerObject.cannon.mass = data.volume * .01;
      }
      // scale name text
      if(playerObject.sprite){
        playerObject.sprite.scale.set(data.scale * 50, data.scale * 25, data.scale * .5);
      }

      // grow ball while preserving food size
      playerObject.scale.x = playerObject.scale.y = playerObject.scale.z = data.scale;
      playerObject.children[0].scale.x = playerObject.children[0].scale.y = playerObject.children[0].scale.z = 1/data.scale;

      // grow just ball physics body
      playerObject.cannon.shapes[0].radius = data.scale * 10;

      // camera sees more further out, less closer
      camera.far += (data.scale * .3);  
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
