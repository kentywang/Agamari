// Modify action object for dispatching to server-side game state reducer
const addRoom = (action, room) => Object.assign(action, { room });

module.exports = {
  addRoom
};
