/*----------  INITIAL STATE  ----------*/
const initialState = {launch: false};


/*----------  ACTION TYPES  ----------*/

const LAUNCH = 'LAUNCH';
const LAUNCH_READY = 'LAUNCH_READY';


/*----------  ACTION CREATORS  ----------*/
export const launch = () => ({
	type: LAUNCH
});
export const launchReady = () => ({
  type: LAUNCH_READY
});


/*----------  THUNK CREATORS  ----------*/


/*----------  REDUCER  ----------*/
export default (state = initialState, action) => {
  switch (action.type) {
    case LAUNCH:
      return Object.assign({}, state, {launch: false});
  	case LAUNCH_READY:
      return Object.assign({}, state, {launch: true});
    default: return state;
  }
};
