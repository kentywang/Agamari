import React, { Component } from 'react';
import { connect } from 'react-redux';
import socket from '../socket';
import { scene } from '../game/main';

class Canvas extends Component {
	constructor(props){
    	super(props);
    	this.state = {
    		leaderboard: [],
    		displayVol : 4200
    	}
  	}

  	componentDidMount(){
		createjs.Sound.registerSound("eat.ogg", "eatSound");
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
			var me = this.state.leaderboard.find(e => e.nick === myNick)
			me.place = this.state.leaderboard.indexOf(me) + 1;
			this.state.leaderboard.splice(3);
			if(me.place > 3){
				this.state.leaderboard.push(me);
			}
		}

		// show score
		if(this.props.players[socket.id] && this.state.displayVol < this.props.players[socket.id].volume){
			this.state.displayVol = ~~(this.state.displayVol * 1.0011);
		}
		if(this.props.players[socket.id] && this.state.displayVol > this.props.players[socket.id].volume){
			this.state.displayVol = this.props.players[socket.id].volume;
		}


		return (
			<div>
				<div className="hud">
					<div className="leaderboard">
						<table>
							<tbody>
							{this.props.players[socket.id] && this.state.leaderboard && this.state.leaderboard.map((person, index) => (
									<tr key={`leaderboard-row-${index+1}`} style={myNick === person.nick ? {backgroundColor: 'rgba(0,0,0,0.3)'} : {}}>
										<td style={{padding: '0px 10px', borderRadius:'0px'}}>{person.place || index + 1}</td>
										<td style={{padding: '0px 10px',borderRadius:'0px'}}>{person.nick}</td>
										<td style={{padding: '0px 10px',borderRadius:'0px'}}>{(index === 0) && person.vol}</td>
									</tr>
								))
							}
							</tbody>
						</table>
					</div>
					<div className="abilities">abilities</div>
					<div className="score">
						<div>{this.props.players[socket.id] && 'volume'}
						</div>
						<div>{this.props.players[socket.id] &&this.state.displayVol}
						</div>
					</div>
				</div>
				<div style={{fontFamily: "Quicksand", fontWeight: "bold", display: "none"}}>
					Keep this div in to preload fonts for canvas.
				</div>
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
