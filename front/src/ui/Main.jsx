import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
// import Paper from 'material-ui/Paper';
// import Grid from 'material-ui/Grid';
// import Button from 'material-ui/Button';
// import Tetris from '../logic/Tetris';
import gameManager from '../game/GameManager';
import config from '../config';
import LobbyMenu from './LobbyMenu';
import SingleMenu from './SingleMenu';
import Result from './Result';
import Lobby from './Lobby';
import Chat from './Chat';

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
   }
});

class Main extends React.Component {
   state = {
      vertical: false,
      // 对战可隐藏大厅
      showLobby: true,
      // 聊天窗口显示
      showChat: true,
      // 游戏状态，没玩，单人，录象，对战none,single,replay,battle
      playState: 'none',
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

   componentWillUnmount() {
      window.removeEventListener('resize', this.onResize);
      gameManager.render.detach();
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
      var width, height;
      var renderWidth, renderHeight, scale;
      // 横屏
      if (w > h) {
         gameManager.render.setVertical(false);
         // console.log(w, h);
         renderWidth = config.render.width;
         renderHeight = config.render.height;
         scale = h / w > renderHeight / renderWidth ? w / renderWidth : h / renderHeight;
         width = Math.round(renderWidth * scale);
         height = Math.round(renderHeight * scale);
         singleDiv.style.width = '50%';
         singleDiv.style.left = '50%';
      }
      // 竖屏
      else {
         gameManager.render.setVertical(true);
         renderWidth = config.renderSingle.width;
         renderHeight = config.renderSingle.height;
         scale = h / w > renderHeight / renderWidth ? w / renderWidth : h / renderHeight;
         width = Math.round(renderWidth * scale);
         height = Math.round(renderHeight * scale);
         singleDiv.style.width = '100%';
         singleDiv.style.left = '0';
      }
      div.style.width = width + 'px';
      div.style.height = height + 'px';
      div.style.marginLeft = -width / 2 + 'px';
      gameManager.render.onResize();
      this.setState({ vertical: h >= w });
      this.props.onResize(width);
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
      gameManager.endGame();
      this.setState({ playState: 'none', showResult: false });
   }

   /**
    * 创建房间成功后调用
    */
   onEnterRoom = () => {
      this.setState({ playState: 'battle', showLobby: false });
   }

   /**
    * 退出房间
    */
   onExitRoom = () => {
      this.setState({ playState: 'none', showLobby: true });
   }

   /**
    * 显示隐藏大厅面板
    */
   onShowLobby = (show) => {
      this.setState({ showLobby: show });
   }

   render() {
      const { classes, hidden } = this.props;
      const { playState, vertical, showLobby, showChat, showResult, resultData } = this.state;
      return (
         <div ref={instance => this.mainDiv = instance} className={hidden ? classes.hidden : classes.main}>
            <div ref='canvasDiv' className={classes.canvas}>
               <Lobby ref='lobbyRef' show={!vertical && showLobby} />
               <Chat ref='chatRef' show={!vertical && showChat} playState={playState} />
               <div className={classes.lobbyMenu}>
                  <LobbyMenu
                     playState={playState}
                     vertical={vertical}
                  />
               </div>
               <div ref='singleDiv' className={classes.singleDiv}>
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