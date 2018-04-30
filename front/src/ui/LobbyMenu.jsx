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
   state = {
      ready: false,
   };

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
      gameManager.battleReady();
      var ready = !this.state.ready;
      this.setState({ ready });
   }

   render() {
      const { classes } = this.props;
      var state = this.props.playState;
      var vertical = this.props.vertical;
      if (vertical || state !== 'battle') {
         return null;
      }
      const { ready } = this.state;
      return (
         <div>
            {ready
               ? <Button variant="raised" color="secondary" className={classes.button} title={lang.get('Cancel')} onClick={this.onReady}>
                  {lang.get('Cancel')}
               </Button>
               : <Button variant="raised" color="primary" className={classes.button} title={lang.get('Ready')} onClick={this.onReady}>
                  {lang.get('Ready')}
               </Button>
            }
            <Button variant="raised" color="secondary" className={classes.button} title={lang.get('Quit')} onClick={this.onQuitRoom}>
               {lang.get('Quit')}
            </Button>
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