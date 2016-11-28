import React, { Component } from 'react';
import { connect } from 'react-redux';

import Canvas from './Canvas';
import ControlPanel from './ControlPanel';
import Splash from './Splash';
import gameState from '../reducers/gamestate';
let { isOpen, error, nickname } = gameState;


class App extends Component {
  render() {
    return (
      <div>
          {!isOpen && <Splash />}
          {isOpen && <ControlPanel />}
          {isOpen && <Canvas />}
      </div>
      );

  }
}

const mapStateToProps = state => ({});
const mapDispatchToProps = dispatch => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
