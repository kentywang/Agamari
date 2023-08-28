import React from 'react';
import { connect } from 'react-redux';

import Splash from './Splash';
import Game from './Game';
import ControlPanel from './ControlPanel';

function App(props) {
  const { isPlaying } = props.gameState;
  return (
    <div>
      {!isPlaying && <Splash />}
      {isPlaying && <Game />}
      {isPlaying && <ControlPanel />}
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
