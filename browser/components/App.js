import React, { Component } from 'react';
import { connect } from 'react-redux';

import Canvas from './Canvas';
import ControlPanel from './ControlPanel';
import { loadEnvironment } from '../game/game';
import { scene } from '../game/main';

class App extends Component {
  componentDidUpdate() {
    if (scene) loadEnvironment();
  }

  render() {
    return (
      <div>
          <ControlPanel />
          <Canvas />
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

