import React, { Component } from 'react';
import { connect } from 'react-redux';
import ReactDOM from 'react-dom';

import socket from '../socket';
import { scene } from '../game/main';

import { keepPlaying } from '../reducers/gameStatus';
import { hideInstructions } from '../reducers/gameState';

import BugReportForm from './BugReportForm';

class Canvas extends Component {
	constructor(props){
    	super(props);
    	this.state = {
    		leaderboard: [],
    		displayVol : 4000,
    		instructions: [
    		"use arrow keys to move",
    		"roll over smaller objects to grow",
    		"avoid being rolled up by larger players",
    		"hold & release spacebar for speed boost"],
    	}
  	}

  	componentDidMount(){
  		// load sound(s)
		createjs.Sound.registerSound("eat.ogg", "eatSound");

		const leaderboard = ReactDOM.findDOMNode(this.refs.leaderboard);
		const record = ReactDOM.findDOMNode(this.refs.record);
		const status = ReactDOM.findDOMNode(this.refs.status);
		const instructions = ReactDOM.findDOMNode(this.refs.instructions);
		const abilities = ReactDOM.findDOMNode(this.refs.abilities);
		const score = ReactDOM.findDOMNode(this.refs.score);

		// animate HUD fly-in
  		TweenMax.from(leaderboard, 1, {x: "-=400", y: "-=400", scale: 3, opacity: 0, ease: Power3.easeOut, delay: 2});
  		TweenMax.from(record, 1, {x: "+=400", y: "-=400", scale: 3, opacity: 0, ease: Power3.easeOut, delay: 2});
  		TweenMax.from(abilities, 1, {x: "-=400", y: "+=400", scale: 3, opacity: 0, ease: Power3.easeOut, delay: 2});
  		TweenMax.from(score, 1, {x: "+=400", y: "+=400", scale: 3, opacity: 0, ease: Power3.easeOut, delay: 2});

  		// show instructions
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

		// populate this.state.leaderboard 
		if(this.props.players[socket.id] && scene){
			this.state.leaderboard = [];

			// shorten own nickname
			var myNick = scene.getObjectByName(socket.id).nickname;
			if (myNick.length > 15){
				myNick = myNick.slice(0,14) + "...";
			}

			// shorten all other nicknames
			for(let id in this.props.players){
				var nick = scene.getObjectByName(id).nickname;
				if (nick.length > 15){
					nick = nick.slice(0,14) + "...";
				}
				this.state.leaderboard.push({nick, vol: this.props.players[id].volume});
			}

			// order by volume
			this.state.leaderboard.sort((a, b) => b.vol - a.vol);
		}

		// show score
		if(this.props.players[socket.id] && this.state.displayVol < this.props.players[socket.id].volume){
			this.state.displayVol = ~~(this.state.displayVol * 1.01);
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
					<div ref="record" className="record">
						<div>{this.props.players[socket.id] && 'magnitude'}
						</div>
						<div>
							<span>{this.props.players[socket.id] && `${this.props.record.objectEaten}`}
							</span>
							<span>{this.props.record.playersEaten > 0 ? ` + ${this.props.record.playersEaten}` : ''}
							</span>
						</div>
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

const mapStateToProps = ({ players, gameStatus, gameState, abilities, record }) => ({ players, gameStatus, gameState, abilities, record });

const mapDispatchToProps = dispatch => ({
  keepPlaying: () => dispatch(keepPlaying()),
  hideInstructions: () => dispatch(hideInstructions())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Canvas);
