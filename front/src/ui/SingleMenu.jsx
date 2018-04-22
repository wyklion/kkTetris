import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import Button from 'material-ui/Button';
import RefreshIcon from 'material-ui-icons/Refresh';
import CloseIcon from 'material-ui-icons/Close';

import gameManager from '../game/GameManager';
import theme from './Theme';
import lang from '../util/lang';
import keyName from '../util/keyName';

const styles = theme => ({
   labelButton: {
      marginBottom: '10px',
      minWidth: '70px',
      width: '100%',
   },
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
      openKeyboard: false,
      startKeyCode: 113, // 默认F2
   };

   componentWillMount() {
      this.state.startKeyCode = gameManager.userManager.user.keyboard.start || 113;
   }
   componentDidMount() {
      gameManager.keySettingListener.add(this.onKeyChange);
      document.body.addEventListener("keydown", this.onKeyDown, false);
   }
   componentWillUnmount() {
      gameManager.keySettingListener.remove(this.onKeyChange);
      document.body.removeEventListener("keydown", this.onKeyDown, false);
   }

   /**
    * 改键
    */
   onKeyChange = () => {
      var keyCode = gameManager.userManager.user.keyboard.start || 113;
      this.setState({ startKeyCode: keyCode });
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
            if (keyCode === this.state.startKeyCode) {
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
                  <Button variant="raised" color="primary" title={lang.get('Srpint 40L') + ' (F2)'} className={classes.labelButton} onClick={this.onSpeedGameClick}>
                     {lang.get('Sprint') + '(F2)'}
                  </Button>
                  <Button variant="raised" color="primary" title={lang.get('Dig Race 18L') + ' (F3)'} className={classes.labelButton} onClick={this.onDigGameClick}>
                     {lang.get('Dig') + '(F3)'}
                  </Button>
               </div>
            )
         } else {
            buttons = (
               <div>
                  <Button variant="raised" color="primary" title={lang.get('Restart') + ' (' + keyName[this.state.startKeyCode] + ')'} className={classes.labelButton} onClick={this.onRestartClick}>
                     {lang.get('Restart') + '(' + keyName[this.state.startKeyCode] + ')'}
                  </Button>
                  <Button variant="raised" color="secondary" title={lang.get('End') + ' (ESC)'} className={classes.labelButton} onClick={this.onEndGameClick}>
                     {lang.get('End') + '(ESC)'}
                  </Button>
                  {/* <Button variant="fab" color="primary" title={lang.get('Restart') + '(F2)'} aria-label="add" className={classes.button} onClick={this.onRestartClick}>
                     <RefreshIcon />
                  </Button>
                  <Button variant="fab" color="secondary" title={lang.get('End') + '(ESC)'} aria-label="add" className={classes.button} onClick={this.onEndGameClick}>
                     {lang.get('End') + '(ESC)'}
                     <CloseIcon />
                  </Button> */}
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