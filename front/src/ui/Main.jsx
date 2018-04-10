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
      var mainDiv = this.refs.mainDiv;
      var w = mainDiv.clientWidth;
      var h = mainDiv.clientHeight;
      // console.log(w, h);
      var renderWidth = config.render.width;
      var renderHeight = config.render.height;
      var scale = h / w > renderHeight / renderWidth ? w / renderWidth : h / renderHeight;
      var div = this.refs.canvasDiv;
      var width = Math.round(renderWidth * scale);
      var height = Math.round(renderHeight * scale);
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
         <div ref='mainDiv' className={classes.main}>
            <div ref='canvasDiv' className={classes.canvas}>
               <div className={classes.ui}>
                  <Grid style={{ height: '100%' }} container spacing={24}>
                     <Grid item xs={12} sm={6}>
                        <Paper className={classes.paper}>xs=12 sm=6</Paper>
                     </Grid>
                     <Grid style={{ height: '100%' }} item xs={12} sm={6}>
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
                     </Grid>
                  </Grid>
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