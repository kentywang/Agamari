import React, { Component } from 'react';
import { connect } from 'react-redux';

import ControlPanel from './ControlPanel';
import Canvas from './Canvas';
import { receiveSocket } from '../reducers/socket';
import { receiveGameState } from '../reducers/gameState';

class App extends Component {
  constructor (props) {
    super(props);
  }

  componentDidMount = () => {
    const socket = io('/');
    socket.on('connect', () => {
      socket.on('message', console.log);
      socket.on('newGameState', state => this.props.receiveGameState(state));
    });
    this.props.receiveSocket(socket);
  }

  render = () => {
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
  receiveSocket: socket => dispatch(receiveSocket(socket)),
  receiveGameState: state => dispatch(receiveGameState(state)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
