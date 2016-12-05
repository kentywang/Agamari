import React, { Component } from 'react';
import { connect } from 'react-redux';
import socket from '../socket';

import { startGame, stopGame, setNickname, resetNickname, startAsGuest } from '../reducers/gameState.js';

class Splash extends Component {
  render () {
    let { updateNickname, gameState, play } = this.props;
    let { nickname } = gameState;

    return (
        <div id="splash">
         <div id="title">AGAMARI</div>
           <div className="input-field">
            <input value={nickname}
                   onChange={updateNickname}
                   type="text"
                   id="name-box"
                   placeholder="nickname"
                   autoFocus/>
            <button className="Buttons" type="submit" style={nickname.trim()? {color: "white"} : {color: "grey"}} onClick={()=>{
              if(nickname.trim()){
                play();
              }
            }} id="play-box">play</button>
          </div>
        <div id="github">
          <a href="https://github.com/quirkycorgi/agamari">
            <i className="fa fa-github fa-lg"></i>
          </a></div>      
        </div>

      );
  }
}

const mapStateToProps = ({players, gameState}) => ({players, gameState});

const mapDispatchToProps = dispatch => ({
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
