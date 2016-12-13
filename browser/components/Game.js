import React, { Component } from 'react';
import { connect } from 'react-redux';
import ReactDOM from 'react-dom';

import socket from '../socket';
import { scene } from '../game/main';

import { hideInstructions, keepPlaying } from '../reducers/gameState';

import Chat from './Chat';

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
        "hold & release spacebar to trade volume for speed"],
      }
    }

    componentDidMount(){
    let { gameState } = this.props;

    // load sound(s)
    createjs.Sound.registerSound("eat.ogg", "eatSound");

    const leaderboard = ReactDOM.findDOMNode(this.refs.leaderboard);
    const record = ReactDOM.findDOMNode(this.refs.record);
    const status = ReactDOM.findDOMNode(this.refs.status);
    const instructions = ReactDOM.findDOMNode(this.refs.instructions);
    const abilities = ReactDOM.findDOMNode(this.refs.abilities);
    const score = ReactDOM.findDOMNode(this.refs.score);

    // animate HUD fly-in
      TweenMax.from(leaderboard, 1, { x: "-=400",
                                      y: "-=400",
                                      scale: 3,
                                      opacity: 0,
                                      ease: Power3.easeOut,
                                      delay: 2 });
      TweenMax.from(record, 1, { x: "+=400",
                                 y: "-=400",
                                 scale: 3,
                                 opacity: 0,
                                 ease: Power3.easeOut,
                                 delay: 2 });
      TweenMax.from(abilities, 1, { x: "-=400",
                                    y: "+=400",
                                    scale: 3,
                                    opacity: 0,
                                    ease: Power3.easeOut,
                                    delay: 2 });
      TweenMax.from(score, 1, { x: "+=400",
                                y: "+=400",
                                scale: 3,
                                opacity: 0,
                                ease: Power3.easeOut,
                                delay: 2 });

      // show instructions
      if(!gameState.instructionsHidden){
        const tl = new TimelineMax()
      .from(instructions, 1.5, { opacity: 0,
                                 ease: Power3.easeOut }, "+=3.5")
      .to(instructions, 0.5, { opacity: 0,
                               ease: Power3.easeOut,
                               onComplete: () => this.state.instructions.shift() }, "+=3")
      .fromTo(instructions, 1.5, { opacity: 0,
                                   ease: Power3.easeOut }, { opacity: 1 }, "+=1")
      .to(instructions, 0.5, { opacity: 0,
                               ease: Power3.easeOut,
                               onComplete: () => this.state.instructions.shift() }, "+=4")
      .fromTo(instructions, 1.5, { opacity: 0,
                                   ease: Power3.easeOut }, { opacity: 1 }, "+=1")
      .to(instructions, 0.5, { opacity: 0,
                               ease: Power3.easeOut,
                               onComplete: () => this.state.instructions.shift() }, "+=5")
      .fromTo(instructions, 1.5, { opacity: 0,
                                   ease: Power3.easeOut }, { opacity: 1 }, "+=1")
      .to(instructions, 0.5, { opacity: 0,
                               ease: Power3.easeOut,
                               onComplete: this.props.hideInstructions }, "+=5")
      }
    }

  render = () => {
    let { players,
          gameState,
          keepPlaying,
          casualty,
          abilities } = this.props;
    let { leaderboard,
          displayVol,
          instructions } = this.state;
    let player = players[socket.id];

    // populate leaderboard
    if(player && scene){
      leaderboard = [];

      // shorten own nickname
      var myNick = scene.getObjectByName(socket.id).nickname;
      if (myNick.length > 15){
        myNick = myNick.slice(0,14) + "...";
      }

      // shorten all other nicknames
      for(let id in players){
        var nick = scene.getObjectByName(id).nickname;
        if (nick.length > 15){
          nick = nick.slice(0,14) + "...";
        }
        leaderboard.push({ nick, vol: players[id].volume });
      }

      // order by volume
      leaderboard.sort((a, b) => b.vol - a.vol);
    }

    // show score
     if(player && displayVol < player.volume){
      if(player.volume/displayVol > 1.01){
        this.state.displayVol = ~~(this.state.displayVol * 1.01);
      }else{
        this.state.displayVol = player.volume;
      }
     }
     if(player && displayVol > player.volume){
      if(displayVol/player.volume > 1.01){
        this.state.displayVol = ~~(this.state.displayVol / 1.01);
      }else{
        this.state.displayVol = player.volume;
      }
     }

    // show eater/eaten status for 3 seconds before fading
    if(gameState.status.length){
      setTimeout(() => keepPlaying(), 3000);
    }

    return (
      <div className="in-game">
        <div className="hud">
          <div ref="leaderboard" className="leaderboard">
            <table>
              <tbody>
              {player && leaderboard && leaderboard.map((person, index) => (
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
            <div>{ casualty && casualty.map((e, i) => <div key={i}>{e}</div>) }
            </div>
          </div>
          <div ref="status" className="status">
            { gameState.status }
          </div>
          <div ref="instructions" className="instructions">
            {!gameState.instructionsHidden && instructions[0]}
          </div>
          <Chat ref="abilities" />
          <div className="abilities">
          </div>
          <div ref="score" className="score">
            <div style={ abilities && abilities.launch ? {} : {color: 'rgba(255,255,255,0.2)'}}>
              { player && abilities && abilities.meter }
            </div>
            <div style={ abilities && abilities.launch ? {marginTop: '-10px'} : {color: 'rgba(255,255,255,0.2)', marginTop: '-10px'}}>
              { player && abilities && "launcher" }
            </div>
            <div>
              {player && 'régime'}
            </div>
            <div style={{marginTop: '-10px'}}>
              <span>
                { player && `${player.foodEaten}` }
              </span>
              <span>
                {player && player.playersEaten > 0 ? ` + ${player.playersEaten}` : ''}
              </span>
            </div>
            <div>
              { player && 'volume' }
            </div>
            <div style={{marginTop: '-10px'}}>
              { player && displayVol }
            </div>
          </div>
        </div>
        <div>
          <canvas id="canvas" style={{background: 'linear-gradient(#004570,#00ABD6)'}}></canvas>
        </div>
      </div>
    )
  }
}

const mapStateToProps = ({ players, gameState, abilities, casualty }) => ({ players, gameState, abilities, casualty });

const mapDispatchToProps = dispatch => ({
  keepPlaying: () => dispatch(keepPlaying()),
  hideInstructions: () => dispatch(hideInstructions())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Canvas);

/*
<div>{this.props.players[socket.id] && 'magnitude'}
            </div>
            <div>
              <span>{this.props.players[socket.id] && `${record.objectEaten}`}
              </span>
              <span>{this.props.record.playersEaten > 0 ? ` + ${this.props.record.playersEaten}` : ''}
              </span>
            </div>
*/
