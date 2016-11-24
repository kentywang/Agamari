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

    socket.on('remove_food', id => {
      let foodObject = scene.getObjectByName(id);
      if (foodObject) {
        world.remove(foodObject.cannon);
        scene.remove(foodObject);
      }
      store.dispatch(removeFood(id));
    });
};
