import { reducerMode } from '../game/main';
let newState;

/*----------  INITIAL STATE  ----------*/
const initialState = {};

/*----------  ACTION TYPES  ----------*/
const RECEIVE_PLAYERS = 'RECEIVE_PLAYERS';


/*----------  ACTION CREATORS  ----------*/
export const receivePlayers = (players, room) => ({
  type: RECEIVE_PLAYERS,
  players, room
});


/*----------  THUNK CREATORS  ----------*/

/*----------  REDUCER  ----------*/
const immutable = (state = initialState, action) => {
  switch (action.type) {
    case RECEIVE_PLAYERS:
      newState = Object.assign({}, state);
      newState[action.room] = action.players;
      return newState;
    default: return state;
  }
};


const semimutable = (state = initialState, action) => {
  switch (action.type) {
    case RECEIVE_PLAYERS:
      newState = Object.assign({}, state);
      newState[action.room] = action.players;
      return newState;
    default: return state;
  }
};


const mutable = (state = initialState, action) => {
  switch (action.type) {
    case RECEIVE_PLAYERS:
      state[action.room] = action.players;
      return state;
    default: return state;
  }
};

const chooseReducer = reducerMode => {
  switch (reducerMode) {
    case 'mutable': return mutable;
    case 'semimutable': return semimutable;
    case 'immutable': return immutable;
    default: return mutable;
  }
};

export default chooseReducer(reducerMode);
