import { init } from './engine';

const room1 = 'room1';
const room2 = 'room2';


import React, { Component } from 'react';
import ReactDOM from 'react-dom';

class App extends Component {
	constructor(props) {
		super(props)
		this.state = { room: null, socket: null };
		this.onClick = this.onClick.bind(this);
		this.logToRoom = this.logToRoom.bind(this);
		this.start = this.start.bind(this);
	}

	onClick(room) {
		this.state.socket.emit('room', room);
	}

	logToRoom(room) {
		this.state.socket.emit('log', room)
	}

	start() {
			init();
	}

	componentDidMount() {
		const socket = io('/');
		socket.on('connect', function(){

			socket.on('message', console.log);
		});
		this.setState({socket});
	}

	render() {
		return (
			<div>
				<button className="btn" onClick={this.start}>Start</button>
				<button className="btn" onClick={() => this.onClick(room1)}>Room 1</button>
				<button className="btn" onClick={() => this.onClick(room2)}>Room 2</button>
				<button className="btn" onClick={() => this.logToRoom(room1)}>Room 1</button>
				<button className="btn" onClick={() => this.logToRoom(room2)}>Room 2</button>
			</div>
			);

	}
}

ReactDOM.render(<App />, document.getElementById('app'));
