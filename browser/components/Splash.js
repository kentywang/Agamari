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
         <div id="title" style={{color:"white"}}>AGAMARI</div>
           <div className="input-field">
            <input value={nickname}
                   onChange={updateNickname}
                   type="text"
                   id="name-box"
                   placeholder="nickname" 
                   className="validate"
                   autoFocus
                   required/>
                   {/* <label htmlFor="name-box" data-error="Please enter nickname" data-success="right">Please enter nickname</label>*/}
            <button className="Buttons" type="submit" style={nickname? {color: "white"} : {color: "grey"}} onClick={()=>{
              if(nickname)
                play();
            }} id="play-box">play</button>
          </div>
         {/* <div>
            <button className="buttons" onClick={play} id="rules-box">Rules</button>
          </div>*/}
         
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
