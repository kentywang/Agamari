/*----------  INITIAL STATE  ----------*/
const initialState = {};

/*----------  ACTION TYPES  ----------*/
const RECEIVE_PREV_PLAYERS = 'RECEIVE_PREV_PLAYERS';
const REMOVE_ALL_PREV_PLAYERS = 'REMOVE_ALL_PREV_PLAYERS';


/*----------  ACTION CREATORS  ----------*/
export const receivePrevPlayers = (players) => ({
  type: RECEIVE_PREV_PLAYERS,
  players
});

export const removeAllPrevPlayers = () => ({
  type: REMOVE_ALL_PREV_PLAYERS
});


/*----------  THUNK CREATORS  ----------*/

/*----------  REDUCER  ----------*/
export default (state = initialState, action) => {
  switch (action.type) {
    case RECEIVE_PREV_PLAYERS:
      return action.players;
    case REMOVE_ALL_PREV_PLAYERS:
      return initialState;
    default: return state;
  }
};
