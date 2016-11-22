import { Player } from './game/player';
import { forOwn } from 'lodash';

/*----------  INITIAL STATE  ----------*/
const initialState = {};

/*----------  ACTION TYPES  ----------*/
const RECEIVE_PLAYERS = 'RECEIVE_PLAYERS';
const RECEIVE_PLAYER = 'RECEIVE_PLAYER';
const UPDATE_PLAYER = 'UPDATE_PLAYER';
const REMOVE_PLAYER = 'REMOVE_PLAYER';

/*----------  ACTION CREATORS  ----------*/
export const receivePlayers = players => ({
  type: RECEIVE_PLAYERS,
  players
});

export const receivePlayer = (id, data) => ({
  type: RECEIVE_PLAYER,
  id,
  data
});

export const removePlayer = id => ({
  type: REMOVE_PLAYER,
  id
});

export const updatePlayer = (id, data) => ({
  type: UPDATE_PLAYER,
  id,
  data
});

/*----------  THUNK CREATORS  ----------*/

export const addPlayerToScene = (id, data, isMainPlayer) => dispatch => {
  dispatch(receivePlayer(id, data));
  let player = new Player(id, data, isMainPlayer);
  player.init();
};

export const addPlayersToScene = (players, socket) => dispatch => {
  forOwn(players, (data, id) => {
    let isMainPlayer = id === socket.id;
    addPlayerToScene(id, data, isMainPlayer);
  });
};

export const removePlayerFromScene = (id, scene) => dispatch => {
  dispatch(removePlayer(id));
  scene.remove(id);
};

/*----------  REDUCER  ----------*/
export default (state = initialState, action) => {
  let player;
  switch (action.type) {
    case RECEIVE_PLAYERS:
      return action.players;
    case RECEIVE_PLAYER:
      state[action.id] = action.data;
      return state;
    case REMOVE_PLAYER:
      delete state[action.id];
      return state;
    case UPDATE_PLAYER:
      player = state[action.id];
      Object.assign(player, action.data);
      return state;
    default: return state;
  }
};
