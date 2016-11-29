import React, { Component } from 'react';
import { connect } from 'react-redux';
import socket from '../socket';
import axios from 'axios';


class BugReportForm extends Component {
  constructor(props){
    super(props);
    this.state = {
      isOpen: false,
      message: '',
      name: '',
      email: '',
      subject: '',
      details: ''
    };
    this.open = this.open.bind(this);
    this.close = this.close.bind(this);
    this.updateName = this.updateName.bind(this);
    this.updateEmail = this.updateEmail.bind(this);
    this.updateSubject = this.updateSubject.bind(this);
    this.updateDetails = this.updateDetails.bind(this);
    this.resetForm = this.resetForm.bind(this);
    this.submitForm = this.submitForm.bind(this);
  }

  open() {
    this.setState({isOpen: true});
  }

  close() {
    this.setState({isOpen: false});
    if (this.state.message) this.setState({message: ''});
  }

  updateEmail(evt) {
    this.setState({ email: evt.target.value });
  }

  updateSubject(evt) {
    this.setState({ subject: evt.target.value });
  }

  updateDetails(evt) {
    this.setState({ details: evt.target.value });
  }

  updateName(evt) {
    this.setState({ name: evt.target.value });
  }

  resetForm() {
    this.setState({
      name: '',
      email: '',
      subject: '',
      details: ''
    });
  }

  submitForm() {
    let { name, email, subject, details } = this.state;
    axios.post('/api/bugs', { name, email, subject, details }).then(res => this.setState({message: res.data.message}));
    this.resetForm();
  }

  render() {
    let { open, close, updateName, updateEmail, updateSubject, updateDetails, submitForm} = this;
    let { name, isOpen, email, subject, details, message } = this.state;
    return (
      <div style={{position: 'absolute', zIndex: 1, right: '10px', bottom: '10px'}}>
      {isOpen ?
          <div className="card-panel grey lighten-5" style={{ border: '#ccc solid 2px', borderRadius: '5px'}}>
                  <div className="" style={{float: 'right'}}>
                    <button className="btn" onClick={close}>X</button>
                  </div>
            { message ?
              <div style={{color: 'black'}}>
                <p className="flow-text">{ message }</p>
              </div> :
              <div className="row" style={{color: 'black', fontWeight: 'bold', marginBottom: 0}}>
                <div>
                  <h5 className="center-align"
                      style={{fontWeight: 'bold'}}>&nbsp;&nbsp;Report A Bug</h5>
                </div>
                <div className="row" style={{margin: '0'}}>
                    <div className="input-field col s6">
                      <input placeholder="Name"
                             value={name}
                             onChange={updateName}
                             id="name"
                             type="text"
                             className="validate"
                             style={{padding: '0', fontSize: '1em'}}/>
                    </div>
                    <div className="input-field col s6">
                      <input placeholder="Email"
                             value={email}
                             onChange={updateEmail}
                             id="email"
                             type="email"
                             className="validate"
                             style={{padding: '0', fontSize: '1em'}}/>
                    </div>
                  </div>
                <div className="row" style={{margin: '0'}}>
                  <div className="col s12" style={{margin: '0'}}>
                    <input placeholder="Subject"
                           value={subject}
                           onChange={updateSubject}
                           id="subject"
                           type="text"
                           className="validate"
                           style={{fontSize: '1em', margin: '0', maxWidth: '100%'}}/>
                  </div>
                </div>
                  <div className="row">
                    <div className="input-field col s12"
                         style={{border: '#aaa solid 1px', borderRadius: '5px', padding: '0 5% 0'}}>
                      <textarea placeholder="Details"
                                value={details}
                                onChange={updateDetails}
                                id="details"
                                type="text"
                                className="materialize-textarea"
                                style={{height: '4em', fontSize: '1.25em'}}>
                      </textarea>
                    </div>
                  </div>
                <div>
                  <button className="btn" style={{float: 'right'}}onClick={submitForm}>Submit</button>
                </div>
              </div> }
          </div> :
        <div>
          <button className="btn-floating" onClick={open}><i className="material-icons">bug_report</i></button>
        </div>}
        </div>
      );
  }
}

const mapStateToProps = ({}) => ({});

const mapDispatchToProps = dispatch => ({
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(BugReportForm);
