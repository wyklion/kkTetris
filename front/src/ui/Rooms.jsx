import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import Typography from 'material-ui/Typography';
import Paper from 'material-ui/Paper';
import Button from 'material-ui/Button';
import Table, { TableBody, TableCell, TableHead, TableRow } from 'material-ui/Table';

import gameManager from '../game/GameManager';
import config from '../config';

const styles = theme => ({
   root: {
   },
   button: {
      display: 'block',
      margin: '0 10px',
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
      gameManager.updateRoomsListeners.add(this.onUpdateRooms);
   }
   componentWillUnmount() {
      gameManager.updateRoomsListeners.remove(this.onUpdateRooms);
   }
   onUpdateRooms = () => {
      console.log("Rooms.jsx update rooms...");
      this.forceUpdate();
   }
   onCreateClick = () => {
      gameManager.createRoom();
   }

   onEnterClick = (roomId) => {
      return () => {
         console.log("enter room", roomId);
      }
   }

   onWatchClick = (roomId) => {
      return () => {
         console.log("watch room", roomId);
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
         if (room.playUsers.length === 1) {
            playerStr = room.playUsers[0] + " 等待中……";
            // 不在房间才能进入
            if (!gameManager.room) {
               button = (
                  <Button variant="raised" color="primary" size="small" className={classes.button} onClick={this.onEnterClick}>
                     加入
               </Button>
               )
            }
         } else {
            playerStr = room.playUsers[0] + " 对战 " + room.playUsers[1];
            // 不在房间才能进入
            if (!gameManager.room) {
               button = (
                  <Button variant="raised" color="primary" size="small" className={classes.button} onClick={this.onWatchClick}>
                     观战
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
               <TableCell className={classes.nothing}>空无一房</TableCell>
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
               创建房间
            </Button>
            <Paper className={classes.paper}>
               <Table className={classes.table}>
                  <TableHead >
                     <TableRow className={classes.row}>
                        <TableCell className={classes.headcell}>房间ID</TableCell>
                        <TableCell className={classes.headcell}>玩家</TableCell>
                        <TableCell className={classes.headcell}>操作</TableCell>
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