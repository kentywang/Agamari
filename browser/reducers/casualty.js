import store from '../store';

/*----------  INITIAL STATE  ----------*/
const initialState = [];

/*----------  ACTION TYPES  ----------*/

const CASUALTY_REPORT = 'CASUALTY_REPORT';
const REMOVE_LISTING = 'REMOVE_LISTING';

/*----------  ACTION CREATORS  ----------*/
export const casualtyReport = (eaterNick, eatenNick) => ({
  type: CASUALTY_REPORT,
  eaterNick,
  eatenNick
});
export const removeListing = () => ({
  type: REMOVE_LISTING
});

/*----------  THUNK CREATORS  ----------*/


/*----------  REDUCER  ----------*/
export default (state = initialState, action) => {
  switch (action.type) {
    case CASUALTY_REPORT:
      setTimeout(()=>store.dispatch(removeListing()),8000);
      return state.concat([`${action.eaterNick}   〇   ${action.eatenNick}`]);
	case REMOVE_LISTING:
      return state.slice(1);
    default: return state;
  }
};