/*----------  INITIAL STATE  ----------*/
const initialState = '';


/*----------  ACTION TYPES  ----------*/

const LOSE = 'LOSE';
const CONTINUE = 'CONTINUE';
const ATE = 'ATE';
const FELL = 'FELL';

/*----------  ACTION CREATORS  ----------*/
export const lose = eater => {
	return ({
	  type: LOSE,
	  eater: eater.length > 15 ? eater.slice(0, 14) + '...' : eater
	});
};

export const keepPlaying = () => ({
  type: CONTINUE
});
export const fell = world => ({
  type: FELL,
  eaten: world
});
export const ateSomeone = eaten => {
	return ({
	  type: ATE,
	  eaten: eaten.length > 15 ? eaten.slice(0, 14) + '...' : eaten
	});
}


/*----------  THUNK CREATORS  ----------*/


/*----------  REDUCER  ----------*/
export default (state = initialState, action) => {
  switch (action.type) {
    case LOSE:
      return `${action.eater} rolled you up`;
	case FELL:
      return `you left ${action.eaten}'s orbit`;
  	case CONTINUE:
      return initialState;
    case ATE:
      return `you rolled up ${action.eaten}`;
    default: return state;
  }
};
