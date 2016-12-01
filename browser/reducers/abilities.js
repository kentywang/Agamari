/*----------  INITIAL STATE  ----------*/
const initialState = {launch: false, meter: '               '};


/*----------  ACTION TYPES  ----------*/

const LAUNCH = 'LAUNCH';
const LAUNCH_READY = 'LAUNCH_READY';
const BUILD = 'BUILD';


/*----------  ACTION CREATORS  ----------*/
export const launch = () => ({
	type: LAUNCH
});
export const launchReady = () => ({
  type: LAUNCH_READY
});
export const buildUp = (num) => {
	var meter = '';
	for(var i = 0; i < num; i++){
		meter = '|' + meter;
	}
	return {
	  type: BUILD,
	  meter
	}
};

/*----------  THUNK CREATORS  ----------*/


/*----------  REDUCER  ----------*/
export default (state = initialState, action) => {
  switch (action.type) {
    case LAUNCH:
      return Object.assign({}, state, {launch: false, meter: ''});
  	case LAUNCH_READY:
      return Object.assign({}, state, {launch: true});
    case BUILD:
      return Object.assign({}, state, {meter: action.meter});
    default: return state;
  }
};
