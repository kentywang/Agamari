
/*----------  INITIAL STATE  ----------*/
const initialState = {
  room1: {}
};

/*----------  ACTION TYPES  ----------*/
const RECEIVE_PLAYERS = 'RECEIVE_PLAYERS';
const RECEIVE_PLAYER = 'RECEIVE_PLAYER';
const UPDATE_PLAYER = 'UPDATE_PLAYER';
const CHANGE_PLAYER_SCALE = 'CHANGE_PLAYER_SCALE';
const REMOVE_PLAYER = 'REMOVE_PLAYER';


/*----------  ACTION CREATORS  ----------*/
export const receivePlayers = (players, room) => ({
  type: RECEIVE_PLAYERS,
  players, room
});

export const receivePlayer = (id, data, room) => ({
  type: RECEIVE_PLAYER,
  id, data, room
});

export const updatePlayer = (id, data, room) => ({
  type: UPDATE_PLAYER,
  id, data, room
});

export const changePlayerScale = (id, change, room) => ({
  type: CHANGE_PLAYER_SCALE,
  id, change, room
});

export const removePlayer = (id, room) => ({
  type: REMOVE_PLAYER,
  id, room
});


/*----------  THUNK CREATORS  ----------*/

/*----------  REDUCER  ----------*/
module.exports.reducer = (state = initialState, action) => {
  // console.log("state:", state, "action:", action)
  let newState = Object.assign({}, state);
  let room, player;
  switch (action.type) {
    case RECEIVE_PLAYERS:
      newState[action.room] = action.players;
      return newState;
    case RECEIVE_PLAYER:
      newState[action.room] = Object.assign({}, newState[action.room]);
      newState[action.room][action.id] = action.data;
      return newState;
    case UPDATE_PLAYER:
      newState[action.room] = Object.assign({}, newState[action.room]);
      newState[action.room][action.id] = Object.assign({}, newState[action.room][action.id], action.data);
      return newState;
    case CHANGE_PLAYER_SCALE:
      newState[action.room] = Object.assign({}, newState[action.room]);
      newState[action.room][action.id] = Object.assign({}, newState[action.room][action.id], {scale: newState[action.room][action.id].scale + action.change});
      return newState;
    case REMOVE_PLAYER:
      newState[action.room] = Object.assign({}, newState[action.room]);
      delete newState[action.room][action.id];
      return newState;

    default: return state;

  }
};
