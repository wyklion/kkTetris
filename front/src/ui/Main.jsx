import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import Paper from 'material-ui/Paper';
import Grid from 'material-ui/Grid';
// import Tetris from '../logic/Tetris';
import gameManager from '../game/GameManager';

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
      padding: '12px'
   }
});

class Main extends React.Component {
   state = {
      anchorElSetting: null,
      anchorElUser: null,
      openKeyboard: false
   };

   constructor(props) {
      super(props);
   }

   componentDidMount() {
      window.addEventListener('resize', this.onResize);
      this.onResize();
      gameManager.setRenderDiv(this.refs.canvasDiv);
      gameManager.startSpeedGame();
   }

   /**
    * 800*600比例的canvasDiv
    */
   onResize = () => {
      var mainDiv = this.refs.mainDiv;
      var w = mainDiv.clientWidth;
      var h = mainDiv.clientHeight;
      // console.log(w, h);
      var scale = h / w > 3 / 4 ? w / 800 : h / 600;
      var div = this.refs.canvasDiv;
      var width = Math.round(800 * scale);
      var height = Math.round(600 * scale);
      div.style.width = width + 'px';
      div.style.height = height + 'px';
   }

   render() {
      const { classes } = this.props;
      return (
         <div ref='mainDiv' className={classes.main}>
            <div ref='canvasDiv' className={classes.canvas}>
               <div className={classes.ui}>
                  <Grid container spacing={24}>
                     <Grid item xs={12} sm={6}>
                        <Paper className={classes.paper}>xs=12 sm=6</Paper>
                     </Grid>
                     <Grid item xs={12} sm={6}>
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