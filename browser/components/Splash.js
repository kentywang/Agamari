import React, { Component } from 'react';
import { connect } from 'react-redux';
import socket from '../socket';

import { openBugReport } from '../reducers/controlPanel';
import { startGame,
         stopGame,
         setNickname,
         startAsGuest } from '../reducers/gameState.js';

class Splash extends Component {
  render () {
    let { updateNickname,
          gameState, play,
          playEnter,
          controlPanel,
          openBugReport } = this.props;
    let { nickname } = gameState;
    let { bugReportOpen } = controlPanel;

    return (
      <div id="splash">
       { !bugReportOpen &&
              <div style={{position: 'absolute', zIndex: 1, right: '10px', bottom: '10px'}}>
                <div className="card-content white-text">
                    <button className="btn-floating"
                          onClick={openBugReport}>
                      <i className="material-icons">bug_report</i>
                    </button>
                </div>
              </div>}
       <div id="title">AGAMARI</div>
        <div className="input-field">
          <input value={nickname}
                 onChange={updateNickname}
                 onKeyPress={playEnter}
                 maxLength={15}
                 type="text"
                 id="name-box"
                 placeholder="nickname"
                 autoFocus/>
          <button className="Buttons"
                  type="submit"
                  style={nickname.trim() ? { color: 'white' } : { color: 'grey' }}
                  onClick={play}
                  id="play-box">play</button>
        </div>
        <div id="github">
          <a href="https://github.com/quirkycorgi/agamari">
            <i className="fa fa-github fa-lg"></i>
          </a>
        </div>
      </div>

      );
  }
}

const mapStateToProps = ({players, gameState, controlPanel }) => ({players, gameState, controlPanel });

const mapDispatchToProps = dispatch => ({
  leave: () => dispatch(stopGame()),
  updateNickname: e => dispatch(setNickname(e.target.value)),
  signInAsGuest: (nickname, socket) => {
    dispatch(startGame());
    dispatch(startAsGuest(nickname, socket));
  },
  openBugReport: () => dispatch(openBugReport())
});

const mergeProps = (stateProps, dispatchProps, ownProps) => (
  Object.assign({}, stateProps, dispatchProps, ownProps, {
    play: () => {
      let { nickname } = stateProps.gameState;
      if (nickname.trim()) dispatchProps.signInAsGuest(nickname, socket);
    },
    playEnter: evt => {
      let { nickname } = stateProps.gameState;
      if (evt.key === 'Enter' && nickname.trim()) {
        dispatchProps.signInAsGuest(nickname, socket);
      }
    }
  }));

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(Splash);
