import React, { Component } from 'react';
import { connect } from 'react-redux';

import Canvas from './Canvas';
import ControlPanel from './ControlPanel';
import Splash from './Splash';


class App extends Component {
  render() {
    return (
      <div>
          <Splash />
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
