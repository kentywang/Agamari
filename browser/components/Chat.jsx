import React, { Component } from 'react';
import { connect } from 'react-redux';
import socket from '../socket';
import { startChat, stopChat } from '../reducers/gameState';

class Chat extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: true,
      active: false,
      message: '',
    };
    this.updateMessage = this.updateMessage.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
  }

  updateMessage(evt) {
    this.setState({ message: evt.target.value });
  }

  sendMessage() {
    const { message } = this.state;
    if (message) {
      socket.emit('new_message', message);
      this.setState({ message: '' });
    }
  }

  componentDidUpdate(prevProps) {
    const { messages, gameState } = this.props;

    if (prevProps.gameState.isChatting && !gameState.isChatting) this.setState({ message: '' });

    if (gameState.isChatting && prevProps.messages !== messages) {
      const { messageBox } = this.refs;
      messageBox.scrollTop = messageBox.scrollHeight;
    }

    if (!prevProps.gameState.isChatting && gameState.isChatting) {
      const { messageBox, chatInput } = this.refs;
      messageBox.scrollTop = messageBox.scrollHeight;
      chatInput.focus();
    }
  }

  componentDidMount() {
    const { start, stop } = this.props;

    window.addEventListener('keydown', (evt) => {
      const { isChatting } = this.props.gameState;
      if (!isChatting && evt.keyCode == 13) start();
      if (isChatting && evt.keyCode == 27) stop();
    });
  }

  render() {
    const { updateMessage, sendMessage } = this;
    const { message } = this.state;
    const {
      messages, start, stop, gameState,
    } = this.props;
    const lastMessage = messages[messages.length - 1];
    return (
      <div id="chat-box">
        { gameState.isChatting
          ? (
            <div id="message-box">
              <ul
                ref="messageBox"
                id="message-list"
                className="collection"
              >
                { messages && messages.map((message, i) => {
                  const nickname = message.nickname.length > 15
                    ? `${message.nickname.slice(0, 14)}...`
                    : message.nickname;
                  return (
                    <li key={i} className="message-item">
                      {`${nickname}: ${message.text}`}
                    </li>
                  );
                })}
              </ul>
              <input
                ref="chatInput"
                value={message}
                onChange={updateMessage}
                onBlur={stop}
                onKeyPress={(evt) => { if (evt.key === 'Enter') sendMessage(); }}
                maxLength={70}
                type="text"
                id="new-message"
                placeholder="press 'esc' to close"
              />
            </div>
          )
          : (
            <div>
              <div
                id="last-message"
                onClick={start}
              >
                { lastMessage
                    && `${lastMessage.nickname}: ${lastMessage.text}`}
              </div>
              <div id="open-message">
                press 'enter' to chat
              </div>
            </div>
          )}
      </div>
    );
  }
}

const mapStateToProps = ({ messages, gameState }) => ({ messages, gameState });

const mapDispatchToProps = (dispatch) => ({
  start: () => dispatch(startChat()),
  stop: () => dispatch(stopChat()),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Chat);
