import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import Paper from 'material-ui/Paper';
import Grid from 'material-ui/Grid';
import * as PIXI from 'pixi.js'

const styles = theme => ({
   root: {
      flexGrow: 1,
   },
   paper: {
      padding: theme.spacing.unit * 2,
      textAlign: 'center',
      color: theme.palette.text.secondary,
   },
});

class Lobby extends React.Component {
   state = {
      anchorElSetting: null,
      anchorElUser: null,
      openKeyboard: false
   };

   constructor(props) {
      super(props);
      this.canvas = new PIXI.Application({
         width: 256,         // default: 800
         height: 256,        // default: 600
         antialias: true,    // default: false
         transparent: false, // default: false
         resolution: 1       // default: 1
      });
   }

   componentDidMount() {
      this.refs.canvasDiv.appendChild(this.canvas.view);
   }

   render() {
      const { classes } = this.props;
      return (
         <Grid container spacing={24}>
            <Grid item xs={12} sm={6}>
               <Paper className={classes.paper}>xs=12 sm=6</Paper>
            </Grid>
            <Grid item xs={12} sm={6}>
               <div ref='canvasDiv' ></div>
            </Grid>
         </Grid>
      );
   }
}

Lobby.propTypes = {
   classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Lobby);