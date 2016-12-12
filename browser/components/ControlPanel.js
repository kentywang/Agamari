import React, { Component } from 'react';
import { connect } from 'react-redux';
import socket from '../socket';

import { openConsole,
         closeConsole,
         openBugReport } from '../reducers/controlPanel';
import { removeAllFood } from '../reducers/food';
import {stopGame} from '../reducers/gameState';

class ControlPanel extends Component {
  render() {
    let { controlPanel,
          open,
          close,
          openBugReportForm,
          leave } = this.props;
    let { isOpen, bugReportOpen } = controlPanel;

    return (
      <div style={{position: 'absolute', zIndex: 1, right: '10px', top: '10px'}}>
      {isOpen ?
          <div className="card-content white-text">
                { !bugReportOpen &&
                    <button className="btn-floating"
                          onClick={openBugReportForm}>
                      <i className="material-icons">bug_report</i>
                    </button>
                }
                <button className="btn-floating"
                        onClick={leave}>
                  <i className="material-icons">exit_to_app</i>
                </button>
                <button className="btn-floating"
                        style={{ float: 'right'}}
                        onClick={close}>X</button>
          </div> :
          <div>
            <button className="btn-floating" onClick={open}>
              <i className="material-icons">menu</i>
            </button>
          </div> }
        </div>
      );
  }
}

const mapStateToProps = ({ players, controlPanel }) => ({ players, controlPanel });

const mapDispatchToProps = dispatch => ({
  open: () => dispatch(openConsole()),
  close: () => dispatch(closeConsole()),
  openBugReportForm: () => dispatch(openBugReport()),
  leave: () => {
    dispatch(stopGame());
    dispatch(removeAllFood());
    socket.emit('leave');
  }
});

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  return Object.assign({}, stateProps, dispatchProps, ownProps, {
    toggle: () => {
      if (stateProps.isOpen) dispatchProps.close();
      else dispatchProps.open();
    }
  });
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(ControlPanel);
