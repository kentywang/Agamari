import React, { Component } from 'react';
import { connect } from 'react-redux';


class Instructions extends Component {
  render() {

    return(
      <div style={{postion: "fixed",
                   width: "90vw",
                   height: "90vh",
                   top: 0,
                   right: 0,
                   bottom: 0,
                   left: 0,
                   zIndex: 1,
                   margin: "5vh auto",
                   background: "grey"
           }}>
           <div className="row">
            <div className="col s12 m6"><img src="/media/arrows.png" className="responsive-img"/></div>
            <div className="col s12 m6"><img src="/media/spacebar.png" className="responsive-img"/></div>
           </div>

           <div className="row">
            <div className="col s12 m6"></div>
           </div>

      </div>
    )
  }
}

export default connect(
  null,
  null
)(Instructions)
