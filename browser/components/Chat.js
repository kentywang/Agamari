import React, { Component } from 'react';
import { connect } from 'react-redux';
import socket from '../socket';
import { startChat, stopChat } from '../reducers/gameState';

class Chat extends Component {
  constructor(props){
    super(props);
    this.state = {
      isOpen: true,
      active: false,
      message: '',
      started: false
    };
    this.updateMessage = this.updateMessage.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
  }

  updateMessage(evt) {
    this.setState({ message: evt.target.value });
  }

  sendMessage() {
    let { message } = this.state;
    if (message) {
      socket.emit('new_message', message);
      this.setState({ message: '' });
    }
  }

  componentDidMount() {
    let input = this.refs.chatInput;

    window.addEventListener("keydown", evt => {
      let { isChatting } = this.props.gameState;
      if (this.state.started) {
        if (!isChatting && evt.keyCode == 13) input.focus();
        if (isChatting && evt.keyCode == 27) input.blur();
      }
    });
    this.setState({ started: true });
  }

  componentDidUpdate(prevProps, prevState) {
    console.log(this.props.gameState.isChatting);
  }

  render() {
    let { updateMessage, sendMessage, open, close } = this;
    let { isOpen, message } = this.state;
    let { messages, start, stop, gameState } = this.props;

    return (
      <div id={isOpen ? "chat-box" : "chat-button"}
           className={isOpen ? "card" : ""}>
        { isOpen ?
            <div>
              <button id="close-chat" className="btn-floating" onClick={close}>X</button>
              <ul id="message-box" className="collection">
                { messages && messages.map((message, i) => (
                    <li key={i} className="message-item">
                      {`${message.nickname}: ${message.text}`}
                    </li>
                ))}
              </ul>
              <input ref="chatInput"
                     value={message}
                     onChange={updateMessage}
                     onKeyPress={evt => { if (evt.key === 'Enter') sendMessage(); }}
                     onFocus={start}
                     onBlur={stop}
                     type="text"
                     id="new-message"
                     placeholder={gameState.isChatting ? "chat..." : "press 'Enter' to chat..."}/>
            </div> :
            <button id="chat-button" className="btn-floating" onClick={open}>
              <i className="material-icons">chat</i>
            </button> }
      </div>
      );
  }
}

const mapStateToProps = ({ messages, gameState }) => ({ messages, gameState });

const mapDispatchToProps = dispatch => ({
  start: () => dispatch(startChat()),
  stop: () => dispatch(stopChat())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Chat);
