import React, { Component } from 'react';
import { connect } from 'react-redux';
import gameState from '../reducers/gamestate.js';
import { start, stop, setNickname, resetNickname, startAsGuest } from '../reducers/gamestate.js';

class Splash extends Component {
  render () {
    let { updateNickname } = this.props;
    let { isOpen, error, nickname } = gameState;

    return (
    <div style={{width: '100%', height: '100vh'}}>
      {!isOpen ?
        <div className="card blue-grey darken-1">
          <div className="card-content white-text">
            {error && <p>{error}</p>}
            <div className="input-field">
              <input type="text"
                     placeholder="Nickname"
                     value={nickname}
                     onChange={updateNickname}/>
            </div>
            <button className="btn"onClick={() => signInAsGuest(nickname, socket)}>
              Start Game As Guest</button>
            <button className="btn" onClick={close}>Close Window</button>
          </div>
        </div> :
        <div>

          <button className="btn" onClick={open}>Start Game</button>
        </div>}
    </div>
  );
  }
}

const mapStateToProps = () => ({});

const mapDispatchToProps = dispatch => ({
  open: () => dispatch(start()),
  close: () => dispatch(stop()),
  updateNickname: e => dispatch(setNickname(e.target.value)),
  signInAsGuest: (nickname, socket) => dispatch(startAsGuest(nickname, socket))
})

export default connect(
  null,
  mapDispatchToProps
)(Splash);
