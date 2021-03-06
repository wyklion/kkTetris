import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import Typography from 'material-ui/Typography';
import Button from 'material-ui/Button';
import Table, { TableBody, TableCell, TableHead, TableRow } from 'material-ui/Table';
// import PlayIcon from 'material-ui-icons/PlayArrow';
// import Checkbox from 'material-ui/Checkbox';

import http from '../util/http.js';
import gameManager from '../game/GameManager.js';
import lang from '../util/lang';
import keyName from '../util/keyName';
import Tools from '../util/Tools';

const styles = theme => ({
   root: {
      // width: '500px',
      // margin: '0 auto',
      display: 'flex',
      height: '100%',
      overflow: 'auto',
   },
   main: {
      margin: '0 auto',
   },
   button: {
      left: '50%',
      width: '80px',
      marginLeft: '-40px',
   },
   title: {
      margin: '20px 0',
   },
   item: {
      margin: '5px 0 5px 20px',
   },
   userDiv: {
      textAlign: 'left',
   },
   keyboard: {
      textAlign: 'left',
   },
   keys: {
      display: 'flex',
   },
   keyName: {
      color: 'orange',
   },
   statsDiv: {
      textAlign: 'left',
   },
   replayDiv: {

   }
});

class Profile extends React.Component {
   state = {
      user: null,
      replays: null,
   };

   componentDidMount() {
      var userId = this.props.match.params.userId;
      http.get({ url: 'userInfo', data: { id: userId } }, (err, result) => {
         if (err) {
            alert(err);
         } else {
            this.setState({ user: result });
         }
      })
      http.get({ url: 'userReplay', data: { id: userId } }, (err, result) => {
         if (err) {
            alert(err);
         } else {
            this.setState({ replays: result });
         }
      })
   }

   /**
    * 重播
    */
   onReplay = (replayId) => {
      return () => {
         gameManager.app.onReplay(replayId);
      }
   }

   makeReplayTable(replays) {
      const { classes } = this.props;
      var rows = [];
      for (var i = 0; i < replays.length; i++) {
         var replay = replays[i];
         var type = replay.type === 'speed40' ? lang.get('Sprint 40L') : lang.get('Dig Race 18L');
         var date = Tools.formatTime(replay.date, 'yyyy-MM-dd hh:mm:ss');
         var replayId = replay._id;
         rows.push(
            <TableRow key={replay.date}>
               <TableCell>{type}</TableCell>
               <TableCell>{replay.time}</TableCell>
               <TableCell>{date}</TableCell>
               <TableCell>{
                  replayId ? <Button color="primary" size="small" onClick={this.onReplay(replayId)}>
                     {lang.get('Replay')}
                  </Button> : null}
               </TableCell>
            </TableRow>
         )
      }
      return (
         <div className={classes.replayDiv} >
            <Typography variant="headline" className={classes.title}>
               {lang.get('Last Games')}
            </Typography>
            <Table className={classes.table}>
               <TableHead >
                  <TableRow className={classes.row}>
                     <TableCell>{lang.get('Type')}</TableCell>
                     <TableCell>{lang.get('Time')}</TableCell>
                     <TableCell>{lang.get('Date')}</TableCell>
                     <TableCell>{lang.get('Replay')}</TableCell>
                  </TableRow>
               </TableHead>
               <TableBody>
                  {rows}
               </TableBody>
            </Table>
         </div>
      )
   }

