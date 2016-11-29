import React, { Component } from 'react';
import { connect } from 'react-redux';
import socket from '../socket';

import gameState from '../reducers/gameState.js';
import { startGame, stopGame, setNickname, resetNickname, startAsGuest } from '../reducers/gameState.js';

class Splash extends Component {
  render () {
    let { updateNickname, players, open, gameState, play} = this.props;
    let { isPlaying, error, nickname } = gameState;
    let player = socket && players[socket.id];


    return (
        <div>
         <button className="btn" onClick={play}>Open</button>
        </div>

      );
  }
}

const mapStateToProps = ({players, gameState}) => ({players, gameState});

const mapDispatchToProps = dispatch => ({
  play: () => dispatch(startGame()),
  leave: () => dispatch(stopGame()),
  updateNickname: e => dispatch(setNickname(e.target.value)),
  signInAsGuest: (nickname, socket) => dispatch(startAsGuest(nickname, socket))
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Splash);
