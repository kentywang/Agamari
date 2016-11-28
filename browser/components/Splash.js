import React, { Component } from 'react';
import { connect } from 'react-redux';

import { displaySplash } from '../reducers/splash.js';
class Splash extends Component {
  render () {
    <div style={{width: '100%', height: '100vh'}}>
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
          </div>
        </div> :
        <div>
          {player && <p>{`Welcome ${nickname}`}</p>}
          <button className="btn" onClick={open}>Open</button>
        </div>}
    </div>
  }
}

//const mapStateToProps = ({})

const mapDispatchToProps = dispatch => ({
  isOpen: () => dispatch(displaySplash())
})

export default connect(
  null,
  mapDispatchToProps
)(Splash);
