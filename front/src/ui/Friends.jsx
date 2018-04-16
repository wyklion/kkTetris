import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import Typography from 'material-ui/Typography';
import Paper from 'material-ui/Paper';
import Button from 'material-ui/Button';
import Table, { TableBody, TableCell, TableHead, TableRow } from 'material-ui/Table';

import TextField from 'material-ui/TextField';
import Dialog, {
   DialogActions,
   DialogContent,
   DialogContentText,
   DialogTitle,
} from 'material-ui/Dialog';

import gameManager from '../game/GameManager';
import socket from '../socket/GameSocket';
import config from '../config';

const styles = theme => ({
   root: {
   },
   button: {
      display: 'block',
      margin: '0 10px',
   },
   infoButton: {
   },
   row: {
      height: '30px',
   },
   nothing: {
      color: '#ff4242'
   }
});

class Friends extends React.Component {
   state = {
      showAdd: false,
      addFriendId: '',
   }
   componentDidMount() {
      gameManager.userManager.updateUsersListeners.add(this.onUpdate);
   }
   componentWillUnmount() {
      gameManager.userManager.updateUsersListeners.remove(this.onUpdate);
   }
   onUpdate = () => {
      this.forceUpdate();
   }
   makeUsers() {
      const { classes } = this.props;
      var friends = gameManager.userManager.friends;
      var rows = [];
      for (var id in friends) {
         var friend = friends[id];
         rows.push(
            <TableRow key={friend.id} className={classes.row}>
               <TableCell>{friend.id}</TableCell>
               <TableCell>{friend.nick}</TableCell>
               <TableCell>
                  <Button color="primary" size="small" className={classes.infoButton} onClick={this.onFriendInfo(id)}>
                     信息
                  </Button>
                  <Button color="primary" size="small" className={classes.infoButton} onClick={this.onRemoveFriend(id)}>
                     删除
                  </Button>
               </TableCell>
            </TableRow>
         )
      }
      if (rows.length === 0) {
         rows.push(
            <TableRow key='nothing' className={classes.row}>
               <TableCell className={classes.nothing}>没朋友</TableCell>
            </TableRow>
         )
      }
      return rows;
   }

   handleChange = name => event => {
      this.setState({
         [name]: event.target.value,
      });
   };

   onAddFriendClick = () => {
      this.setState({ showAdd: true, addFriendId: '' });
   }

   handleCloseAdd = () => {
      this.setState({ showAdd: false });
   }

   onKeyDown = (event) => {
      // 回车
      if (event.keyCode === 13) {
         this.onAddFriend();
         event.preventDefault();
         event.stopPropagation();
      }
   }

   onAddFriend = () => {
      var friendId = this.state.addFriendId;
      if (friendId === '') {
         alert('请输入好友帐号！')
      } else {
         socket.addFriend(this.state.addFriendId, (err, friend) => {
            if (err) {
               alert(err);
            } else {
               this.handleCloseAdd();
               if (friend) {
                  console.log('加好友成功:', friend);
               } else {
                  console.log('互补好友成功:');
               }
            }
         });
      }
   }
   onRemoveFriend(friendId) {
      return () => {
         socket.removeFriend(friendId, (err, result) => {
            if (err) {
               alert(err);
            } else {
               console.log('删除好友成功:', friendId);
            }
         });
      }
   }
   onFriendInfo(friendId) {
      return () => {
         gameManager.app.onProfile(friendId);
      }
   }

   render() {
      const { classes } = this.props;
      const { showAdd, addFriendId } = this.state;
      var users = this.makeUsers();
      return (
         <div className={classes.root}>
            <Button variant="raised" color="primary" size="small" className={classes.button} onClick={this.onAddFriendClick}>
               加好友
            </Button>
            <Paper className={classes.paper}>
               <Table className={classes.table}>
                  <TableHead >
                     <TableRow className={classes.row}>
                        <TableCell className={classes.headcell}>ID</TableCell>
                        <TableCell className={classes.headcell}>昵称</TableCell>
                        <TableCell className={classes.headcell}>操作</TableCell>
                     </TableRow>
                  </TableHead>
                  <TableBody>
                     {users}
                  </TableBody>
               </Table>
            </Paper>
            <Dialog
               open={showAdd}
               onClose={this.handleCloseAdd}
               disableBackdropClick={true}
               disableEscapeKeyDown={true}
               aria-labelledby="form-dialog-title"
            >
               <DialogTitle id="form-dialog-title" style={{ width: '400px' }}>加好友</DialogTitle>
               <DialogContent>
                  {/* <DialogContentText>
                     请输入好友帐号
                  </DialogContentText> */}
                  <TextField
                     autoFocus
                     margin="dense"
                     id="name"
                     label="好友帐号"
                     value={addFriendId}
                     onChange={this.handleChange('addFriendId')}
                     type="email"
                     fullWidth
                     onKeyDown={this.onKeyDown}
                  />
               </DialogContent>
               <DialogActions>
                  <Button onClick={this.handleCloseAdd} color="primary">
                     取消
                  </Button>
                  <Button onClick={this.onAddFriend} color="primary">
                     加好友
                  </Button>
               </DialogActions>
            </Dialog>
         </div>
      )
   }
}

Friends.propTypes = {
   classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Friends);