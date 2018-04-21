import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import Typography from 'material-ui/Typography';
import Button from 'material-ui/Button';
import Table, { TableBody, TableCell, TableHead, TableRow } from 'material-ui/Table';

import http from '../util/http.js';
import gameManager from '../game/GameManager.js';
import lang from '../util/lang';
import Tools from '../util/Tools';

const styles = theme => ({
   root: {
      width: '500px',
      margin: '0 auto',
   },
   // button: {
   //    left: '50%',
   //    width: '80px',
   //    marginLeft: '-40px',
   // },
   title: {
      margin: '20px 0',
   },
   row: {
      height: '30px',
   },
   nothing: {
      color: '#ff4242'
   }
});

class Rank extends React.Component {
   state = {
      type: 'speed40',
      rank: null,
   };

   componentDidMount() {
      http.get({ url: 'rank', data: { type: this.state.type } }, (err, result) => {
         if (err) {
            alert(err);
         } else {
            this.setState({ rank: result });
         }
      })
   }

   onReturnClick = () => {
      this.props.onReturn();
   }

   makeSpeedRows() {
      const { classes } = this.props;
      var rank = this.state.rank;
      var rows = [];
      for (var i = 0; i < rank.length; i++) {
         var record = rank[i];
         var best = parseFloat(record.speed40Best).toFixed(1);
         var date = record.date ? Tools.formatTime(record.date, 'yyyy-MM-DD hh:mm:ss') : '';
         rows.push(
            <TableRow key={record.id} className={classes.row}>
               <TableCell>{record.id}</TableCell>
               <TableCell>{record.nick}</TableCell>
               <TableCell>{date}</TableCell>
               <TableCell>{best}</TableCell>
            </TableRow>
         )
      }
      if (rows.length === 0) {
         rows.push(
            <TableRow key='nothing' className={classes.row}>
               <TableCell className={classes.nothing}>{lang.get('Nobody')}</TableCell>
            </TableRow>
         )
      }
      return rows;
   }

   makeDigRows() {
      const { classes } = this.props;
      var rank = this.state.rank;
      var rows = [];
      for (var i = 0; i < rank.length; i++) {
         var record = rank[i];
         var best = parseFloat(record.speed40Best).toFixed(1);
         var date = record.date ? Tools.formatTime(record.date, 'yyyy-MM-DD hh:mm:ss') : '';
         rows.push(
            <TableRow key={record.id} className={classes.row}>
               <TableCell>{record.id}</TableCell>
               <TableCell>{record.nick}</TableCell>
               <TableCell>{date}</TableCell>
               <TableCell>{best}</TableCell>
            </TableRow>
         )
      }
      if (rows.length === 0) {
         rows.push(
            <TableRow key='nothing' className={classes.row}>
               <TableCell className={classes.nothing}>{lang.get('Nobody')}</TableCell>
            </TableRow>
         )
      }
      return rows;
   }

   render() {
      const { classes } = this.props;
      const { rank } = this.state;
      if (!rank) {
         return null;
      }
      var rows = this.makeSpeedRows();
      // var digRows = this.makeDigRows();

      return (
         <div className={classes.root}>
            <Button
               color="primary"
               size="large"
               className={classes.button}
               onClick={this.onReturnClick}
            >
               {lang.get('Return')}
            </Button>
            <Typography variant="headline" className={classes.title}>
               {lang.get('Learderboard') + '(' + lang.get('Sprint 40L') + ')'}
            </Typography>
            <Table className={classes.table}>
               <TableHead >
                  <TableRow className={classes.row}>
                     <TableCell className={classes.headcell}>ID</TableCell>
                     <TableCell className={classes.headcell}>{lang.get('Nickname')}</TableCell>
                     <TableCell className={classes.headcell}>{lang.get('Time')}</TableCell>
                     <TableCell className={classes.headcell}>{lang.get('Date')}</TableCell>
                  </TableRow>
               </TableHead>
               <TableBody>
                  {rows}
               </TableBody>
            </Table>
            {/* <Typography variant="headline" className={classes.title}>
               {lang.get('Learderboard') + '(' + lang.get('Dig Race 18L') + ')'}
            </Typography>
            <Table className={classes.table}>
               <TableHead >
                  <TableRow className={classes.row}>
                     <TableCell className={classes.headcell}>ID</TableCell>
                     <TableCell className={classes.headcell}>{lang.get('Nickname')}</TableCell>
                     <TableCell className={classes.headcell}>{lang.get('Time')}</TableCell>
                     <TableCell className={classes.headcell}>{lang.get('Date')}</TableCell>
                  </TableRow>
               </TableHead>
               <TableBody>
                  {digRows}
               </TableBody>
            </Table> */}
         </div>
      );
   }
}

Rank.propTypes = {
   classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Rank); 