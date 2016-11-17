import { init } from './engine';

const room1 = 'room1';
const room2 = 'room2';

var socket = io('/');
socket.on('connect', function(){
	console.log("connected")

	socket.on('start', function(){
		init();
	})

	socket.on('message', console.log);
})

window.onClick1 = function(){
	socket.emit('room', room1);
};
window.onClick2 = function(){
	socket.emit('room', room2);
};

window.logToRoom1 = function() {
	socket.emit('log', room1)
}

window.logToRoom2 = function() {
	socket.emit('log', room2)
}
