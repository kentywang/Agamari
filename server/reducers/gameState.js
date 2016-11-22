
/*----------  INITIAL STATE  ----------*/
const initialState = {
  room1: { color: 'red', players: {}, food: []},
  room2: { color: 'pink', players: {}, food: []}
};

/*----------  ACTION TYPES  ----------*/
const RECEIVE_GAMESTATE = 'RECEIVE_GAMESTATE';
const UPDATE_COLOR = 'UPDATE_COLOR';
const ADD_PLAYER = 'ADD_PLAYER';
const UPDATE_LOCATION = 'UPDATE_LOCATION';
const REMOVE_PLAYER = 'REMOVE_PLAYER';
const CREATE_FOOD = 'CREATE_FOOD';


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
  type: REMOVE_PLAYER, room, id
});

 module.exports.createFood = (xPostion,zPostion,foodShape, room) => ({
  type:CREATE_FOOD, xPostion, zPostion, foodShape, room
});


/*----------  THUNK CREATORS  ----------*/

/*----------  REDUCER  ----------*/
module.exports.reducer = (state = initialState, action) => {
  // console.log("state:", state, "action:", action)
  let room = {};
  let newState, players, player;
  switch (action.type) {
    case UPDATE_COLOR:
      room = Object.assign({}, state[action.room], {color: action.color});
      newState = Object.assign({}, state);
      newState[action.room] = room;
      return newState;
    case ADD_PLAYER:
      console.log('before', JSON.stringify(state[action.room].players));

      if (state[action.room]) {
        player = {};
        player[action.id] = Object.assign({}, state[action.room].players[action.id], action.data);
        Object.assign(state[action.room].players, player);
      }
      console.log('after', JSON.stringify(state[action.room].players));
      return state;
    case REMOVE_PLAYER:
      if (state[action.room]) delete state[action.room].players[action.id];
      return state;
    case UPDATE_LOCATION:
      console.log('before location', JSON.stringify(state[action.room].players));
      if (state[action.room]) {
        Object.assign(state[action.room].players[action.id], action.data);
      }
      console.log('after location', JSON.stringify(state[action.room].players));
      return state;
    case RECEIVE_GAMESTATE:
      //WHY EMPTY?
      break;
    case CREATE_FOOD:
      state[action.room].food.push({x:action.xPostion, z: action.zPostion, type:action.foodShape});
      return state;

    default: return state;

  }
};
