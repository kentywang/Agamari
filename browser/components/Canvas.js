import React, { Component } from 'react';
import { connect } from 'react-redux';
import socket from '../socket';
import { scene } from '../game/main';

import { keepPlaying } from '../reducers/gameStatus';
import { hideInstructions } from '../reducers/gameState';

import BugReportForm from './BugReportForm';

import ReactDOM from 'react-dom';
import { TimelineMax } from '../../public/TweenMax.min'

class Canvas extends Component {
	constructor(props){
    	super(props);
    	this.state = {
    		leaderboard: [],
    		displayVol : 4000,
    		instructions: [
    		"use arrow keys to move",
    		"roll over smaller objects to get bigger",
    		"avoid larger players",
    		"hold & release spacebar for speed boost"]
    	}
  	}

  	componentDidMount(){
		createjs.Sound.registerSound("eat.ogg", "eatSound");

		const leaderboard = ReactDOM.findDOMNode(this.refs.leaderboard);
		const status = ReactDOM.findDOMNode(this.refs.status);
		const instructions = ReactDOM.findDOMNode(this.refs.instructions);
		const abilities = ReactDOM.findDOMNode(this.refs.abilities);
		const score = ReactDOM.findDOMNode(this.refs.score);
  		TweenMax.from(leaderboard, 1, {x: "-=400", y: "-=400", scale: 3, opacity: 0, ease: Power3.easeOut, delay: 2});
  		TweenMax.from(abilities, 1, {x: "-=400", y: "+=400", scale: 1.5, opacity: 0, ease: Power3.easeOut, delay: 2});
  		TweenMax.from(score, 1, {x: "+=400", y: "+=400", scale: 1.5, opacity: 0, ease: Power3.easeOut, delay: 2});

  		if(!this.props.gameState.instructionsHidden){
  			const tl = new TimelineMax()
			.from(instructions, 1.5, { opacity: 0, ease: Power3.easeOut}, "+=3.5")
			.to(instructions, .5, {opacity: 0, ease: Power3.easeOut, onComplete: ()=>this.state.instructions.shift()}, "+=3")
			.fromTo(instructions, 1.5, { opacity: 0, ease: Power3.easeOut}, {opacity: 1}, "+=1")
			.to(instructions, .5, {opacity: 0, ease: Power3.easeOut, onComplete: ()=>this.state.instructions.shift()}, "+=4")
			.fromTo(instructions, 1.5, { opacity: 0, ease: Power3.easeOut}, {opacity: 1}, "+=1")
			.to(instructions, .5, {opacity: 0, ease: Power3.easeOut, onComplete: ()=>this.state.instructions.shift()}, "+=5")
			.fromTo(instructions, 1.5, { opacity: 0, ease: Power3.easeOut}, {opacity: 1}, "+=1")
			.to(instructions, .5, {opacity: 0, ease: Power3.easeOut, onComplete: this.props.hideInstructions}, "+=5")
  		}
  	}

	render = () => {
		if(this.props.players[socket.id] && scene){
			this.state.leaderboard = [];
			var myNick = scene.getObjectByName(socket.id).nickname;
			if (myNick.length > 15){
				myNick = myNick.slice(0,14) + "...";
			}

			for(let id in this.props.players){
				var nick = scene.getObjectByName(id).nickname;
				if (nick.length > 15){
					nick = nick.slice(0,14) + "...";
				}
				this.state.leaderboard.push({nick, vol: this.props.players[id].volume});
			}
			// sort leaders
			this.state.leaderboard.sort((a, b) => b.vol - a.vol);

			// add self to shortlist (if necessary)
			// var me = this.state.leaderboard.find(e => e.nick === myNick)
			// me.place = this.state.leaderboard.indexOf(me) + 1;
			// this.state.leaderboard.splice(3);
			// if(me.place > 3){
			// 	this.state.leaderboard.push(me);
			// }
		}

		// show score
		if(this.props.players[socket.id] && this.state.displayVol < this.props.players[socket.id].volume){
			this.state.displayVol = ~~(this.state.displayVol * 1.0011);
		}
		if(this.props.players[socket.id] && this.state.displayVol > this.props.players[socket.id].volume){
			this.state.displayVol = this.props.players[socket.id].volume;
		}

		// show eater/eaten status for 3 seconds before fading
		if(this.props.gameStatus.length){
			setTimeout(()=>this.props.keepPlaying(), 3000);
		}


		return (
			<div className="in-game">
				<div className="hud">
					<div ref="leaderboard" className="leaderboard">
						<table>
							<tbody>
							{this.props.players[socket.id] && this.state.leaderboard && this.state.leaderboard.map((person, index) => (
									<tr key={`leaderboard-row-${index+1}`} style={myNick === person.nick ? {backgroundColor: 'rgba(0,0,0,0.3)'} : {}}>
										<td style={{padding: '0px 10px', borderRadius:'0px'}}>{person.place || index + 1}</td>
										<td style={{padding: '0px 10px',borderRadius:'0px'}}>{person.nick}</td>
										<td style={{padding: '0px 10px',borderRadius:'0px'}}>{person.vol}</td>
									</tr>
								))
							}
							</tbody>
						</table>
					</div>
					<div ref="status" className="status">
						{this.props.gameStatus}
					</div>
					<div ref="instructions" className="instructions">
						{!this.props.gameState.instructionsHidden && this.state.instructions[0]}
					</div>
					<div ref="abilities" className="abilities" style={this.props.abilities && this.props.abilities.launch ? {} : {color: 'rgba(255,255,255,0.2)'}}>
					<div>{this.props.players[socket.id] && this.props.abilities && this.props.abilities.meter}</div>
						<div>{this.props.players[socket.id] && this.props.abilities && "launch ready"}</div>
					</div>
					<div ref="score" className="score">
						<div>{this.props.players[socket.id] && 'volume'}
						</div>
						<div>{this.props.players[socket.id] &&this.state.displayVol}
						</div>
					</div>
				</div>
				<div>
					<canvas id="canvas" style={{background: 'linear-gradient(#004570,#00ABD6)'}}></canvas>
				</div>
				<BugReportForm/>
			</div>
		)
	}
}

const mapStateToProps = ({ players, gameStatus, gameState, abilities }) => ({ players, gameStatus, gameState, abilities });

const mapDispatchToProps = dispatch => ({
  keepPlaying: () => dispatch(keepPlaying()),
  hideInstructions: () => dispatch(hideInstructions())
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
