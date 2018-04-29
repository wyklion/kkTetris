import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import Button from 'material-ui/Button';
// import RefreshIcon from 'material-ui-icons/Refresh';
// import CloseIcon from 'material-ui-icons/Close';

import gameManager from '../game/GameManager';
// import theme from './Theme';
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
      this.setState({
         startKeyCode: gameManager.userManager.user.keyboard.start || 113,
      })
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
      //输入框状态
      if (!gameManager.focus) {
         return;
      }
      var keyCode = event.keyCode;
      var state = this.props.playState;
      if (state === 'none') {
         if (keyCode === 113) { // F2
            this.onSpeedGameClick();
         } else if (keyCode === 114) { // F3
            this.onDigGameClick();
         }
      } else if (state === 'single') {
         if (keyCode === this.state.startKeyCode) {
            this.onRestartClick();
         } else if (keyCode === 27) { // ESC
            this.onEndGameClick();
         }
      } else if (state === 'replay') {
         if (keyCode === 27) { // ESC
            this.onEndGameClick();
         }
      }
      // 全屏蔽
      // if (keyCode === 114 || keyCode === 17) { // F3 Ctrl
      event.preventDefault();
      // }
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

   makeNormalButton() {
      var classes = this.props.classes;
      return (
         <div>
            <Button variant="raised" color="primary" title={lang.get('Srpint 40L') + ' (F2)'} className={classes.labelButton} onClick={this.onSpeedGameClick}>
               {lang.get('Sprint') + '(F2)'}
            </Button>
            <Button variant="raised" color="primary" title={lang.get('Dig Race 18L') + ' (F3)'} className={classes.labelButton} onClick={this.onDigGameClick}>
               {lang.get('Dig') + '(F3)'}
            </Button>
         </div>
      )
   }

   makeSingleButton() {
      var classes = this.props.classes;
      return (
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

   makeReplayButton() {
      var classes = this.props.classes;
      return (
         <div>
            <Button variant="raised" color="secondary" title={lang.get('End') + ' (ESC)'} className={classes.labelButton} onClick={this.onEndGameClick}>
               {lang.get('End') + '(ESC)'}
            </Button>
         </div>
      )
   }

   render() {
      var buttons;
      var state = this.props.playState;
      if (state === 'none') {
         buttons = this.makeNormalButton();
      } else if (state === 'single') {
         buttons = this.makeSingleButton();
      } else if (state === 'replay') {
         buttons = this.makeReplayButton();
      }
      return buttons;
   }
}

SingleMenu.propTypes = {
   classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(SingleMenu);