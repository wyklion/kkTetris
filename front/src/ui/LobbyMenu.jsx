import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import Button from 'material-ui/Button';
// import RefreshIcon from 'material-ui-icons/Refresh';
// import CloseIcon from 'material-ui-icons/Close';

import gameManager from '../game/GameManager';
// import theme from './Theme';
import lang from '../util/lang';

const styles = theme => ({
   labelButton: {
      marginBottom: '10px',
      minWidth: '70px',
      width: '100%',
   },
   button: {
      minWidth: '30px',
      marginBottom: '5px',
   },
})

class LobbyMenu extends React.Component {
   onClickLobby = () => {
      gameManager.showLobby(true);
   }
   onClickRoom = () => {
      gameManager.showLobby(false);
   }
   onQuitRoom = () => {
      gameManager.exitRoom();
   }

   onReady = () => {
      gameManager.battleReady(true);
   }

   onCancel = () => {
      gameManager.battleReady(false);
   }

   render() {
      const { classes, playState, battleState, vertical } = this.props;
      if (vertical || playState !== 'battle') {
         return null;
      }
      var button = null;
      var quit = null;
      if (battleState === 'none') {
         button = <Button variant="raised" color="primary" className={classes.button} title={lang.get('Ready')} onClick={this.onReady}>
            {lang.get('Ready')}
         </Button>
         quit = <Button variant="raised" color="secondary" className={classes.button} title={lang.get('Quit')} onClick={this.onQuitRoom}>
            {lang.get('Quit')}
         </Button>
      } else if (battleState === 'ready') {
         button = <Button variant="raised" color="secondary" className={classes.button} title={lang.get('Cancel')} onClick={this.onCancel}>
            {lang.get('Cancel')}
         </Button>
      }
      return (
         <div>
            {button}
            {quit}
         </div>
      )
      // if (showLobby) {
      //    return (
      //       <Button variant="raised" color="secondary" title={lang.get('Room')} onClick={this.onClickRoom}>
      //          {lang.get('Room')}
      //       </Button>
      //    )
      // } else {
      //    return (
      //       <Button variant="raised" color="secondary" title={lang.get('Lobby')} onClick={this.onClickLobby}>
      //          {lang.get('Lobby')}
      //       </Button>
      //    )
      // }
   }
}

LobbyMenu.propTypes = {
   classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(LobbyMenu);