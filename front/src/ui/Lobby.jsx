import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import AppBar from 'material-ui/AppBar';
import Tabs, { Tab } from 'material-ui/Tabs';
import Typography from 'material-ui/Typography';
import Paper from 'material-ui/Paper';

import gameManager from '../game/GameManager';
import config from '../config';
import Rooms from './Rooms';
import Friends from './Friends';
import Users from './Users';
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
      // background: '#888888',
   },
   paper: {
      margin: '10px',
      height: 'calc(100% - 20px)',
   },
   tabs: {
      // background: '#dddddd'
   },
   content: {
      height: 'calc(100% - 48px)',
      // background: '#aaaaaa'
   }
});

class Lobby extends React.Component {
   state = {
      userCount: 0,
      value: 0,
   };

   componentWillMount() {
      this.state.userCount = gameManager.userManager.userCount;
   }
   componentDidMount() {
      gameManager.userManager.updateUsersListeners.add(this.onUpdateUser);
   }
   componentWillUnmount() {
      gameManager.userManager.updateUsersListeners.remove(this.onUpdateUser);
   }

   onUpdateUser = () => {
      this.setState({ userCount: gameManager.userManager.userCount });
   }

   handleChangeTab = (event, value) => {
      this.setState({ value });
   };

   render() {
      const { classes, theme, show } = this.props;
      const { value } = this.state;
      if (!show) {
         return null;
      }
      return (
         <div className={classes.root}>
            <Paper className={classes.paper}>
               <Tabs
                  className={classes.tabs}
                  value={this.state.value}
                  onChange={this.handleChangeTab}
                  indicatorColor="primary"
                  textColor="primary"
                  fullWidth
               >
                  <Tab label={lang.get('Rooms')} />
                  <Tab label={lang.get('Friends') + "(" + gameManager.userManager.friendCount + ")"} />
                  <Tab label={lang.get('Online') + "(" + gameManager.userManager.userCount + ")"} />
               </Tabs>
               <div className={classes.content} >
                  {value === 0 && <Rooms />}
                  {value === 1 && <Friends />}
                  {value === 2 && <Users />}
               </div>
            </Paper >
         </div>
      )
   }
}

Lobby.propTypes = {
   classes: PropTypes.object.isRequired,
   theme: PropTypes.object.isRequired,
};

export default withStyles(styles, { withTheme: true })(Lobby);