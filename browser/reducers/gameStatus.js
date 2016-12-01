/*----------  INITIAL STATE  ----------*/
const initialState = '';


/*----------  ACTION TYPES  ----------*/

const LOSE = 'LOSE';
const CONTINUE = 'CONTINUE';
const ATE = 'ATE';
const FELL = 'FELL';

/*----------  ACTION CREATORS  ----------*/
export const lose = eater => {
	if(eater.length > 15){
		eater = eater.slice(0,14) + "..."; 
	}

	return ({
	  type: LOSE,
	  eater
	});
}
export const keepPlaying = () => ({
  type: CONTINUE
});
export const fell = room => ({
  type: FELL,
  eaten: room
});
export const ateSomeone = eaten => {
	if(eaten.length > 15){
		eaten = eaten.slice(0,14) + "..."; 
	}

	return ({
	  type: ATE,
	  eaten
	});
}


/*----------  THUNK CREATORS  ----------*/


/*----------  REDUCER  ----------*/
export default (state = initialState, action) => {
  switch (action.type) {
    case LOSE:
      return `${action.eater} rolled you up`;
	case FELL:
      return `You left ${action.eaten}'s orbit`;
  	case CONTINUE:
      return initialState;
    case ATE:
      return `you rolled up ${action.eaten}`;
    default: return state;
  }
};
