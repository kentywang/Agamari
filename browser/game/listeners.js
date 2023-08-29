import store from '../store';
import { attachFood, attachPlayer } from './utils';

import { closeConsole, setError } from '../reducers/controlPanel';
import { receivePlayers } from '../reducers/players';
import { receiveFood, receiveMultipleFood, removeFood } from '../reducers/food';
import { ateSomeone, fell, lose } from '../reducers/gameState';
import { receiveMessage } from '../reducers/messages';
import { casualtyReport } from '../reducers/casualty';

import {
  animate, init, scene, world,
} from './main';
import { Player } from './player';
import { Food } from './food';

export default (socket) => {
  // Receive current positions for all players and update game state
  // Happens before start and on server broadcast interval
  socket.on('player_data', (state) => {
    store.dispatch(receivePlayers(state));
  });

  // Receive current positions for all food. Happens before start.
  socket.on('food_data', (state) => {
    store.dispatch(receiveMultipleFood(state));
  });

  // Set app error state on start fail
  socket.on('start_fail', (err) => {
    store.dispatch(setError(err));
  });

  // Run init once player/food data has been received
  socket.on('start_game', () => {
    if (store.getState().gameState.isInitialized === false) {
      init();
    }
    requestAnimationFrame(animate);
    store.dispatch(closeConsole());
  });

  // Create player object when new player joins or on respawn
  socket.on('add_player', (id, initialData) => {
    const isMainPlayer = id === socket.id;
    const player = new Player(id, initialData, isMainPlayer);
    player.init();
  });

  // Remove player object when player leaves or dies
  socket.on('remove_player', (id, eaterId, eaterData, eatenData) => {
    const playerObject = scene.getObjectByName(id);
    if (eaterId === socket.id) {
      createjs.Sound.play('eatPlayerSound');
      createjs.Sound.play('eatSound');
      // store.dispatch(incrementPlayersEaten());
      store.dispatch(ateSomeone(playerObject.nickname));
    }
    if (playerObject) {
      if (eaterId) {
        // attach player if this was a eat event
        attachPlayer(id, eaterId, eaterData, eatenData);
      }
      world.remove(playerObject.cannon);
      scene.remove(playerObject.sprite);
      scene.remove(playerObject);
      const { children } = playerObject.children[0];
      for (const child of children) scene.remove(child);
      // playerObject.dispose(); // this isn't working yet
    }
  });

  // Create food object and add data to state on broadcast interval
  socket.on('add_food', (id, data) => {
    id = id.toString();
    const food = new Food(id, data);
    food.init();
    store.dispatch(receiveFood(id, data));
  });

  // Remove food data from state and add to player diet. Add food object to player
  socket.on('remove_food', (id, playerId, playerData) => {
    attachFood(id, playerId, playerData);
    store.dispatch(removeFood(id));

    if (playerId === socket.id) {
      createjs.Sound.play('eatSound');
    }
  });

  socket.on('you_got_eaten', (eater) => {
    createjs.Sound.play('eatSound');
    store.dispatch(lose(eater));
  });

  socket.on('you_fell', (world) => {
    store.dispatch(fell(world));
  });

  socket.on('add_message', (message) => {
    const { messages } = store.getState();
    store.dispatch(receiveMessage(message));
  });

  socket.on('casualty_report', (eaterNick, eatenNick) => {
    eaterNick = eaterNick.slice(0, 14);
    eatenNick = eatenNick.slice(0, 14);
    store.dispatch(casualtyReport(eaterNick, eatenNick));
  });
};
