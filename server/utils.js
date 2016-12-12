// Modify action object for dispatching to server-side game state reducer
const addWorld = (action, world) => Object.assign(action, { world });

module.exports = {
  addWorld
};
