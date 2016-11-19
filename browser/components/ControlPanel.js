const room1 = 'room1';
const room2 = 'room2';


import React, { Component } from 'react';
import { connect } from 'react-redux';
import store from '../store';
import {updateColor} from '../reducers/gameState';

class ControlPanel extends Component {
  constructor(props) {
    super(props);
    this.onClick = this.onClick.bind(this);
    this.logToRoom = this.logToRoom.bind(this);
    this.changeState = this.changeState.bind(this);
  }

  onClick(room) {
    this.props.socket.emit('room', room);
  }

  logToRoom(room) {
    this.props.socket.emit('log', room);
  }

  changeState(color){
    let action = updateColor(color);
    store.dispatch(action);
    this.props.socket.emit('state_changed', action);
  }

  render() {
    return (
      <div>
        <button className="btn" onClick={() => this.onClick(room1)}>Room 1</button>
        <button className="btn" onClick={() => this.onClick(room2)}>Room 2</button>
        <button className="btn" onClick={() => this.logToRoom(room1)}>Log Room 1</button>
        <button className="btn" onClick={() => this.logToRoom(room2)}>Log Room 2</button>
        <button className="btn" onClick={() => this.changeState("yellow")}>Yellow</button>
        <button className="btn" onClick={() => this.changeState("purple")}>Purple</button>
      </div>
      );

  }
}

const mapStateToProps = ({socket, gameState}) => ({socket, gameState});

export default connect(
  mapStateToProps
)(ControlPanel);


