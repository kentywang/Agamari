/*-------- ACTION TYPES  ---------*/
const INCREMENT_RECORD ='INCREMENT_RECORD';
const INCREMENT_RECORD_PLAYER = 'INCREMENT_RECORD_PLAYER';
const CLEAR_RECORD = 'CLEAR_RECORD';



/*=------ACTION CREATORS-------*/

const initialState = {
  objectEaten: 0,
  playersEaten: 0 };


export const incrementRecord = () => ({
  type: INCREMENT_RECORD,
});

export const incrementRecordPlayer = () => ({
  type: INCREMENT_RECORD_PLAYER
});

export const clearRecord = () => ({
  type: CLEAR_RECORD
});

/*----------  THUNK CREATORS  ----------*/

/*-------REDUCER------------*/

export default (state = initialState, action) => {
  switch (action.type) {
    case INCREMENT_RECORD:
      return Object.assign({}, state, {objectEaten: state.objectEaten+1});
    case INCREMENT_RECORD_PLAYER:
      return Object.assign({}, state, {playersEaten: state.playersEaten+1});
    case CLEAR_RECORD:
      return initialState;
    default:
      return state;
  }
}
