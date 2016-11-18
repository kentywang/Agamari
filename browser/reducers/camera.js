/*----------  INITIAL STATE  ----------*/
const initialState = null;

/*----------  ACTION TYPES  ----------*/
const RECEIVE_CAMERA = 'RECEIVE_CAMERA';

/*----------  ACTION CREATORS  ----------*/
export const receiveCamera = camera => ({
  type: RECEIVE_CAMERA,
  camera
});

/*----------  THUNK CREATORS  ----------*/

/*----------  REDUCER  ----------*/
export default (state = initialState, action) => {
  switch (action.type) {
    case RECEIVE_CAMERA: return action.camera;
    default: return state;
  }
};
