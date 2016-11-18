import React, { Component } from 'react';
import { connect } from 'react-redux';
import store from '../store';

import ControlPanel from './ControlPanel';
import Canvas from './Canvas';
import { receiveSocket } from '../reducers/socket';
import { receiveGameState } from '../reducers/gameState';

import {loadEnvironment} from '../game/game';

class App extends Component {
  constructor (props) {
    super(props);
  }

  componentDidMount() {
    const socket = io('/');
    socket.on('connect', () => {
      socket.on('message', console.log);
      socket.on('newGameState', state => {
        this.props.receiveGameState(state);
        loadEnvironment();
      });
      socket.on('change_state', action=> store.dispatch(action));
    });
    this.props.receiveSocket(socket);
  }

  render() {
    return (
      <div>
        <div className="nav-wrapper">
          <ControlPanel />
        </div>
        <div>
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
