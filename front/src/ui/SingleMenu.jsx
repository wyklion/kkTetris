import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import Button from 'material-ui/Button';
import RefreshIcon from 'material-ui-icons/Refresh';
import CloseIcon from 'material-ui-icons/Close';

import gameManager from '../game/GameManager';
import theme from './Theme';
import lang from '../util/lang';

const styles = theme => ({
   button: {
      marginBottom: '10px',
      minWidth: '60px',
      width: '60px',
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
                  <Button variant="raised" color="primary" title={lang.get('Srpint 40L') + '(F2)'} className={classes.button} onClick={this.onSpeedGameClick}>
                     {lang.get('Sprint')}
                  </Button>
                  <Button variant="raised" color="secondary" title={lang.get('Dig 20L') + '(F3)'} className={classes.button} onClick={this.onDigGameClick}>
                     {lang.get('Dig')}
                  </Button>
               </div>
            )
         } else {
            buttons = (
               <div>
                  <Button variant="fab" color="primary" title="重来(F2)" aria-label="add" className={classes.button} onClick={this.onRestartClick}>
                     <RefreshIcon />
                  </Button>
                  <Button variant="fab" color="secondary" title="结束(ESC)" aria-label="add" className={classes.button} onClick={this.onEndGameClick}>
                     <CloseIcon />
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