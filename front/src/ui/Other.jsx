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
      width: '50%',
      height: '60%',
      position: 'absolute',
      userSelect: 'none',
      display: 'flex',
      // background: '#888888',
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

class Other extends React.Component {
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
      this.setState({ userId: gameManager.roomManager.otherId, ready: gameManager.roomManager.otherReady });
      console.log(gameManager.roomManager.otherId, gameManager.roomManager.otherReady);
   }

   render() {
      const { classes, show } = this.props;
      const { userId, ready } = this.state;
      if (!show) {
         return null;
      }
      return (
         <div className={classes.root}>
            <div className={classes.info}>
               <Typography variant="display1" gutterBottom className={classes.userId}>
                  {userId || lang.get('battleNobody')}
               </Typography>
               {ready && < Typography variant="headline" gutterBottom className={classes.ready}>
                  {lang.get('Ready')}
               </Typography>}
            </div>
         </div >
      )
   }
}

Other.propTypes = {
   classes: PropTypes.object.isRequired,
   theme: PropTypes.object.isRequired,
};

export default withStyles(styles, { withTheme: true })(Other);