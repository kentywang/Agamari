import React, { Component } from 'react';
import { connect } from 'react-redux';
import {socket} from './App';

class ControlPanel extends Component {
  constructor(props) {
    super(props);
    this.state = { nickname: '' };
    this.startAsGuest = this.startAsGuest.bind(this);
    this.updateNickname = this.updateNickname.bind(this);
  }

  startAsGuest() {
    let { nickname } = this.state;
    let { resetError, setError } = this.props;
    if (nickname) {
      socket.emit('start_as_guest', { nickname });
      resetError();
    } else {
      setError('Please enter a nickname.');
    }
  }

  updateNickname(event) {
    this.setState({ nickname: event.target.value });
  }


  render() {
    let {gameState, isOpen, open, close, error } = this.props;
    let { nickname } = this.state;
    let { updateNickname, startAsGuest } = this;
    let player = socket && gameState.players[socket.id];
    return (
      <div style={{position: 'absolute', zIndex: 1}}>
      {isOpen ?
        <div className="card blue-grey darken-1">
          <div className="card-content white-text">
            {error && <p>{error}</p>}
            <div className="input-field">
              <input type="text" onChange={updateNickname} value={nickname} placeholder="name" />
            </div>
            <button className="btn" onClick={startAsGuest}>Start Game As Guest</button>
            <button className="btn" onClick={close}>Close Window</button>
          </div>
        </div> :
        <div>
          {player && <p>{`Welcome ${player.nickname}`}</p>}
          <button className="btn" onClick={open}>Open</button>
        </div>}
        </div>
      );
  }
}

const mapStateToProps = ({ gameState }) => ({ gameState });

export default connect(
  mapStateToProps
)(ControlPanel);
