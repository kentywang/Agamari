import React, { Component } from 'react';
import { connect } from 'react-redux';

import Canvas from './Canvas';
import ControlPanel from './ControlPanel';
import Splash from './Splash';


import BugReportForm from './BugReportForm';


class App extends Component {
  render() {
    let { isPlaying, error, nickname } = this.props.gameState;
    return (
      <div>
        <div style={{fontFamily: "Quicksand", fontWeight: "bold", position: "absolute"}}>.</div>
          {!isPlaying && <Splash />}
          {isPlaying && <ControlPanel />}
          {isPlaying && <Canvas />}
          <BugReportForm/>
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
