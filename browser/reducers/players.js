
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
module.exports.reducer = (state = initialState, action) => {
  // console.log("state:", state, "action:", action)
  let newState = Object.assign({}, state);
  let room, player;
  switch (action.type) {
    case RECEIVE_PLAYERS:
      return action.players;

    default: return state;

  }
};
