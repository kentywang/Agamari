import React, { Component } from 'react';
import { connect } from 'react-redux';
import store from '../store';


import { receivePlayers } from '../reducers/players';
import { removeFood, receiveFood } from '../reducers/food';


import Canvas from './Canvas';
import ControlPanel from './ControlPanel';
import { loadEnvironment } from '../game/game';
import { init, animate, scene } from '../game/main';
import { Player } from '../game/player';
import {Food} from '../game/food';

let socket;

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      consoleIsOpen: true,
      error: null
    };
    this.openControlPanel = this.openControlPanel.bind(this);
    this.closeControlPanel = this.closeControlPanel.bind(this);
    this.setError = this.setError.bind(this);
    this.resetError = this.resetError.bind(this);
  }

  openControlPanel() {
    this.setState({ controlPanelIsOpen: true});
  }

  closeControlPanel() {
    this.setState({ controlPanelIsOpen: false});
  }

  setError(error) {
    this.setState({ error });
  }

  resetError() {
    this.setState({ error: null })
  }

  componentDidMount() {
    socket = io('/');

    socket.on('connect', () => {


      socket.on('player_data', state => {
        this.props.receivePlayers(state);
      });


      socket.on('start_game', () => {
        init();
        animate();
        this.closeControlPanel();
      });

      socket.on('add_player', (id, initialData) => {
        let isMainPlayer = id === socket.id;
        let player = new Player(id, initialData, isMainPlayer);
        player.init();
      });

      socket.on('remove_player', id => {
        let playerObject = scene.getObjectByName(id);
        if (playerObject) {
          scene.remove(playerObject.cannon);
          scene.remove(playerObject);
        }
      });

      socket.on('start_fail', err => {
        this.setState({ err: err.message });
      });

      socket.on('add_food', (id, data) => {
        let food = new Food(id, data);
        food.init();
        this.props.receiveFood(id, data);
      });


      socket.on('remove_food', id => {
        let foodObject = scene.getObjectByName(id);
        if (foodObject) {
          scene.remove(foodObject.cannonMesh);
          scene.remove(foodObject);
        }
        this.props.removeFood(id);
      });
    });
  }

  componentDidUpdate() {
    if (scene) loadEnvironment();
  }

  render() {
    let { openControlPanel, closeControlPanel, setError, resetError } = this;
    let { controlPanelIsOpen, error } = this.state;
    return (
      <div>
          <ControlPanel isOpen={controlPanelIsOpen}
                        open={openControlPanel}
                        close={closeControlPanel}
                        setError={setError}
                        resetError={resetError}
                        error={error}/>
          <Canvas />
      </div>
      );

  }
}


const mapStateToProps = ({ players }) => ({ players });
const mapDispatchToProps = dispatch => ({
  receivePlayers: state => dispatch(receivePlayers(state)),
  receiveFood: (id, data) => dispatch(receiveFood(id, data)),
  removeFood: id => dispatch(removeFood(id))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);

export { socket };
