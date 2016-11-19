
/*----------  INITIAL STATE  ----------*/
const initialState = {
  room1: { color : 'blue', players: {}},
  room2: { color: 'green', players: {}}
};

/*----------  ACTION TYPES  ----------*/
const RECEIVE_GAMESTATE = 'RECEIVE_GAMESTATE';
const UPDATE_COLOR = 'UPDATE_COLOR';
const ADD_PLAYER = 'ADD_PLAYER';
const UPDATE_LOCATION = 'UPDATE_LOCATION';
const REMOVE_PLAYER = 'REMOVE_PLAYER';

/*----------  ACTION CREATORS  ----------*/
 module.exports.receiveGameState = (state, room) => ({
  type: RECEIVE_GAMESTATE, room,
  state
});

 module.exports.updateColor = (color, room) => ({
  type: UPDATE_COLOR, room,
  color
});

 module.exports.addPlayer = (id, data, room) => ({
  type: ADD_PLAYER,
  id,
  data,
  room
});

module.exports.updateLocation = (player, room) => ({
  type: UPDATE_LOCATION,
  id,
  data,
  room
});

 module.exports.removePlayer = (id, room) => ({
  type: REMOVE_PLAYER, room
});


/*----------  THUNK CREATORS  ----------*/

/*----------  REDUCER  ----------*/
module.exports.reducer = (state = initialState, action) => {
  console.log("state:", state, "action:", action)
  let room = {};
  let newState, players;
  switch (action.type) {
    case UPDATE_COLOR:
      room = Object.assign({}, state[action.room], {color: action.color});
      newState = Object.assign({}, state);
      newState[action.room] = room;
      return newState;
    case ADD_PLAYER:
      state[action.room].players[action.id] = action.data;
      return state;
    case UPDATE_LOCATION:
      state[action.room].players[action.id] = action.data;
      return state;
    case RECEIVE_GAMESTATE:
    default: return state;

  }
};
