/*----------  INITIAL STATE  ----------*/
const initialState = null;

/*----------  ACTION TYPES  ----------*/
const RECEIVE_RENDERER = 'RECEIVE_RENDERER';

/*----------  ACTION CREATORS  ----------*/
export const receiveRenderer = renderer => ({
  type: RECEIVE_RENDERER,
  renderer
});

/*----------  THUNK CREATORS  ----------*/

/*----------  REDUCER  ----------*/
export default (state = initialState, action) => {
  switch (action.type) {
    case RECEIVE_RENDERER: return action.renderer;
    default: return state;
  }
};
