
/*----------  INITIAL STATE  ----------*/
const initialState = {
  room1: {}
};

/*----------  ACTION TYPES  ----------*/
const RECEIVE_FOOD = 'RECEIVE_FOOD';
const RECEIVE_MULTIPLE_FOOD = 'RECEIVE_MULTIPLE_FOOD';
const REMOVE_FOOD = 'REMOVE_FOOD';


/*----------  ACTION CREATORS  ----------*/
module.exports.receiveFood = (room, id, data) => ({
  type: RECEIVE_FOOD,
  room, id, data
});

module.exports.receiveMultipleFood = (room, food) => ({
  type: RECEIVE_MULTIPLE_FOOD,
  room, food
});

module.exports.removeFood = (room, id) => ({
  type: REMOVE_FOOD,
  room, id
});


/*----------  THUNK CREATORS  ----------*/

/*----------  REDUCER  ----------*/
module.exports.reducer = (state = initialState, action) => {
  // console.log("state:", state, "action:", action)
  let newState = Object.assign({}, state);
  let room, player;
  switch (action.type) {
    case RECEIVE_FOOD:
      newState[action.room] = Object.assign({}, newState[action.room]);
      newState[action.room][action.id] = action.data;
      return newState;
    case RECEIVE_MULTIPLE_FOOD:
      newState[action.room] = Object.assign({}, newState[action.room], action.food);
      return newState;
    case REMOVE_FOOD:
      newState[action.room] = Object.assign({}, newState[action.room]);
      delete newState[action.room][action.id];
      return newState;

    default: return state;

  }
};
