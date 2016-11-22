import React, { Component } from 'react';
import { connect } from 'react-redux';
import store from '../store';
import { receiveGameState, removeFoodAndAddMass } from '../reducers/gameState';
import Canvas from './Canvas';
import ControlPanel from './ControlPanel';
import { loadEnvironment } from '../game/game';
import { init, animate } from '../game/main';
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

      socket.on('game_state', state => {
        this.props.receiveGameState(state);
      });

      socket.on('change_state', action => {
        store.dispatch(action);
      });

      socket.on('game_ready', () => {
        init();
        animate();
        this.closeControlPanel();
      });

      socket.on('add_player', id => {
        if (id !== socket.id){
          let player = new Player(id);
          player.init();
        }
      });

      socket.on('start_fail', err => {
        this.setState({ err: err.message });
      });

      socket.on('add_food', (food) => {
          let index = store.getState().gameState.food.length - 1;
          let newFood = new Food(food, index);
          newFood.init();
      });

      socket.on('ate_food_got_bigger', index => {
          // why does console not log when placed after dispatch?
          console.log("in socket listen");
          store.dispatch(removeFoodAndAddMass(null, index));
      });

    });
  }

  componentDidUpdate(prevProps) {
    if (Object.keys(prevProps.gameState).length && prevProps.gameState !== this.props.gameState) {
      loadEnvironment();
    }
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


const mapStateToProps = ({ gameState }) => ({ gameState });
const mapDispatchToProps = dispatch => ({
  receiveGameState: state => dispatch(receiveGameState(state))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);

export { socket };
