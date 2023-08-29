import React, { Component } from 'react';
import { connect } from 'react-redux';
import socket from '../socket';
import { removeAllFood } from '../reducers/food';
import { stopGame } from '../reducers/gameState';

class ControlPanel extends Component {
  render() {
    const {
      leave,
    } = this.props;

    return (
      <div style={{
        position: 'absolute',
        zIndex: 1,
        right: '10px',
        top: '10px',
      }}
      >
        <div className="card-content white-text">
          <button
            className="btn-floating"
            onClick={leave}
          >
            <i className="material-icons">exit_to_app</i>
          </button>
        </div>
      </div>
    );
  }
}

const mapStateToProps = ({
  players,
}) => ({
  players,
});

const mapDispatchToProps = (dispatch) => ({
  leave: () => {
    console.log('exit app');
    dispatch(stopGame());
    dispatch(removeAllFood());
    socket.emit('leave');
  },
});

const mergeProps = (stateProps, dispatchProps, ownProps) => ({
  ...stateProps,
  ...dispatchProps,
  ...ownProps,
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps,
)(ControlPanel);
