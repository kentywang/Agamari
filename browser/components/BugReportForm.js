import React, { Component } from 'react';
import { connect } from 'react-redux';
import socket from '../socket';
import axios from 'axios';


class BugReportForm extends Component {
  constructor(props){
    super(props);
    this.state = {
      isOpen: false,
      email: '',
      subject: '',
      details: ''
    };
    this.open = this.open.bind(this);
    this.close = this.close.bind(this);
    this.updateEmail = this.updateEmail.bind(this);
    this.updateSubject = this.updateSubject.bind(this);
    this.updateDetails = this.updateDetails.bind(this);
    this.resetForm = this.resetForm.bind(this);
  }

  open() {
    this.setState({isOpen: true});
  }

  close() {
    this.setState({isOpen: false});
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

  resetForm() {
    this.setState({
      email: '',
      subject: '',
      details: ''
    });
  }

  submitForm() {
    let { email, subject, details } = this.state;
    axios.post('/api/bugs', { email, subject, details });
    this.resetForm();
  }

  render() {
    let { open, close, updateEmail, updateSubject, updateDetails, resetForm } = this;
    let { isOpen, email, subject, details } = this.state;
    return (
      <div style={{position: 'absolute', zIndex: 1, right: '10px', bottom: '10px'}}>
      {isOpen ?
          <div className="card-panel grey lighten-5" style={{ border: '#ccc solid 2px', borderRadius: '5px'}}>
            <div className="row" style={{color: 'black', fontWeight: 'bold'}}>
               <div>
                <h5 className="center-align"
                    style={{fontWeight: 'bold'}}>Report A Bug</h5>
              </div>
              <div className="col s12">
                <div className="row">
                  <div className="input-field col s6">
                    <input placeholder="Email"
                           value={email}
                           onChange={updateEmail}
                           id="email"
                           type="email"
                           className="validate"
                           style={{fontSize: '1em'}}/>
                  </div>
                  <div className="input-field col s6">
                    <input placeholder="Subject"
                           value={subject}
                           onChange={updateSubject}
                           id="subject"
                           type="text"
                           className="validate"
                           style={{fontSize: '1em'}}/>
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
              </div>
              <div className="row">
                <div className="col s2 push-s3">
                  <button className="btn" onClick={close}>Close</button>
                </div>
                <div className="col s4 push-s5">
                  <button className="btn" onClick={close}>Submit</button>
                </div>
              </div>
            </div>
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
