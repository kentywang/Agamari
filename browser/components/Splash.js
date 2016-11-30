import React, { Component } from 'react';
import { connect } from 'react-redux';
import socket from '../socket';

import { startGame, stopGame, setNickname, resetNickname, startAsGuest } from '../reducers/gameState.js';

class Splash extends Component {
  render () {
    let { updateNickname, gameState, play } = this.props;
    let { nickname } = gameState;


    return (
        <div>
          <div>
            <input value={nickname}
                   onChange={updateNickname}
                   type="text"
                   id="name-box"
                   className="validate"
                   style={{color: "white",
                    position: "fixed", 
                    top: "55%",
                    left: "50%",
                    transform: "translate(-50%, -50%)"}}/>
            <button className="btn" onClick={play} id="play-box">play</button>
          </div>
          <div id="title">AGAMARI</div>
        </div>

      );
  }
}

const mapStateToProps = ({players, gameState}) => ({players, gameState});

const mapDispatchToProps = dispatch => ({
  // play: () => dispatch(startGame()),
  leave: () => dispatch(stopGame()),
  updateNickname: e => dispatch(setNickname(e.target.value)),
  signInAsGuest: (nickname, socket) => {
    dispatch(startGame());
    dispatch(startAsGuest(nickname, socket));
  }
});

const mergeProps = (stateProps, dispatchProps, ownProps) => (
  Object.assign({}, stateProps, dispatchProps, ownProps, {
    play: () => dispatchProps.signInAsGuest(stateProps.gameState.nickname, socket)
  }));

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(Splash);
