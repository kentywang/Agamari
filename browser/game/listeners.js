import store from '../store';
import { attachFood } from './utils';

import { authenticated } from '../reducers/user';
import { closeConsole,
         setPassword,
         setError,
         resetError } from '../reducers/controlPanel';
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


export default socket => {
  let { user } = store.getState();
  socket.on('authenticated', user => {
    store.dispatch(authenticated(user));
    store.dispatch(resetError());
    console.log('authentication approved');
  });

  socket.on('authentication_failed', () => {
    store.dispatch(setError('Incorrect email or password.'));
    store.dispatch(setPassword(''));
  });

  // Receive current positions for all players and update game state
  // Happens before start and on server broadcast interval
  socket.on('player_data', state => {
    store.dispatch(receivePlayers(state));
  });

  // Receive current positions for all food. Happens before start.
  socket.on('food_data', state => {
    store.dispatch(receiveMultipleFood(state));
  });

  // Set app error state on start fail
  socket.on('start_fail', err => {
    store.dispatch(setError(err));
  });

  // Run init once player/food data has been received
  socket.on('start_game', () => {
    init();
    animate();
    store.dispatch(closeConsole());
  });

  // Create player object when new player joins or on respawn
  socket.on('add_player', (id, initialData) => {
    let isMainPlayer = id == user.id;
    let player = new Player(id, initialData, isMainPlayer);
    player.init();
  });

  // Remove player object when player leaves or dies
  socket.on('remove_player', (id, eaterId) => {
    let playerObject = scene.getObjectByName(id.toString());
    if (playerObject) {
      world.remove(playerObject.cannon);
      scene.remove(playerObject.sprite);
      scene.remove(playerObject);
      let { children } = playerObject.children[0];
      for (let child of children) scene.remove(child);
      if (eaterId == user.id) createjs.Sound.play('eatSound');
    }
  });

  // Create food object and add data to state on broadcast interval
  socket.on('add_food', (id, data) => {
    id = id.toString();
    let food = new Food(id, data);
    food.init();
    store.dispatch(receiveFood(id, data));
  });

  // Remove food data from state and add to player diet. Add food object to player
  socket.on('remove_food', (id, playerId, playerData) => {
      attachFood(id, playerId, playerData);
      store.dispatch(removeFood(id));

      if (playerId == user.id){
        createjs.Sound.play('eatSound');
        //console.log(scene.getObjectByName(playerId).cannon.mass)
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
