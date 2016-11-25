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

    socket.on('remove_food', (id, playerId, playerData) => {
        attachFood(id, playerId, playerData);
        store.dispatch(removeFood(id));
        
        if (playerId == socket.id){
          createjs.Sound.play("eatSound");
        }
      });

//     socket.on('remove_eaten_player', (id, playerId, playerData, eatenData) => {
//       let playerObject = scene.getObjectByName(id);
//       if (playerObject) {
//         world.remove(playerObject.cannon);
//         attachCopyOfFood(id, playerId, playerData);
//         scene.remove(playerObject);
//       }
//       // careful where spawns are, as the game may break if player constantly falls into larger player

//       // still need to implement physics food attachment and other players eaten too (recursive?)

//       // for other players
//       // if(eatenData.diet && eatenData.diet.length){
//       //   let newQuat = new CANNON.Quaternion(-playerData.qx,-playerData.qz,-playerData.qy,playerData.qw);
//       //   let newEatenQuat = new CANNON.Quaternion(-eatenData.qx,-eatenData.qz,-eatenData.qy,eatenData.qw);
//       //   for(var i = 1; i < playerObject.cannon.shapes.length; i++){
//       //     let eatenPos = newEatenQuat.inverse().vmult(new CANNON.Vec3(eatenData.diet[i - 1].food.x - eatenData.x,eatenData.diet[i - 1].food.z - eatenData.z, eatenData.diet[i - 1].food.y - eatenData.y))
//       //     let eatenOrient = newEatenQuat.inverse();

//       //     scene.getObjectByName(playerId).cannon.addShape(playerObject.cannon.shapes[i], newQuat.inverse().vmult(new CANNON.Vec3(playerObject.position.x - playerData.x,playerObject.position.z - playerData.z,playerObject.position.y - playerData.y)).vadd(eatenPos), newQuat.inverse().mult(eatenOrient));
//       //   }
//       // }

//       // for just food
//       // if(eatenData.diet && eatenData.diet.length){
//       //   let newQuat = new CANNON.Quaternion(-playerData.qx,-playerData.qz,-playerData.qy,playerData.qw);
//       //   let newEatenQuat = new CANNON.Quaternion(-eatenData.qx,-eatenData.qz,-eatenData.qy,eatenData.qw);
//       //   for(var i = 1; i < playerObject.cannon.shapes.length; i++){

//       //     let eatenPos = newEatenQuat.inverse().vmult(new CANNON.Vec3(eatenData.diet[i - 1].food.x - eatenData.x,eatenData.diet[i - 1].food.z - eatenData.z, eatenData.diet[i - 1].food.y - eatenData.y))
//       //     let eatenOrient = newEatenQuat.inverse();

//       //     scene.getObjectByName(playerId).cannon.addShape(playerObject.cannon.shapes[i], newQuat.inverse().vmult(new CANNON.Vec3(playerObject.position.x - playerData.x,playerObject.position.z - playerData.z,playerObject.position.y - playerData.y)).vadd(eatenPos));
//       //   }
//       // }

//     });

};

function attachFood(id, playerId, playerData){
  let foodObject = scene.getObjectByName(id);
  let player = scene.getObjectByName(playerId);
  let newQuat = new CANNON.Quaternion(-playerData.qx,-playerData.qz,-playerData.qy,playerData.qw);
  let threeQuat = new THREE.Quaternion(playerData.qx,playerData.qy,playerData.qz,playerData.qw);

  // attach food to player
  if (foodObject) {
    world.remove(foodObject.cannon);

    player.cannon.addShape(foodObject.cannon.shapes[0], newQuat.inverse().vmult(new CANNON.Vec3((foodObject.position.x - playerData.x) * 0.6,(foodObject.position.z - playerData.z) * 0.6,(foodObject.position.y - playerData.y) * 0.6)), newQuat.inverse());

    let invQuat = threeQuat.inverse();
    let vec = new THREE.Vector3((foodObject.position.x - playerData.x) * 0.6, (foodObject.position.y - playerData.y) * 0.6, (foodObject.position.z - playerData.z) * 0.6);
    let vecRot = vec.applyQuaternion(invQuat);

    foodObject.position.set(vecRot.x, vecRot.y, vecRot.z);
    foodObject.quaternion.set(invQuat.x, invQuat.y, invQuat.z, invQuat.w);


    // var pivot = new THREE.Object3D();
    // pivot.quaternion.x = playerData.qx;
    // pivot.quaternion.y = playerData.qy;
    // pivot.quaternion.z = playerData.qz;
    // pivot.quaternion.w = -playerData.qw;

    // pivot.add(foodObject);
    player.add(foodObject);

     if(player.cannon.shapes.length > 200){
       player.cannon.shapes.splice(1,1);
       player.cannon.shapeOffsets.splice(1,1);
       player.cannon.shapeOrientations.splice(1,1);
       player.children.splice(0,1);
     }
  }
}

// function attachCopyOfFood(id, playerId, playerData){
//   let realFoodObject = scene.getObjectByName(id);
//   let foodObject = realFoodObject.clone();
//   foodObject.name = undefined;
//   let player = scene.getObjectByName(playerId);
//   let newQuat = new CANNON.Quaternion(-playerData.qx,-playerData.qz,-playerData.qy,playerData.qw);

//   // attach food to player
//   if (foodObject) {
//     player.cannon.addShape(realFoodObject.cannon.shapes[0], newQuat.inverse().vmult(new CANNON.Vec3(foodObject.position.x - playerData.x,foodObject.position.z - playerData.z,foodObject.position.y - playerData.y)), newQuat.inverse());

//     foodObject.position.set( foodObject.position.x - playerData.x, foodObject.position.y - playerData.y, foodObject.position.z - playerData.z);

//     var pivot = new THREE.Object3D();
//     pivot.quaternion.x = playerData.qx;
//     pivot.quaternion.y = playerData.qy;
//     pivot.quaternion.z = playerData.qz;
//     pivot.quaternion.w = -playerData.qw;

//     //scene.add(foodObject)
//     pivot.add(foodObject);
//     player.add(pivot);

//   }
// }