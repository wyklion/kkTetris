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
      margin: '0 auto',
   },
   ui: {
      padding: '12px',
      height: '100%'
   },
   singleDiv: {
      width: '100%',
      height: '100%'
   },
   singleMenu: {
      left: '65%',
      position: 'relative',
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
   };

   constructor(props) {
      super(props);
   }

   componentDidMount() {
      window.addEventListener('resize', this.onResize);
      this.onResize();
      gameManager.setRenderDiv(this.refs.canvasDiv);
      gameManager.main = this;
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
         singleDiv.style.marginLeft = '50%';
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
         singleDiv.style.marginLeft = '0';
      }
      div.style.width = width + 'px';
      div.style.height = height + 'px';
   }

   onSpeedGame = () => {
      console.log('single40');
      this.setState({ singlePlaying: true });
      gameManager.startSpeedGame();
   }

   onDigGame = () => {
      console.log('dig20');
      this.setState({ singlePlaying: true });
   }

   onRestartGame = () => {
      console.log('onRestartGame');
      gameManager.restart();
   }

   onEndGame = () => {
      console.log('onEndGame');
      gameManager.reset();
      this.setState({ singlePlaying: false });
   }

   render() {
      const { classes } = this.props;
      return (
         <div ref={instance => this.mainDiv = instance} className={classes.main}>
            <div ref='canvasDiv' className={classes.canvas}>
               <div ref='singleDiv' className={classes.singleDiv}>
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