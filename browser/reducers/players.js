/*----------  INITIAL STATE  ----------*/
const initialState = {};

/*----------  ACTION TYPES  ----------*/
const RECEIVE_PLAYERS = 'RECEIVE_PLAYERS';


/*----------  ACTION CREATORS  ----------*/
export const receivePlayers = (players) => ({
  type: RECEIVE_PLAYERS,
  players
});


/*----------  THUNK CREATORS  ----------*/

/*----------  REDUCER  ----------*/
export default (state = initialState, action) => {
  switch (action.type) {
    case RECEIVE_PLAYERS:
      return action.players;
    default: return state;
  }
};
