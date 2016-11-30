import React, { Component } from 'react';
import { connect } from 'react-redux';


class Instructions extends Component {
  render() {

    return(
      <div style={{postion: "absolute", width: "90vw", height: "90vh", top: 0, right: 0, bottom: 0, left: 0, margin: "auto", background: "white"}}>

      </div>
    )
  }
}

export default connect(
  null,
  null
)(Instructions)
