import React, { Component } from 'react';
import { connect } from 'react-redux';
import socket from '../socket';

import {
  setNickname, startAsGuest, startGame, stopGame,
} from '../reducers/gameState.js';

class Splash extends Component {
  render() {
    const {
      updateNickname,
      gameState, play,
      playEnter,
      controlPanel,
    } = this.props;
    const { nickname } = gameState;

    return (
      <div id="splash">
        <div id="title">AGAMARI</div>
        <div className="input-field">
          <input
            value={nickname}
            onChange={updateNickname}
            onKeyPress={playEnter}
            maxLength={15}
            type="text"
            id="name-box"
            placeholder="nickname"
            autoFocus
          />
          <button
            className="Buttons"
            type="submit"
            style={nickname.trim() ? { color: 'white' } : { display: 'none' }}
            onClick={play}
            id="play-box"
          >
            play
          </button>
        </div>
        <div id="github">
          <a href="https://github.com/quirkycorgi/agamari">
            <i className="fa fa-github fa-lg" />
          </a>
        </div>
      </div>

    );
  }
}

const mapStateToProps = ({ players, gameState, controlPanel }) => ({ players, gameState, controlPanel });

const mapDispatchToProps = (dispatch) => ({
  leave: () => dispatch(stopGame()),
  updateNickname: (e) => dispatch(setNickname(e.target.value)),
  signInAsGuest: (nickname, socket) => {
    dispatch(startGame());
    dispatch(startAsGuest(nickname, socket));
  },
});

const mergeProps = (stateProps, dispatchProps, ownProps) => (
  {
    ...stateProps,
    ...dispatchProps,
    ...ownProps,
    play: () => {
      const { nickname } = stateProps.gameState;
      if (nickname.trim()) dispatchProps.signInAsGuest(nickname, socket);
    },
    playEnter: (evt) => {
      const { nickname } = stateProps.gameState;
      if (evt.key === 'Enter' && nickname.trim()) {
        dispatchProps.signInAsGuest(nickname, socket);
      }
    },
  });

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps,
)(Splash);
