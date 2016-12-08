import React, { Component } from 'react';
import { connect } from 'react-redux';
import socket from '../socket';

class Chat extends Component {
  constructor(props){
    super(props);
    this.state = {
      isOpen: false,
      message: '',
    };
    this.open = this.open.bind(this);
    this.close = this.close.bind(this);
    this.updateMessage = this.updateMessage.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
  }

  open() {
    this.setState({isOpen: true});
  }

  close() {
    this.setState({isOpen: false});
    if (this.state.message) this.setState({message: ''});
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

  render() {
    let { updateMessage, sendMessage, open, close } = this;
    let { isOpen, message } = this.state;
    let { messages } = this.props;

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
              <input value={message}
                     onChange={updateMessage}
                     onKeyPress={evt => { if (evt.key === 'Enter') sendMessage(); }}
                     type="text"
                     id="new-message"
                     placeholder="chat..."
                     autoFocus/>
            </div> :
            <button id="chat-button" className="btn-floating" onClick={open}>
              <i className="material-icons">chat</i>
            </button> }
      </div>
      );
  }
}

const mapStateToProps = ({messages}) => ({messages});

const mapDispatchToProps = dispatch => ({
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Chat);
