import React, { Component } from 'react';
import { connect } from 'react-redux';
import ReactDOM from 'react-dom';

import socket from '../socket';
import { scene } from '../game/main';

import { keepPlaying } from '../reducers/gameStatus';
import { hideInstructions } from '../reducers/gameState';

import BugReportForm from './BugReportForm';
import Chat from './Chat';

class Game extends Component {
  constructor(props){
      super(props);
      this.state = {
        leaderboard: [],
        displayVol : 4000,
        instructions: [
          "use arrow keys to move",
          "roll over smaller objects to grow",
          "avoid being rolled up by larger players",
          "hold & release spacebar for speed boost"
        ]
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
      TweenMax.from(leaderboard, 1, {
                                      x: "-=400",
                                      y: "-=400",
                                      scale: 3,
                                      opacity: 0,
                                      ease: Power3.easeOut,
                                      delay: 2
                                    });

      TweenMax.from(record, 1, {
                                 x: "+=400",
                                 y: "-=400",
                                 scale: 3,
                                 opacity: 0,
                                 ease: Power3.easeOut,
                                 delay: 2
                               });
      TweenMax.from(abilities, 1, {
                                    x: "-=400",
                                    y: "+=400",
                                    scale: 3,
                                    opacity: 0,
                                    ease: Power3.easeOut,
                                    delay: 2
                                  });
      TweenMax.from(score, 1, {
                                x: "+=400",
                                y: "+=400",
                                scale: 3,
                                opacity: 0,
                                ease: Power3.easeOut,
                                delay: 2
                              });

      // show instructions
      if(!this.props.gameState.instructionsHidden){
        const tl = new TimelineMax()
      .from(instructions, 1.5, { opacity: 0, ease: Power3.easeOut}, "+=3.5")
      .to(instructions, .5, {
                              opacity: 0,
                              ease: Power3.easeOut,
                              onComplete: ( )=> this.state.instructions.shift()
                            }, "+=3")
      .fromTo(instructions, 1.5, { opacity: 0, ease: Power3.easeOut}, {opacity: 1}, "+=1")
      .to(instructions, .5, {
                              opacity: 0,
                              ease: Power3.easeOut,
                              onComplete: () => this.state.instructions.shift()
                            }, "+=4")
      .fromTo(instructions, 1.5, { opacity: 0, ease: Power3.easeOut}, {opacity: 1}, "+=1")
      .to(instructions, .5, {
                              opacity: 0,
                              ease: Power3.easeOut,
                              onComplete: () => this.state.instructions.shift()
                            }, "+=5")
      .fromTo(instructions, 1.5, { opacity: 0, ease: Power3.easeOut}, {opacity: 1}, "+=1")
      .to(instructions, .5, {
                              opacity: 0,
                              ease: Power3.easeOut,
                              onComplete: this.props.hideInstructions
                            }, "+=5")
      }
    }

  render = () => {
    let { players,
          gameStatus,
          gameState,
          keepPlaying,
          record,
          abilities,
          messages } = this.props;
    let { leaderboard,
          displayVol,
          instructions,
          message } = this.state;
    let { sendMessage,
          updateMessage } = this;
    let player = players[socket.id];

    // populate this.state.leaderboard
    if (player && scene){
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
        leaderboard.push({nick, vol: players[id].volume});
      }

      // order by volume
      leaderboard.sort((a, b) => b.vol - a.vol);
    }

    // show score
    if(player && displayVol < player.volume){
      displayVol = ~~(displayVol * 1.01);
    }
    if(player && displayVol > player.volume){
      displayVol = player.volume;
    }

    // show eater/eaten status for 3 seconds before fading
    if(gameStatus.length){
      setTimeout(() => keepPlaying(), 3000);
    }

    return (
      <div className="in-game">
        <div className="hud">
          <div ref="leaderboard" className="leaderboard">
            <table>
              <tbody>
              {player && leaderboard && leaderboard.map((person, index) => (
                  <tr key={`leaderboard-row-${index+1}`}
                      style={myNick === person.nick ?
                              { backgroundColor: 'rgba(0,0,0,0.3)'} : {}}>
                    <td style={{padding: '0px 10px', borderRadius:'0px'}}>
                      {person.place || index + 1}
                    </td>
                    <td style={{padding: '0px 10px',borderRadius:'0px'}}>
                      {person.nick}
                    </td>
                    <td style={{padding: '0px 10px',borderRadius:'0px'}}>
                      {person.vol}
                    </td>
                  </tr>
                ))
              }
              </tbody>
            </table>
          </div>
          <div ref="record" className="record">
            <div>
              {player && 'magnitude'}
            </div>
            <div>
              <span>
                {player && `${record.objectEaten}`}
              </span>
              <span>
                {record.playersEaten > 0 ? ` + ${record.playersEaten}` : ''}
              </span>
            </div>
          </div>
          <div ref="status" className="status">
            {gameStatus}
          </div>
          <div ref="instructions" className="instructions">
            {!gameState.instructionsHidden && instructions[0]}
          </div>
          <div ref="abilities"
               className="abilities"
               style={abilities && abilities.launch ? {} : {color: 'rgba(255,255,255,0.2)'}}>
            <div>
              {player && abilities && abilities.meter}
            </div>
            <div>
              {player && abilities && "launch ready"}
            </div>
          </div>
          <div ref="score" className="score">
            <div>
              {player && 'volume'}
            </div>
            <div>
              {player && displayVol}
            </div>
          </div>
        </div>
        <div>
          <canvas id="canvas" style={{background: 'linear-gradient(#004570,#00ABD6)'}}></canvas>
        </div>
        <Chat />
      </div>
    )
  }
}

const mapStateToProps = ({ players,
                           gameStatus,
                           gameState,
                           abilities,
                           record }) => ({ players,
                                           gameStatus,
                                           gameState,
                                           abilities,
                                           record });

const mapDispatchToProps = dispatch => ({
  keepPlaying: () => dispatch(keepPlaying()),
  hideInstructions: () => dispatch(hideInstructions())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Game);
