import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import Paper from 'material-ui/Paper';
import Grid from 'material-ui/Grid';
import Button from 'material-ui/Button';
// import Tetris from '../logic/Tetris';
import gameManager from '../game/GameManager';
import config from '../config';
import SingleMenu from './SingleMenu';
import Result from './Result';

const styles = theme => ({
   root: {
      flexGrow: 1,
   },
   paper: {
      padding: theme.spacing.unit * 2,
      textAlign: 'center',
      color: theme.palette.text.secondary,
   },
   main: {
      position: 'absolute',
      top: '64px',
      width: '100%',
      height: 'calc(100% - 64px)',
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
      width: '55%',
      height: '35%',
      left: '6%',
      top: '30%',
   },
   singleDiv: {
      width: '100%',
      height: '100%',
      position: 'absolute',
   },
   singleMenu: {
      left: '67.5%',
      position: 'absolute',
      top: '70%',
      width: '30%',
   }
});

class Main extends React.Component {
   state = {
      anchorElSetting: null,
      anchorElUser: null,
      openKeyboard: false,
      singlePlaying: false,
      showResult: false,
      resultData: null,
   };

   constructor(props) {
      super(props);
   }

   componentDidMount() {
      window.addEventListener('resize', this.onResize);
      gameManager.setRenderDiv(this.refs.canvasDiv);
      gameManager.main = this;
      this.onResize();
   }

   /**
    * 显示比例的canvasDiv
    */
   onResize = () => {
      var mainDiv = this.mainDiv;
      var div = this.refs.canvasDiv;
      var singleDiv = this.refs.singleDiv;
      var w = mainDiv.clientWidth;
      var h = mainDiv.clientHeight;
      var width, height;
      // 横屏
      if (w > h) {
         gameManager.render.setVertical(false);
         // console.log(w, h);
         var renderWidth = config.render.width;
         var renderHeight = config.render.height;
         var scale = h / w > renderHeight / renderWidth ? w / renderWidth : h / renderHeight;
         width = Math.round(renderWidth * scale);
         height = Math.round(renderHeight * scale);
         singleDiv.style.width = '50%';
         singleDiv.style.left = '50%';
      }
      // 竖屏
      else {
         gameManager.render.setVertical(true);
         var renderWidth = config.renderSingle.width;
         var renderHeight = config.renderSingle.height;
         var scale = h / w > renderHeight / renderWidth ? w / renderWidth : h / renderHeight;
         width = Math.round(renderWidth * scale);
         height = Math.round(renderHeight * scale);
         singleDiv.style.width = '100%';
         singleDiv.style.left = '0';
      }
      div.style.width = width + 'px';
      div.style.height = height + 'px';
      div.style.marginLeft = -width / 2 + 'px';
      gameManager.render.onResize();
   }

   onSpeedGame = () => {
      console.log('single40');
      this.setState({ singlePlaying: true, showResult: false });
      gameManager.startSpeedGame();
   }

   onDigGame = () => {
      console.log('dig20');
      this.setState({ singlePlaying: true, showResult: false });
   }

   onRestartGame = () => {
      console.log('onRestartGame');
      gameManager.restart();
      this.setState({ showResult: false });
   }

   /**
    * 游戏胜利或失败
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
      this.setState({ singlePlaying: false, showResult: false });
   }

   render() {
      const { classes } = this.props;
      const { showResult, resultData } = this.state;
      return (
         <div ref={instance => this.mainDiv = instance} className={classes.main}>
            <div ref='canvasDiv' className={classes.canvas}>
               <div ref='singleDiv' className={classes.singleDiv}>
                  <div className={classes.result}>
                     <Result
                        show={showResult}
                        data={resultData}
                     />
                  </div>
                  <div className={classes.singleMenu}>
                     <SingleMenu
                        single={true}
                        playing={this.state.singlePlaying}
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
         </div>
      );
   }
}

Main.propTypes = {
   classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Main);