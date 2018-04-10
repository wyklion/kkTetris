import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import Button from 'material-ui/Button';
import gameManager from '../game/GameManager';

const styles = theme => ({
   button: {
      width: '100%',
      marginBottom: '10px',
   },
})

class SingleMenu extends React.Component {
   state = {
      anchorElSetting: null,
      anchorElUser: null,
      openKeyboard: false
   };

   componentDidMount() {
      document.body.addEventListener("keydown", this.onKeyDown, false);
   }
   componentWillUnmount() {
      document.body.removeEventListener("keydown", this.onKeyDown, false);
   }

   onKeyDown = (event) => {
      var keyCode = event.keyCode;
      if (this.props.single) {
         if (!this.props.playing) {
            if (keyCode === 113) { // F2
               this.onSpeedGameClick();
            } else if (keyCode === 114) { // F3
               this.onDigGameClick();
            }
         } else {
            if (keyCode === 113) { // F2
               this.onRestartClick();
            } else if (keyCode === 27) { // ESC
               this.onEndGameClick();
            }
         }
      }
      if (keyCode == 114) {
         event.preventDefault();
      }
   }

   onSpeedGameClick = () => {
      this.props.onSpeedGame();
   }

   onDigGameClick = () => {
      this.props.onDigGame();
   }

   onRestartClick = () => {
      this.props.onRestartGame();
   }

   onEndGameClick = () => {
      this.props.onEndGame();
   }

   render() {
      var classes = this.props.classes;
      var buttons;
      if (this.props.single) {
         if (!this.props.playing) {
            buttons = (
               <div>
                  <Button variant="raised" color="primary" className={classes.button} onClick={this.onSpeedGameClick}>
                     竞速40行(F2)
               </Button>
                  <Button variant="raised" color="secondary" className={classes.button} onClick={this.onDigGameClick}>
                     挖掘20行(F3)
               </Button>
               </div>
            )
         } else {
            buttons = (
               <div>
                  <Button variant="raised" color="primary" className={classes.button} onClick={this.onRestartClick}>
                     重来(F2)
                  </Button>
                  <Button variant="raised" color="primary" className={classes.button} onClick={this.onEndGameClick}>
                     结束(ESC)
                  </Button>
               </div>
            )
         }
      }
      return buttons;
   }
}

SingleMenu.propTypes = {
   classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(SingleMenu);