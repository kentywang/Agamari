import React, { Component } from 'react';
import { connect } from 'react-redux';

class Canvas extends Component {
	constructor(props){
    	super(props);
  	}

	render = () => {
		createjs.Sound.registerSound("eat.ogg", "eatSound");

		return (
			<div>
				<div className="leaderboard"> [ ] leaderboard</div>
				<div className="abilities">abilities</div>
				<div className="score">score</div>
				<div>
					<canvas id="canvas"></canvas>
				</div>
			</div>
		)
	}
}

const mapStateToProps = ({ players }) => ({ players });

const mapDispatchToProps = dispatch => ({
  // open: () => dispatch(openConsole()),
  // close: () => dispatch(closeConsole()),
  // updateNickname: e => dispatch(setNickname(e.target.value)),
  // clearNickname: () => dispatch(resetNickname()),
  // updateError: error => dispatch(setError(error)),
  // clearError: () => dispatch(resetError()),
  // signInAsGuest: (nickname, socket) => dispatch(startAsGuest(nickname, socket))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Canvas);