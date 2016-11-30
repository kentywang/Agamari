import React, { Component } from 'react';
import { connect } from 'react-redux';

import Canvas from './Canvas';
import ControlPanel from './ControlPanel';
import Splash from './Splash';
import Instructions from './Instructions';


class App extends Component {
  render() {
    let { isPlaying, error, nickname, instructionsOpen } = this.props.gameState;
    return (
      <div>
        <div style={{fontFamily: "Quicksand", fontWeight: "bold", position: "absolute"}}>.</div>
        {instructionsOpen && <Instructions />}
          {!isPlaying && !instructionsOpen && <Splash />}
          {isPlaying && !instructionsOpen && <ControlPanel />}
          {isPlaying && !instructionsOpen && <Canvas />}
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
