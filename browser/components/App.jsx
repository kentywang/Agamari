import React from 'react';
import { connect } from 'react-redux';

import Splash from './Splash';
import Game from './Game';
import ControlPanel from './ControlPanel';
import BugReportForm from './BugReportForm';

function App(props) {
  const { isPlaying } = props.gameState;
  const { bugReportOpen } = props.controlPanel;
  return (
    <div>
      {!isPlaying && <Splash />}
      {isPlaying && <Game />}
      {isPlaying && <ControlPanel />}
      {bugReportOpen && <BugReportForm />}
      <div style={{
        fontFamily: 'Quicksand', fontWeight: 'bold', position: 'absolute', opacity: 0,
      }}
      />
    </div>
  );
}

const mapStateToProps = ({ gameState, controlPanel }) => ({ gameState, controlPanel });
const mapDispatchToProps = () => ({});
export default connect(mapStateToProps, mapDispatchToProps)(App);
