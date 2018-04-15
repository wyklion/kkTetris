import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import Paper from 'material-ui/Paper';
import Fade from 'material-ui/transitions/Fade';
import Typography from 'material-ui/Typography';
import gameManager from '../game/GameManager';

const styles = theme => ({
   root: {
      width: '100%',
      height: '100%',
   },
   paper: {
      background: 'rgba(255, 255, 255, 0.8)',
      margin: theme.spacing.unit,
   },
   title: {
      padding: '15px',
      color: '#4e6bd8',
      fontSize: '20px',
      fontFamily: 'Arial Bold',
      fontWeight: 'bolder',
   },
   best: {
      fontSize: '28px',
      color: '#f3ad53',
      fontFamily: 'Arial Bold',
      fontWeight: 'bolder',
   },
   item: {
      fontSize: '28px',
      color: '#777777',
      fontFamily: 'Arial Bold',
      fontWeight: 'bolder',
   },
   loseItem: {
      fontSize: '20px',
      color: '#777777',
      fontFamily: 'Arial Bold',
      fontWeight: 'bolder',
   }
});

class Result extends React.Component {
   state = {
      checked: false,
   };

   handleChange = () => {
      this.setState({ checked: !this.state.checked });
   };

   makeLoseResult(data) {
      var classes = this.props.classes;
      return (
         <Paper className={classes.root} elevation={4}>
            <Typography variant="display1" gutterBottom className={classes.title}>
               游戏结束
            </Typography>
            <Typography component="p" gutterBottom className={classes.loseItem}>
               时间：{data.time.toFixed(1)}
            </Typography>
            <Typography component="p" gutterBottom className={classes.loseItem}>
               速度：{(data.count / data.time).toFixed(1)}
            </Typography>
            <Typography component="p" gutterBottom className={classes.loseItem}>
               块数：{data.count}
            </Typography>
            <Typography component="p" gutterBottom className={classes.loseItem}>
               消行：{data.lines}
            </Typography>
         </Paper>
      )
   }

   makeSpeedResult(data) {
      if (!data.win) {
         return this.makeLoseResult(data);
      }
      var classes = this.props.classes;
      var title = '竞速40行';
      var best = gameManager.user.speed40Best;
      if (data.time < best) {
         best = data.time;
      }
      return (
         <Paper className={classes.root} elevation={4}>
            <Typography variant="display1" gutterBottom className={classes.title}>
               {title}
            </Typography>
            <Typography component="p" gutterBottom className={classes.best}>
               最佳记录：{best.toFixed(1)}
            </Typography>
            <Typography component="p" gutterBottom className={classes.item}>
               时间：{data.time.toFixed(1)}
            </Typography>
            <Typography component="p" gutterBottom className={classes.item}>
               速度：{(data.count / data.time).toFixed(1)}
            </Typography>
         </Paper>
      )
   }

   makeResult(data) {
      if (!data) {
         return <div />;
      }
      var result;
      switch (data.gameType) {
         case 'speed':
            result = this.makeSpeedResult(data);
            break;
         default:
            break;
      }
      return result;
   }

   render() {
      const { classes, show, data } = this.props;
      var result = this.makeResult(data);
      return (
         <div className={classes.root}>
            <Fade in={show}>
               {result}
            </Fade>
         </div>
      );
   }
}

Result.propTypes = {
   classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Result);