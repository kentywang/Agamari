
const store = require('./store');
const validRoomNames = ['room1', 'room2'];

const { createFood } = require('./reducers/gameState');


let elapsedTime = Date.now();


function spawnFood(io){
 		
	
	if (Date.now()-elapsedTime>5000){
		elapsedTime = Date.now();
		let rooms = Object.keys(io.sockets.adapter.rooms);
	    for (let room of rooms) {
	      // Only enter if room name is in valid room names array
	      if (validRoomNames.indexOf(room) + 1) {
	        let { gameState } = store.getState();
	        if (gameState[room]) {
	          	if (gameState[room].food.length<15){
	          		let xPostion = (Math.random()*400)-200;
					let zPostion = (Math.random()*400)-200;

					store.dispatch(createFood(xPostion,zPostion,"sphere", room));
					io.sockets.in(room).emit('add_food', {x: xPostion, z: zPostion, type: "sphere"});
				}			 
          	}
        }
      }
    }
};

module.exports = {spawnFood, validRoomNames}
