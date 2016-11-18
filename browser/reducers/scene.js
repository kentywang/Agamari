/*----------  INITIAL STATE  ----------*/
const initialState = null;

/*----------  ACTION TYPES  ----------*/
const RECEIVE_SCENE = 'RECEIVE_SCENE';

/*----------  ACTION CREATORS  ----------*/
export const receiveScene = scene => ({
  type: RECEIVE_SCENE,
  scene
});

/*----------  THUNK CREATORS  ----------*/

/*----------  REDUCER  ----------*/
export default (state = initialState, action) => {
  switch (action.type) {
    case RECEIVE_SCENE: return action.scene;
    default: return state;
  }
};
