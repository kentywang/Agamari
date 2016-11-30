import React, { Component } from 'react';
import { connect } from 'react-redux';
import socket from '../socket';

import { openConsole,
         closeConsole } from '../reducers/controlPanel';
import {stopGame} from '../reducers/gameState';

class ControlPanel extends Component {
  render() {
    let { controlPanel,
          open,
          close,
          leave } = this.props;
    let { isOpen } = controlPanel;

    return (
      <div style={{position: 'absolute', zIndex: 1, right: '10px', top: '10px'}}>
      {isOpen ?
        <div className="card blue-grey darken-1">
          <div className="card-content white-text">
                <button className="btn"
                        style={{ float: 'left' }}
                        onClick={leave}>Leave</button>
                <button className="btn-floating"
                        style={{ float: 'right' }}
                        onClick={close}>X</button>
          </div>
        </div> :
        <div>
          <button className="btn-floating" onClick={open}><i className="material-icons">menu</i></button>
        </div>}
        </div>
      );
  }
}

const mapStateToProps = ({ players, controlPanel }) => ({ players, controlPanel });

const mapDispatchToProps = dispatch => ({
  open: () => dispatch(openConsole()),
  close: () => dispatch(closeConsole()),
  leave: () => {
    dispatch(stopGame());
    socket.emit('leave');
  }
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ControlPanel);
