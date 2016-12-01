/*----------  INITIAL STATE  ----------*/
const initialState = {};

/*----------  ACTION TYPES  ----------*/
const RECEIVE_PLAYERS = 'RECEIVE_PLAYERS';
const REMOVE_ALL_PLAYERS = 'REMOVE_ALL_PLAYERS';


/*----------  ACTION CREATORS  ----------*/
export const receivePlayers = (players) => ({
  type: RECEIVE_PLAYERS,
  players
});

export const removeAllPlayers = () => ({
  type: REMOVE_ALL_PLAYERS
});


/*----------  THUNK CREATORS  ----------*/

/*----------  REDUCER  ----------*/
export default (state = initialState, action) => {
  switch (action.type) {
    case RECEIVE_PLAYERS:
      return action.players;
    case REMOVE_ALL_PLAYERS:
      return initialState;
    default: return state;
  }
};
