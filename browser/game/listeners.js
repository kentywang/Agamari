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

// import { cloneDeep } from 'lodash';

const THREE = require('three');
const CANNON = require('../../public/cannon.min.js');


export default socket => {
    socket.on('player_data', state => {
      //console.log(state)
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


    socket.on('remove_eaten_player', (id, playerId, playerData, eatenData) => {
      let playerObject = scene.getObjectByName(id);
      if (playerObject) {
        world.remove(playerObject.cannon);
        attachCopyOfFood(id, playerId, playerData);
        scene.remove(playerObject);
      }
      // careful where spawns are, as the game may break if player constantly falls into larger player

      // still need to implement physics food attachment and other players eaten too (recursive?)

      //delete scene.getObjectByName(id).cannon;
      // let playerObject = scene.getObjectByName(id);
      // let player = scene.getObjectByName(playerId);
      // let newQuat = new CANNON.Quaternion(-playerData.qx,-playerData.qz,-playerData.qy,playerData.qw);
      // let newEatenQuat = new CANNON.Quaternion(-eatenData.qx,-eatenData.qz,-eatenData.qy,eatenData.qw);
      // let threeQuat = new THREE.Quaternion(-playerData.qx,-playerData.qy,-playerData.qz,playerData.qw);

      // // attach food to player
      // if (playerObject) {
      //   world.remove(playerObject.cannon);
      //   player.cannon.addShape(playerObject.cannon.shapes[0], newQuat.inverse().vmult(new CANNON.Vec3(eatenData.x - playerData.x,eatenData.z - playerData.z,eatenData.y - playerData.y)), newQuat.inverse());

      //   // if(eatenData.diet && eatenData.diet.length){
      //   //   for(var i = 1; i < playerObject.cannon.shapes.length; i++){
      //   //     console.log("rast")
      //   //     // let eatenPos = newEatenQuat.inverse().vmult(new CANNON.Vec3(eatenData.diet[i - 1].food.x - eatenData.x,eatenData.diet[i - 1].food.z - eatenData.z, eatenData.diet[i - 1].food.y - eatenData.y))
      //   //     // let eatenOrient = newEatenQuat.inverse();

      //   //     // player.cannon.addShape(playerObject.cannon.shapes[i], eatenPos);
      //   //   }
      //   // }
      //   //need recursive case;
      //   delete playerObject.cannon;

      //   playerObject.position.set(eatenData.x - playerData.x, eatenData.y - playerData.y, eatenData.z - playerData.z)

      //   var pivot = new THREE.Object3D();
      //   pivot.quaternion.x = playerData.qx;
      //   pivot.quaternion.y = playerData.qy;
      //   pivot.quaternion.z = playerData.qz;
      //   pivot.quaternion.w = -playerData.qw;

      //   pivot.add(playerObject);
      //   player.add(pivot);

      // }

    });

    socket.on('remove_food', (id, playerId, playerData) => {
        attachFood(id, playerId, playerData);
        store.dispatch(removeFood(id));
      });
};

function attachFood(id, playerId, playerData){
  let foodObject = scene.getObjectByName(id);
  let player = scene.getObjectByName(playerId);
  let newQuat = new CANNON.Quaternion(-playerData.qx,-playerData.qz,-playerData.qy,playerData.qw);

  // attach food to player
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
}

function attachCopyOfFood(id, playerId, playerData){
  let realFoodObject = scene.getObjectByName(id);
  let foodObject = realFoodObject.clone();
  foodObject.name = undefined;
  let player = scene.getObjectByName(playerId);
  let newQuat = new CANNON.Quaternion(-playerData.qx,-playerData.qz,-playerData.qy,playerData.qw);
  console.log(foodObject)
  // attach food to player
  if (foodObject) {
    player.cannon.addShape(realFoodObject.cannon.shapes[0], newQuat.inverse().vmult(new CANNON.Vec3(foodObject.position.x - playerData.x,foodObject.position.z - playerData.z,foodObject.position.y - playerData.y)), newQuat.inverse());

    foodObject.position.set( foodObject.position.x - playerData.x, foodObject.position.y - playerData.y, foodObject.position.z - playerData.z);

    var pivot = new THREE.Object3D();
    pivot.quaternion.x = playerData.qx;
    pivot.quaternion.y = playerData.qy;
    pivot.quaternion.z = playerData.qz;
    pivot.quaternion.w = -playerData.qw;

    //scene.add(foodObject)
    pivot.add(foodObject);
    player.add(pivot);

  }
}