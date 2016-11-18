const createStore = require('redux').createStore;


/*----------  INITIAL STATE  ----------*/
const initialState = {
  room1: {color : "blue"},
  room2: {color: "green"}
};

/*----------  ACTION TYPES  ----------*/
const RECEIVE_GAMESTATE = 'RECEIVE_GAMESTATE';
const UPDATE_COLOR ='UPDATE_COLOR';

/*----------  ACTION CREATORS  ----------*/
 const receiveGameState = (state, room) => ({
  type: RECEIVE_GAMESTATE, room,
  state
});

 const updateColor = (color, room) => ({
  type: UPDATE_COLOR, room,
  color
});


/*----------  THUNK CREATORS  ----------*/

/*----------  REDUCER  ----------*/
const reducer = (state = initialState, action) => {
  switch (action.type) {
    case RECEIVE_GAMESTATE:  action.state;
    case UPDATE_COLOR: 
    	let room = Object.assign({}, state[action.room], {color: action.color});
    	let newState = Object.assign({}, state);
    	newState[action.room] = room; 
    	return newState;
    default: return state;

  }
};

module.exports = createStore(reducer);













