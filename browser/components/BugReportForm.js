import React, { Component } from 'react';
import { connect } from 'react-redux';
import { closeBugReport } from '../reducers/controlPanel';
import socket from '../socket';
import axios from 'axios';

class BugReportForm extends Component {
  constructor(props){
    super(props);
    this.state = {
      message: '',
      name: '',
      email: '',
      subject: '',
      details: ''
    };
    this.updateName = this.updateName.bind(this);
    this.updateEmail = this.updateEmail.bind(this);
    this.updateSubject = this.updateSubject.bind(this);
    this.updateDetails = this.updateDetails.bind(this);
    this.resetForm = this.resetForm.bind(this);
    this.submitForm = this.submitForm.bind(this);
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
    let { updateName,
          updateEmail,
          updateSubject,
          updateDetails,
          submitForm } = this;
    let { name,
          email,
          subject,
          details,
          message } = this.state;
    let { close } = this.props;

    return (
      <div style={{position: 'fixed', zIndex: 1, right: '10px', bottom: '10px'}}>
          <div className="card-panel grey lighten-5" style={{ border: '#ccc solid 2px', borderRadius: '5px'}}>
                  <div className="" style={{float: 'right'}}>
                    <button className="btn-floating" onClick={close}>X</button>
                  </div>
            { message ?
              <div style={{color: 'black'}}>
                <p className="flow-text">{ message }</p>
              </div> :
              <div className="row" style={{color: 'black', fontWeight: 'bold', marginBottom: 0}}>
                <div>
                  <h5 className="center-align"
                      style={{fontWeight: 'bold'}}>&nbsp;&nbsp;report a bug</h5>
                </div>
                <div className="row" style={{margin: '0'}}>
                    <div className="input-field col s6">
                      <input placeholder="name"
                             value={name}
                             onChange={updateName}
                             id="name"
                             type="text"
                             className="validate"
                             style={{padding: '0', fontSize: '1em'}}/>
                    </div>
                    <div className="input-field col s6">
                      <input placeholder="email"
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
                    <input placeholder="subject"
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
                      <textarea placeholder="details"
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
                  <button className="btn" style={{ float: 'right' }}onClick={submitForm}>submit</button>
                </div>
              </div> }
          </div>
        </div>
      );
  }
}

const mapStateToProps = ({ controlPanel }) => ({ controlPanel });

const mapDispatchToProps = dispatch => ({
  close: () => dispatch(closeBugReport())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(BugReportForm);
