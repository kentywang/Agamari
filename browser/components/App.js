import React, { Component } from 'react';
import { connect } from 'react-redux';

import Splash from './Splash';
import Game from './Game';
import ControlPanel from './ControlPanel';
import BugReportForm from './BugReportForm';


class App extends Component {
  render() {
    let { isPlaying } = this.props.gameState;
    let { bugReportOpen } = this.props.controlPanel;
    return (
      <div>
          { !isPlaying && <Splash /> }
          { isPlaying && <Game /> }
          { isPlaying && <ControlPanel /> }
          { bugReportOpen && <BugReportForm />}
        <div style={{fontFamily: "Quicksand", fontWeight: "bold", position: "absolute", opacity: 0}}>.</div>
      </div>
      );

  }
}

const mapStateToProps = ({ gameState, controlPanel }) => ({ gameState, controlPanel });
const mapDispatchToProps = dispatch => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
