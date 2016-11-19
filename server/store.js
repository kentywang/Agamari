const { createStore } =  require('redux');

const reducer =  require('./reducers');

module.exports = createStore(reducer);
