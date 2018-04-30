import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
// import Typography from 'material-ui/Typography';
import Paper from 'material-ui/Paper';
import Button from 'material-ui/Button';
import Table, { TableBody, TableCell, TableHead, TableRow } from 'material-ui/Table';

import gameManager from '../game/GameManager';
// import config from '../config';
import lang from '../util/lang';

const styles = theme => ({
   root: {
      height: '100%',
   },
   button: {
      display: 'block',
      margin: '0 10px',
   },
   paper: {
      height: 'calc(100% - 32px)',
      margin: '0 1px',
      overflow: 'auto',
   },
   row: {
      height: '30px',
   },
   buttoncell: {
      padding: 0
   },
   nothing: {
      color: '#ff4242'
   }
});

class Rooms extends React.Component {
   componentDidMount() {
      gameManager.roomManager.updateRoomsListeners.add(this.onUpdateRooms);
   }
   componentWillUnmount() {
      gameManager.roomManager.updateRoomsListeners.remove(this.onUpdateRooms);
   }
   onUpdateRooms = () => {
      this.forceUpdate();
   }
   onCreateClick = () => {
      // 线上不放开
      // gameManager.createRoom();
   }

   onEnterClick = (roomId) => {
      return () => {
         gameManager.joinRoom(roomId, false);
      }
   }

   onWatchClick = (roomId) => {
      return () => {
         gameManager.joinRoom(roomId, true);
      }
   }

   makeRooms() {
      const { classes } = this.props;
      var rooms = gameManager.rooms;
      var rows = [];
      for (var i in rooms) {
         var room = rooms[i];
         var playerStr = '';
         var button;
         if (room.players.length === 1) {
            playerStr = room.players[0] + " " + lang.get('Waiting') + "……";
            // 不在房间才能进入
            if (!gameManager.roomManager.isUserInRoom(gameManager.userId, room.id)) {
               button = (
                  <Button variant="raised" color="primary" size="small" className={classes.button} onClick={this.onEnterClick(room.id)}>
                     {lang.get('Join')}
                  </Button>
               )
            }
         } else {
            playerStr = room.players[0] + " 对战 " + room.players[1];
            // 不在房间才能进入
            if (!gameManager.roomManager.isUserInRoom(gameManager.userId, room.id)) {
               button = (
                  <Button variant="raised" color="primary" size="small" className={classes.button} onClick={this.onWatchClick(room.id)}>
                     {lang.get('Watch')}
                  </Button>
               )
            }
         }
         rows.push(
            <TableRow key={room.id} className={classes.row}>
               <TableCell> {room.id}</TableCell>
               <TableCell>{playerStr}</TableCell>
               <TableCell className={classes.buttoncell}>
                  {button}
               </TableCell>
            </TableRow>
         )
      }
      if (rows.length === 0) {
         rows.push(
            <TableRow key='nothing' className={classes.row}>
               <TableCell className={classes.nothing}>{lang.get('No Rooms')}</TableCell>
            </TableRow>
         )
      }
      return rows;
   }

   render() {
      const { classes } = this.props;
      var rooms = this.makeRooms();
      return (
         <div className={classes.root}>
            <Button variant="raised" color="primary" size="small" className={classes.button} onClick={this.onCreateClick}>
               {lang.get('Create Room')}
            </Button>
            <Paper className={classes.paper}>
               <Table className={classes.table}>
                  <TableHead >
                     <TableRow className={classes.row}>
                        <TableCell className={classes.headcell}> {lang.get('RoomId')}</TableCell>
                        <TableCell className={classes.headcell}>{lang.get('Players')}</TableCell>
                        <TableCell className={classes.headcell}>{lang.get('Operation')}</TableCell>
                     </TableRow>
                  </TableHead>
                  <TableBody>
                     {rooms}
                  </TableBody>
               </Table>

            </Paper>
         </div>
      )
   }
}

Rooms.propTypes = {
   classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Rooms);