let newState, idx;
const { findIndex }  = require('lodash');
const World = require('../db/models/world');

/*----------  INITIAL STATE  ----------*/
const initialState = [];


/*----------  ACTION TYPES  ----------*/
const ADD_WORLD = 'ADD_WORLD';
const REMOVE_WORLD = 'REMOVE_WORLD';

/*----------  ACTION CREATORS  ----------*/
const addWorld = world => ({
  type: ADD_WORLD,
  world
});

const removeWorld = id => ({
  type: REMOVE_WORLD,
  id
});


/*----------  THUNK CREATORS  ----------*/
const destroyWorld = id => dispatch => {
  World.blowUp(id);
  dispatch(removeWorld(id));
};

/*----------  REDUCER  ----------*/
const reducer = (state = initialState, action) => {
  switch (action.type) {
    case ADD_WORLD:
      if (findIndex(state, { id: action.world.id }) === -1) return [...state, action.world];
      else return state;
    case REMOVE_WORLD:
      idx = findIndex(state, { id: action.id });
      if (idx + 1) {
        newState = [...state];
        newState.splice(idx, 1);
        return newState;
      } else {
        return state;
      }
    default: return state;
  }
};

module.exports = { reducer, addWorld, removeWorld, destroyWorld };
