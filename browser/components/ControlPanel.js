import React, { Component } from 'react';
import { connect } from 'react-redux';
import socket from '../socket';

import { openConsole,
         closeConsole,
         setNickname,
         resetNickname,
         setError,
         resetError,
         startAsGuest } from '../reducers/controlPanel';

class ControlPanel extends Component {
  render() {
    let { players,
          controlPanel,
          open,
          close,
          updateNickname,
          signInAsGuest } = this.props;
    let { isOpen,
          nickname,
          error } = controlPanel;
    let player = socket && players[socket.id];

    return (
      <div style={{position: 'absolute', zIndex: 1, 'marginLeft': '64%'}}>
      {isOpen ?
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

             <a title="error" href="https://docs.google.com/forms/d/e/1FAIpQLSfLkwQ0mgV_25F7YGt4mF2XgKx3Ub3EWP8qG8Ro0ZgnXqE7sg/formResponse" className="error-btn circle-btn btn material-icons">
             <i className="material-icons">priority_high
             </i>
             </a>            
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

const mapStateToProps = ({ players, controlPanel }) => ({ players, controlPanel });

const mapDispatchToProps = dispatch => ({
  open: () => dispatch(openConsole()),
  close: () => dispatch(closeConsole()),
  updateNickname: e => dispatch(setNickname(e.target.value)),
  clearNickname: () => dispatch(resetNickname()),
  updateError: error => dispatch(setError(error)),
  clearError: () => dispatch(resetError()),
  signInAsGuest: (nickname, socket) => dispatch(startAsGuest(nickname, socket))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ControlPanel);
