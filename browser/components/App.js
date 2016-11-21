import React, { Component } from 'react';
import { connect } from 'react-redux';
import store from '../store';
import { receiveSocket } from '../reducers/socket';
import { receiveGameState } from '../reducers/gameState';
import Canvas from './Canvas';
import ControlPanel from './ControlPanel';
import { loadEnvironment } from '../game/game';
import { init, animate } from '../game/main';
import { Player } from '../game/player';

let socket;

class App extends Component {
  constructor (props) {
    super(props);
    this.state = {
      hasJoinedRoom: false
    };
  }

  componentDidMount() {
    socket = io('/');

    socket.on('connect', () => {


      socket.on('message', console.log);

      socket.on('game_state', state => {
        this.props.receiveGameState(state);
      });

      socket.on('change_state', action=> {
        store.dispatch(action);
      });

      socket.on('in_room', action=> {
        console.log("has joined room, ", this.state.hasJoinedRoom);
        if(!this.state.hasJoinedRoom){
            init();
            animate();
            this.setState({hasJoinedRoom: true});
        }
      });

      socket.on('add_player', id => {
        if(id != socket.id){
          let player = new Player(id);
          player.init();
        }
      });

    });

    this.props.receiveSocket(socket);
  }

  componentDidUpdate(prevProps) {
    if(Object.keys(prevProps.gameState).length && prevProps.gameState !== this.props.gameState){
      loadEnvironment();
    }
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


const mapStateToProps = ({gameState}) => ({gameState});
const mapDispatchToProps = dispatch => ({
  receiveSocket: socket => dispatch(receiveSocket(socket)),
  receiveGameState: state => dispatch(receiveGameState(state)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);

export { socket };
