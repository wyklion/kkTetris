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
   row: {
      height: '30px',
   },
   nothing: {
      color: '#ff4242'
   }
});

class Users extends React.Component {
   makeUsers() {
      const { classes } = this.props;
      var users = gameManager.users;
      var rows = [];
      for (var id in users) {
         var user = users[id];
         rows.push(
            <TableRow key={user.id} className={classes.row}>
               <TableCell>{user.id}</TableCell>
               <TableCell>{user.id}</TableCell>
            </TableRow>
         )
      }
      if (rows.length === 0) {
         rows.push(
            <TableRow key='nothing' className={classes.row}>
               <TableCell className={classes.nothing}>空无一人</TableCell>
            </TableRow>
         )
      }
      return rows;
   }

   render() {
      const { classes } = this.props;
      var users = this.makeUsers();
      return (
         <div className={classes.root}>
            <Paper className={classes.paper}>
               <Table className={classes.table}>
                  <TableHead >
                     <TableRow className={classes.row}>
                        <TableCell className={classes.headcell}>ID</TableCell>
                        <TableCell className={classes.headcell}>昵称</TableCell>
                     </TableRow>
                  </TableHead>
                  <TableBody>
                     {users}
                  </TableBody>
               </Table>

            </Paper>
         </div>
      )
   }
}

Users.propTypes = {
   classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Users);