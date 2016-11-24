import store from '../store';

import { closeConsole, setError } from '../reducers/controlPanel';

import { receivePlayers } from '../reducers/players';

import { removeFood,
         receiveFood,
         receiveMultipleFood } from '../reducers/food';

import { init,
         animate,
         scene,
         world } from '../game/main';

import { Player } from '../game/player';
import {Food} from '../game/food';

const THREE = require('three');
const CANNON = require('../../public/cannon.min.js');


export default socket => {
    socket.on('player_data', state => {
      store.dispatch(receivePlayers(state));
    });

    socket.on('food_data', state => {
      store.dispatch(receiveMultipleFood(state));
    });

    socket.on('start_fail', err => {
      store.dispatch(setError(err));
    });

    socket.on('start_game', () => {
      init();
      animate();
      store.dispatch(closeConsole());
    });

    socket.on('add_player', (id, initialData) => {
      let isMainPlayer = id === socket.id;
      let player = new Player(id, initialData, isMainPlayer);
      player.init();
    });

    socket.on('remove_player', id => {
      let playerObject = scene.getObjectByName(id);
      if (playerObject) {
        world.remove(playerObject.cannon);
        scene.remove(playerObject);
      }
    });

    socket.on('add_food', (id, data) => {
      id = id.toString();
      let food = new Food(id, data);
      food.init();
      store.dispatch(receiveFood(id, data));
    });

    socket.on('remove_food', (id, playerId, playerData) => {
        let foodObject = scene.getObjectByName(id);
        let player = scene.getObjectByName(playerId);
        let newQuat = new CANNON.Quaternion(-playerData.qx,-playerData.qz,-playerData.qy,playerData.qw);

        if (foodObject) {
          world.remove(foodObject.cannon);

          player.cannon.addShape(foodObject.cannon.shapes[0], newQuat.inverse().vmult(new CANNON.Vec3(foodObject.position.x - playerData.x,foodObject.position.z - playerData.z,foodObject.position.y - playerData.y)), newQuat.inverse());

          foodObject.position.set( foodObject.position.x - playerData.x, foodObject.position.y - playerData.y, foodObject.position.z - playerData.z);

          var pivot = new THREE.Object3D();
          pivot.quaternion.x = playerData.qx;
          pivot.quaternion.y = playerData.qy;
          pivot.quaternion.z = playerData.qz;
          pivot.quaternion.w = -playerData.qw;

          pivot.add(foodObject);
          player.add(pivot);

        }
        store.dispatch(removeFood(id));
      });
};
