import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
// import Paper from 'material-ui/Paper';
// import Grid from 'material-ui/Grid';
// import Button from 'material-ui/Button';
// import Tetris from '../logic/Tetris';
import gameManager from '../game/GameManager';
// import config from '../config';
import LobbyMenu from './LobbyMenu';
import SingleMenu from './SingleMenu';
import Result from './Result';
import Lobby from './Lobby';
import Chat from './Chat';
import Host from './Host';
import Other from './Other';
import Tools from '../util/Tools';
import { matchPath } from "react-router-dom";

const styles = theme => ({
   root: {
      flexGrow: 1,
   },
   paper: {
      padding: theme.spacing.unit * 2,
      textAlign: 'center',
      color: theme.palette.text.secondary,
   },
   hidden: {
      display: 'none',
   },
   main: {
      position: 'absolute',
      top: '50px',
      width: '100%',
      height: 'calc(100% - 50px)',
   },
   canvas: {
      left: '50%',
      position: 'absolute',
   },
   ui: {
      padding: '12px',
      height: '100%'
   },
   result: {
      position: 'absolute',
      top: '1.4%',
      left: '16.6%',
      width: '62.2%',
      height: '85.7%',
   },
   singleDiv: {
      width: '100%',
      height: '100%',
      position: 'absolute',
   },
   lobbyMenu: {
      position: 'absolute',
      zIndex: 1,
      top: '75%',
      left: '50%',
      width: '7.5%',
   },
   singleMenu: {
      position: 'absolute',
      top: '75%',
      left: '80%',
      width: '19.1%',
   },
});

class Main extends React.Component {
   replayId = null;
   state = {
      vertical: false,
      // 对战可隐藏大厅
      showLobby: true,
      // 聊天窗口显示
      showChat: true,
      // 游戏状态，没玩，单人，录象，对战none,single,replay,battle
      playState: 'none',
      // 对战状态
      battleState: 'none',
      showResult: false,
      resultData: null,
   };

   // constructor(props) {
   //    super(props);
   // }

   componentDidMount() {
      window.addEventListener('resize', this.onResize);
      gameManager.render.attach(this.refs.canvasDiv);
      gameManager.main = this;
      this.onResize();
   }

   componentWillReceiveProps(nextProps) {
      var path = nextProps.location.pathname;
      // 回放
      if (this.matchReplay(path))
         return;
      // 房间
      if (this.matchRoom(path))
         return;
      // 清空状态
      this.clearState();
   }

   componentWillUnmount() {
      window.removeEventListener('resize', this.onResize);
      gameManager.reset();
      gameManager.render.detach();
   }

   /**
    * 录像回放
    */
   matchReplay(path) {
      const match = matchPath(path, {
         path: "/replay/:replayId",
         exact: true,
         strict: false
      });
      if (match && match.params) {
         var replayId = match.params.replayId;
         if (replayId && this.replayId !== replayId) {
            this.replayId = replayId;
            this.setState({ playState: 'replay', showResult: false });
            gameManager.loadReplay(this.replayId);
         }
         return true;
      }
      return false;
   }

   /**
    * 进入房间
    */
   matchRoom(path) {
      const match = matchPath(path, {
         path: "/room/:roomId",
         exact: true,
         strict: false
      });
      if (match && match.params) {
         var roomId = match.params.roomId;
         console.log(roomId, gameManager.roomManager.roomId);
         if (gameManager.roomManager.roomId === roomId) {
            this.setState({ playState: 'battle', showLobby: false, showResult: false });
            gameManager.render.showOtherTetris(true);
            return true;
         } else {
            gameManager.app.home();
         }
      }
      return false;
   }

   /**
    * 清空状态
    */
   clearState() {
      gameManager.reset();
      this.setState({ playState: 'none', battleState: 'none', showLobby: true, showResult: false });
   }

   /**
    * 显示比例的canvasDiv
    */
   onResize = () => {
      var mainDiv = this.mainDiv;
      var div = this.refs.canvasDiv;
      // var lobbyDiv = this.refs.lobbyDiv;
      var singleDiv = this.refs.singleDiv;
      var w = mainDiv.clientWidth;
      var h = mainDiv.clientHeight;
      var vertical = h >= w;
      if (w > h) {
         // 横屏
         singleDiv.style.width = '50%';
         singleDiv.style.left = '50%';
      }
      else {
         // 竖屏
         singleDiv.style.width = '100%';
         singleDiv.style.left = '0';
      }
      // 算出合适长宽
      var { width, height } = Tools.getFitSize(w, h);
      gameManager.render.setVertical(vertical);
      div.style.width = width + 'px';
      div.style.height = height + 'px';
      div.style.marginLeft = -width / 2 + 'px';
      gameManager.render.onResize();
      this.setState({ vertical: vertical });
      // app重算hearder宽
      gameManager.app.onResize(width);
   }

