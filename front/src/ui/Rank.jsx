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
      height: '100%',
      maxWidth: '700px',
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
   tableDiv: {
      height: 'calc(100% - 200px)',
      overflowY: 'auto',
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
      rank: null,
   };

   componentDidMount() {
      this.getRankData(this.props.rankType);
   }

   componentWillUpdate(nextProps) {
      if (nextProps.rankType === this.props.rankType) {
         return;
      }
      this.getRankData(nextProps.rankType);
   }

   getRankData(rankType) {
      http.get({ url: 'rank', data: { type: rankType } }, (err, result) => {
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
      const { classes, rankType } = this.props;
      var rank = this.state.rank;
      var rows = [];
      for (var i = 0; i < rank.length; i++) {
         var record = rank[i];
         var best = parseFloat(record.speed40Best).toFixed(1);
         var date = record.speed40Date ? Tools.formatTime(record.speed40Date, 'yyyy-MM-dd hh:mm:ss') : '';
         rows.push(
            <TableRow key={rankType + record.id} className={classes.row}>
               <TableCell>{i + 1}</TableCell>
               <TableCell>{record.id}</TableCell>
               <TableCell>{record.nick}</TableCell>
               <TableCell>{best}</TableCell>
               <TableCell>{date}</TableCell>
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
      const { classes, rankType } = this.props;
      var rank = this.state.rank;
      var rows = [];
      for (var i = 0; i < rank.length; i++) {
         var record = rank[i];
         var best = parseFloat(record.dig18Best).toFixed(1);
         var date = record.dig18Date ? Tools.formatTime(record.dig18Date, 'yyyy-MM-dd hh:mm:ss') : '';
         rows.push(
            <TableRow key={rankType + record.id} className={classes.row}>
               <TableCell>{i + 1}</TableCell>
               <TableCell>{record.id}</TableCell>
               <TableCell>{record.nick}</TableCell>
               <TableCell>{best}</TableCell>
               <TableCell>{date}</TableCell>
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
      const { classes, rankType } = this.props;
      const { rank } = this.state;
      if (!rank) {
         return null;
      }
      var rows;
      var title;
      if (rankType === 'speed40') {
         rows = this.makeSpeedRows();
         title = lang.get('Sprint 40L');
      } else if (rankType === 'dig18') {
         rows = this.makeDigRows();
         title = lang.get('Dig Race 18L');
      }

      return (
         <div className={classes.root}>
            <Button
               color="primary"
               size="large"
               variant="raised"
               className={classes.button}
               onClick={this.onReturnClick}
            >
               {lang.get('Return')}
            </Button>
            <Typography variant="headline" className={classes.title}>
               {lang.get('Learderboard') + '(' + title + ')'}
            </Typography>
            <div className={classes.tableDiv}>
               <Table className={classes.table}>
                  <TableHead >
                     <TableRow className={classes.row}>
                        <TableCell className={classes.headcell}>{lang.get('Place')}</TableCell>
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
            </div>
         </div>
      );
   }
}

Rank.propTypes = {
   classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Rank); 