import React, { Component } from 'react';
import { connect } from 'react-redux';

import Canvas from './Canvas';
import ControlPanel from './ControlPanel';

class App extends Component {
  render() {
    return (
      <div>
          <div style={{fontFamily: "Quicksand", fontWeight: "bold", position: "absolute"}}>.</div>
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