   /**
    * gameManager通知
    */
   onLoadReplay() {
      this.setState({ playState: 'replay', showResult: false });
   }

   onSpeedGame = () => {
      console.log('speed40');
      this.setState({ playState: 'single', showResult: false });
      gameManager.startSpeedGame();
   }

   onDigGame = () => {
      console.log('dig18');
      this.setState({ playState: 'single', showResult: false });
      gameManager.startDigGame(18);
   }

   onRestartGame = () => {
      console.log('onRestartGame');
      gameManager.restart();
      this.setState({ showResult: false });
   }

   onReplayGame = () => {
      console.log('onReplayGame');
      gameManager.replay();
      this.setState({ showResult: false });
   }

   /**
    * 游戏胜利或失败，由gameManager通知
    */
   onGameOver = (win, data) => {
      console.log('onGameOver', win, data);
      this.setState({ showResult: true, resultData: data });
   }

   /**
    * 主动结束游戏
    */
   onEndGame = () => {
      console.log('onEndGame');
      gameManager.reset();
      this.setState({ playState: 'none', showResult: false });
   }

   // /**
   //  * 创建房间成功后调用
   //  */
   // onEnterRoom = (watch) => {
   //    this.setState({ playState: 'battle', showLobby: false, showResult: false });
   // }

   // /**
   //  * 退出房间
   //  */
   // onExitRoom = () => {
   //    this.setState({ playState: 'none', battleState: 'none', showLobby: true, showResult: false });
   // }

   /**
    * 自己的准备状态
    */
   battleReady(ready) {
      var state = ready ? 'ready' : 'none';
      this.setState({ battleState: state, showResult: false });
   }

   /**
    * 准备状态
    */
   onBattleReady(data) {
   }

   /**
    * 对战开始
    */
   onBattleStart() {
      this.setState({ battleState: 'playing', showResult: false });
   }

   /**
    * 对战结束，回到可以准备的状态,由manager通知
    */
   battleEnd(data) {
      this.setState({ battleState: 'none', showResult: true, resultData: data });
   }

   /**
    * 显示隐藏大厅面板
    */
   onShowLobby = (show) => {
      this.setState({ showLobby: show });
   }

   render() {
      const { classes } = this.props;
      const { playState, battleState, vertical, showLobby, showChat, showResult, resultData } = this.state;
      var showOther = !vertical && !showLobby && playState === 'battle' && battleState !== 'playing';
      return (
         <div ref={instance => this.mainDiv = instance} className={classes.main}>
            <div ref='canvasDiv' className={classes.canvas}>
               <Other show={showOther} />
               <Lobby ref='lobbyRef' show={!vertical && showLobby} />
               <Chat ref='chatRef' show={!vertical && showChat} playState={playState} />
               <div className={classes.lobbyMenu}>
                  <LobbyMenu
                     playState={playState}
                     battleState={battleState}
                     vertical={vertical}
                  />
               </div>
               <div ref='singleDiv' className={classes.singleDiv}>
                  <Host show={showOther} />
                  <div className={classes.result}>
                     <Result
                        show={showResult}
                        data={resultData}
                     />
                  </div>
                  <div className={classes.singleMenu}>
                     <SingleMenu
                        playState={playState}
                        onSpeedGame={this.onSpeedGame}
                        onDigGame={this.onDigGame}
                        onRestartGame={this.onRestartGame}
                        onEndGame={this.onEndGame}
                     />
                  </div>
               </div>
               <div className={classes.ui}>
                  {/* <Grid style={{ height: '100%' }} container spacing={24}>
                     <Grid item xs={12} sm={6}>
                        <Paper className={classes.paper}>xs=12 sm=6</Paper>
                     </Grid>
                     <Grid style={{ height: '100%' }} item xs={12} sm={6}>
                     </Grid>
                  </Grid>*/}
               </div>
            </div>
         </div >
      );
   }
}

Main.propTypes = {
   classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Main);