import React, { Component } from 'react';
import { connect } from 'react-redux';

import ControlPanel from './ControlPanel';
import Canvas from './Canvas';
import { receiveSocket } from '../reducers/socket';

class App extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    const socket = io('/');
    socket.on('connect', function(){

      socket.on('message', console.log);
    });
    this.props.setSocket(socket);
  }

  render() {
    return (
      <div className="row">
        <div className="col s3">
          <ControlPanel />
        </div>
        <div className="col s9">
          <Canvas />
        </div>
      </div>
      );

  }
}


const mapStateToProps = ({}) => ({});
const mapDispatchToProps = dispatch => ({
  setSocket: socket => dispatch(receiveSocket(socket))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
