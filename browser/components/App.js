import React, { Component } from 'react';
import { connect } from 'react-redux';

import Game from './Game';
import ControlPanel from './ControlPanel';
import Splash from './Splash';


class App extends Component {

  render() {
    let { isPlaying, error, nickname } = this.props.gameState;
    return (
      <div>
          {!isPlaying && <Splash />}
          {isPlaying && <ControlPanel />}
          {isPlaying && <Game />}
        <div style={{fontFamily: "Quicksand", fontWeight: "bold", position: "absolute", opacity: 0}}>.</div>
      </div>
      );

  }
}

const mapStateToProps = ({gameState}) => ({gameState});
const mapDispatchToProps = dispatch => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