   render() {
      const { classes } = this.props;
      var { user, replays } = this.state;
      if (!user) {
         return null;
      }
      var replayTable = null;
      if (replays) {
         replayTable = this.makeReplayTable(replays);
      }
      // console.log('profile', user);
      var speed40Times = user.speed40Times;
      var speed40Best = parseFloat(user.speed40Best);
      if (speed40Best) {
         if (speed40Best >= 999) {
            speed40Best = lang.get('None');
         } else {
            speed40Best = speed40Best.toFixed(2) + ' ' + lang.get('Secs');
         }
      }
      var dig18Times = user.dig18Times;
      var dig18Best = parseFloat(user.dig18Best);
      if (dig18Best) {
         if (dig18Best >= 999) {
            dig18Best = lang.get('None');
         } else {
            dig18Best = dig18Best.toFixed(2) + ' ' + lang.get('Secs');
         }
      }
      var maohao = lang.get(': ');
      var keyboard = user.keyboard;
      return (
         <div className={classes.root}>
            <div className={classes.main}>
               <div className={classes.userDiv} >
                  <Button
                     color="primary"
                     size="large"
                     variant="raised"
                     className={classes.button}
                     onClick={gameManager.app.home}
                  >
                     {lang.get('Return')}
                  </Button>
                  <Typography variant="headline" className={classes.title}>
                     {lang.get('PLAYER INFO')}
                  </Typography>
                  <Typography variant="subheading" className={classes.item}>
                     {lang.get('ID') + maohao + user.id}
                  </Typography>
                  <Typography variant="subheading" className={classes.item}>
                     {lang.get('Nickname') + maohao + user.nick}
                  </Typography>
                  <Typography variant="subheading" className={classes.item}>
                     {lang.get('Sign') + maohao + (user.sign || '')}
                  </Typography>
                  <Typography variant="subheading" className={classes.item}>
                     {lang.get('Last login') + maohao + (user.lastLogin ? Tools.formatTime(user.lastLogin, 'yyyy-MM-dd hh:mm:ss') : '')}
                  </Typography>
               </div>
               <div className={classes.keyboard} >
                  <Typography variant="headline" className={classes.title}>
                     {lang.get('Keyboard Setting')}
                  </Typography>
                  <div className={classes.keys}>
                     <Typography variant="subheading" className={classes.item}>
                        {lang.get('keyLeft') + maohao}<span className={classes.keyName} >{keyName[keyboard.left]}</span>
                     </Typography>
                     <Typography variant="subheading" className={classes.item}>
                        {lang.get('keyRight') + maohao}<span className={classes.keyName} >{keyName[keyboard.right]}</span>
                     </Typography>
                     <Typography variant="subheading" className={classes.item}>
                        {lang.get('keyDrop') + maohao}<span className={classes.keyName} >{keyName[keyboard.drop]}</span>
                     </Typography>
                     <Typography variant="subheading" className={classes.item}>
                        {lang.get('keyDown') + maohao}<span className={classes.keyName} >{keyName[keyboard.down]}</span>
                     </Typography>
                  </div>
                  <div className={classes.keys}>
                     <Typography variant="subheading" className={classes.item}>
                        {lang.get('keyRotate') + maohao}<span className={classes.keyName} >{keyName[keyboard.rotate]}</span>
                     </Typography>
                     <Typography variant="subheading" className={classes.item}>
                        {lang.get('keyRotateRight') + maohao}<span className={classes.keyName} >{keyName[keyboard.rotateRight]}</span>
                     </Typography>
                     <Typography variant="subheading" className={classes.item}>
                        {lang.get('keyRotate180') + maohao}<span className={classes.keyName} >{keyName[keyboard.rotate180]}</span>
                     </Typography>
                     <Typography variant="subheading" className={classes.item}>
                        {lang.get('keyRotateHold') + maohao}<span className={classes.keyName} >{keyName[keyboard.hold]}</span>
                     </Typography>
                  </div>
                  <div className={classes.keys}>
                     <Typography variant="subheading" className={classes.item}>
                        {lang.get('DAS') + maohao}<span className={classes.keyName} >{keyboard.dasDelay}</span>
                     </Typography>
                     <Typography variant="subheading" className={classes.item}>
                        {lang.get('Move Delay') + maohao}<span className={classes.keyName} >{keyboard.moveDelay}</span>
                     </Typography>
                     <Typography variant="subheading" className={classes.item}>
                        {lang.get('Soft Down Delay') + maohao}<span className={classes.keyName} >{keyboard.downDelay}</span>
                     </Typography>
                  </div>
               </div>
               <div className={classes.statsDiv} >
                  <Typography variant="headline" className={classes.title}>
                     {lang.get('GAME INFO')}
                  </Typography>
                  <Typography variant="subheading" className={classes.item}>
                     {lang.get('Sprint 40L times') + maohao + speed40Times}
                  </Typography>
                  <Typography variant="subheading" className={classes.item}>
                     {lang.get('Sprint 40L best') + maohao + speed40Best}
                     {user.s40r
                        ? <Button color="primary" size="small" onClick={this.onReplay(user.s40r)}>
                           {lang.get('Replay')}
                        </Button>
                        : null}
                  </Typography>
                  <Typography variant="subheading" className={classes.item}>
                     {lang.get('Dig Race 18L times') + maohao + dig18Times}
                  </Typography>
                  <Typography variant="subheading" className={classes.item}>
                     {lang.get('Dig Race 18L best') + maohao + dig18Best}
                     {user.d18r
                        ? <Button color="primary" size="small" onClick={this.onReplay(user.d18r)}>
                           {lang.get('Replay')}
                        </Button>
                        // ? <Button variant="fab" color="primary" mini title={lang.get('Replay')} aria-label="replay" onClick={this.onReplay(user.d18r)}>
                        //    <PlayIcon />
                        // </Button>
                        : null}
                  </Typography>
               </div>
               {replayTable}
            </div>
         </div>
      );
   }
}

Profile.propTypes = {
   classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Profile); 