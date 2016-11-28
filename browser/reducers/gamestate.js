/*-------- ACTION TYPES  ---------*/

//const IS_DISPLAYED = 'IS_DISPLAYED';
const OPEN_GAME ='OPEN_GAME';
const STOP_GAME = 'STOP_GAME';


/*=------ACTION CREATORS-------*/

export const initialState = {
	isOpen:true
};

export const start = () => ({
  type: OPEN_GAME,
});

export const stop = () => ({
  type: STOP_GAME
});

/*-------REDUCER------------*/

export default (state = initialState, action) => {
  switch (action.type) {
    case OPEN_GAME:
    return Object.assign({}, state, {isOpen: false});
    case STOP_GAME:
    return Object.assign({}, state, {isOpen: true});
   	default:
   	return state;
  }
}

