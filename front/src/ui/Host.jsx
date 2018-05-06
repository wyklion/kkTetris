import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
// import AppBar from 'material-ui/AppBar';
import Typography from 'material-ui/Typography';

import gameManager from '../game/GameManager';
// import config from '../config';
import lang from '../util/lang';

function TabContainer(props) {
   return (
      <Typography component="div" style={{ padding: 8 * 3 }}>
         {props.children}
      </Typography>
   );
}

TabContainer.propTypes = {
   children: PropTypes.node.isRequired,
};

const styles = theme => ({
   root: {
      position: 'absolute',
      top: '1.4%',
      left: '16.6%',
      width: '62.2%',
      height: '85.7%',
      userSelect: 'none',
      display: 'flex',
   },
   info: {
      margin: 'auto',
   },
   userId: {

   },
   ready: {
      color: '#00FF00'
   }
});

class Host extends React.Component {
   state = {
      userId: null,
      ready: false,
   }
   componentWillMount() {
      var room = gameManager.roomManager.room;
      if (!room) {
         return;
      }
      this.onUpdateBattle();
   }
   componentDidMount() {
      gameManager.roomManager.updateBattleListeners.add(this.onUpdateBattle);
   }
   componentWillUnmount() {
      gameManager.roomManager.updateBattleListeners.remove(this.onUpdateBattle);
   }

   onUpdateBattle = () => {
      var room = gameManager.roomManager.room;
      if (!room) return;
      this.setState({ userId: gameManager.roomManager.hostId, ready: gameManager.roomManager.hostReady });
      // console.log(gameManager.roomManager.hostId, gameManager.roomManager.hostReady);
   }

   render() {
      const { classes, show } = this.props;
      const { userId, ready } = this.state;
      if (!show) {
         return null;
      }
      var watch = gameManager.roomManager.watch;
      var playing = gameManager.game ? gameManager.game.state !== 0 : false;
      var realPlaying = gameManager.roomManager.room.playing;
      var status = null;
      if (watch && !playing && realPlaying) {
         status = < Typography variant="headline" gutterBottom className={classes.ready}>
            {lang.get('Playing')}
         </Typography>
      } else if (ready) {
         status = < Typography variant="headline" gutterBottom className={classes.ready}>
            {lang.get('Ready')}
         </Typography>
      }
      return (
         <div className={classes.root}>
            <div className={classes.info}>
               <Typography variant="display1" gutterBottom className={classes.userId}>
                  {userId || lang.get('battleNobody')}
               </Typography>
               {status}
            </div>
         </div >
      )
   }
}

Host.propTypes = {
   classes: PropTypes.object.isRequired,
   theme: PropTypes.object.isRequired,
};

export default withStyles(styles, { withTheme: true })(Host);