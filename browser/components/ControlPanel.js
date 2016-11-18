import { init } from '../game/main';

const room1 = 'room1';
const room2 = 'room2';


import React, { Component } from 'react';
import { connect } from 'react-redux';

class ControlPanel extends Component {
  constructor(props) {
    super(props);
    this.onClick = this.onClick.bind(this);
    this.logToRoom = this.logToRoom.bind(this);
  }

  onClick(room) {
    this.props.socket.emit('room', room);
  }

  logToRoom(room) {
    this.props.socket.emit('log', room);
  }

  render() {
    return (
      <div>
        <button className="btn" onClick={() => init()}>Start</button>
        <button className="btn" onClick={() => this.onClick(room1)}>Room 1</button>
        <button className="btn" onClick={() => this.onClick(room2)}>Room 2</button>
        <button className="btn" onClick={() => this.logToRoom(room1)}>Log Room 1</button>
        <button className="btn" onClick={() => this.logToRoom(room2)}>Log Room 2</button>
      </div>
      );

  }
}

const mapStateToProps = ({socket, gameState}) => ({socket, gameState});

export default connect(
  mapStateToProps
)(ControlPanel);


