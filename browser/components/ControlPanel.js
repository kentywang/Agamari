import React, { Component } from 'react';
import { connect } from 'react-redux';
import store from '../store';
import {updateColor} from '../reducers/gameState';
import axios from 'axios';
import {socket} from './App';

const room1 = 'room1';
const room2 = 'room2';

class ControlPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      windowIsOpen: true,
      user: {
        name: null,
        id: null
      },
      displayName: ''
    };
    this.onClick = this.onClick.bind(this);
    this.logToRoom = this.logToRoom.bind(this);
    this.changeState = this.changeState.bind(this);
    this.closeWindow = this.closeWindow.bind(this);
    this.openWindow = this.openWindow.bind(this);
    this.createAnonymousUser = this.createAnonymousUser.bind(this);
    this.updateDisplayName = this.updateDisplayName.bind(this);
  }

  onClick(room, user) {
    let data = user ? {room, user} : {room};
    console.log('onclick data', data);
    this.props.socket.emit('room', data);
    this.setState({windowIsOpen: false});
  }

  logToRoom(room) {
    this.props.socket.emit('log', room);
  }

  changeState(color){
    let action = updateColor(color);
    store.dispatch(action);
    this.props.socket.emit('state_changed', action);
  }

  closeWindow() {
    this.setState({windowIsOpen: false});
  }

  openWindow() {
    this.setState({windowIsOpen: true});
  }

  createAnonymousUser() {
    axios.post('/api/users/anonymous', {displayName: this.state.displayName})
    .then(res => {
        let user = res.data;
        console.log('response', user);
        this.setState({user});
        this.onClick(room1, user);
        this.closeWindow();
    });
  }

  updateDisplayName(event) {
    this.setState({
      displayName: event.target.value
    });
  }


  render() {
    let {gameState} = this.props;
    let player = socket && gameState.players[socket.id];
    return (
      <div style={{position: 'absolute', zIndex: 1}}>
      {this.state.windowIsOpen ?
        <div className="card blue-grey darken-1">
          <div className="card-content white-text">
            <div className="input-field">
              <input type="text" onChange={this.updateDisplayName} value={this.state.displayName} placeholder="name" />
            </div>
            <button className="btn" onClick={this.createAnonymousUser}>Start Game</button>
            <button className="btn" onClick={this.closeWindow}>Close Window</button>
          </div>
          <div className="card-action">
            <button className="btn" onClick={() => this.onClick(room1)}>Room 1</button>
            <button className="btn" onClick={() => this.onClick(room2)}>Room 2</button>
            <button className="btn" onClick={() => this.logToRoom(room1)}>Log Room 1</button>
            <button className="btn" onClick={() => this.logToRoom(room2)}>Log Room 2</button>
            <button className="btn" onClick={() => this.changeState("green")}>Green</button>
            <button className="btn" onClick={() => this.changeState("pink")}>Pink</button>
          </div>
        </div> :
        <div>
          {player && <p>{`Welcome ${player.name}`}</p>}
          <button className="btn" onClick={this.openWindow}>Open</button>
        </div>}
        </div>
      );
  }
}

const mapStateToProps = ({socket, gameState}) => ({socket, gameState});

export default connect(
  mapStateToProps
)(ControlPanel);
