/*-------- ACTION TYPES  ---------*/

const IS_DISPLAYED = 'IS_DISPLAYED';


/*=------ACTION CREATORS-------*/

const initialState = {
  isDisplayed: true
};

export const displaySplash = (isOpen) => ({
  type: IS_DISPLAYED,
  isDisplayed: !isDisplayed
});

/*-------REDUCER------------*/

export default (state = initialState, action) => {
  switch (action.type) {
    case IS_DISPLAYED:
    return Object.assign({}, state, {isOpen: true});
  }
}
