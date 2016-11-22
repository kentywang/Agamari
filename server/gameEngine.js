
const store = require('./store');
const validRoomNames = ['room1', 'room2'];

const { createFood } = require('./reducers/gameState');


let elapsedTime = Date.now();
let id = 1;


function spawnFood(io){
 		
	if (Date.now()-elapsedTime>1000){
		elapsedTime = Date.now();
		let rooms = Object.keys(io.sockets.adapter.rooms);
	    for (let room of rooms) {
	      // Only enter if room name is in valid room names array
	      //console.log(Object.keys(io.sockets.adapter.rooms))
	      if (validRoomNames.indexOf(room) + 1) {
	        let { gameState } = store.getState();
	        if (gameState[room]) {
	        //	console.log(Object.keys(gameState[room]))
	          	if (Object.keys(gameState[room].food).length<40){
	          		let xPostion = (Math.random()*400)-200;
					let zPostion = (Math.random()*400)-200;

					io.sockets.in(room).emit('add_food', id, {x: xPostion, z: zPostion, type: "sphere"});
			//		console.log(id)
					store.dispatch(createFood(id++, xPostion,zPostion,"sphere", room));
				}			 
          	}
        }
      }
    }
};

module.exports = {spawnFood, validRoomNames}
