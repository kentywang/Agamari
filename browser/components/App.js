import React, { Component } from 'react';
import { connect } from 'react-redux';

import Canvas from './Canvas';
import ControlPanel from './ControlPanel';
import BugReportForm from './BugReportForm';

class App extends Component {
  render() {
    return (
      <div>
          <ControlPanel />
          <Canvas />
          <BugReportForm/>
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

