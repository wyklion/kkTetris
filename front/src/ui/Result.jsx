import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import Paper from 'material-ui/Paper';
import Fade from 'material-ui/transitions/Fade';
import Typography from 'material-ui/Typography';
import gameManager from '../game/GameManager';
import lang from '../util/lang';

const styles = theme => ({
   root: {
      width: '100%',
      height: '100%',
      userSelect: 'none',
   },
   paper: {
      width: '100%',
      height: '100%',
      display: 'flex',
      backgroundColor: 'rgba(90,90,90,0.8)',
   },
   content: {
      margin: 'auto',
   },
   title: {
      padding: '15px',
      color: '#00acc1',
      fontSize: '30px',
      fontFamily: 'Arial Bold',
      fontWeight: 'bolder',
      marginBottom: '20px',
   },
   best: {
      fontSize: '20px',
      color: '#ffee58',
      fontFamily: 'Arial Bold',
      fontWeight: 'bolder',
   },
   item: {
      fontSize: '28px',
      color: '#f4511e',
      fontFamily: 'Arial Bold',
      fontWeight: 'bolder',
   },
   loseItem: {
      fontSize: '28px',
      color: '#111111',
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
         <Paper className={classes.paper} elevation={4}>
            <div className={classes.content}>
               <Typography variant="display1" gutterBottom className={classes.title}>
                  {lang.get('Game Over')}
               </Typography>
               <Typography component="p" gutterBottom className={classes.loseItem}>
                  {lang.get('Time') + ':' + data.time.toFixed(1)}
               </Typography>
               <Typography component="p" gutterBottom className={classes.loseItem}>
                  {lang.get('Speed') + ':' + (data.count / data.time).toFixed(2)}
               </Typography>
               <Typography component="p" gutterBottom className={classes.loseItem}>
                  {lang.get('Pieces') + ':' + data.count}
               </Typography>
               <Typography component="p" gutterBottom className={classes.loseItem}>
                  {lang.get('Lines') + ':' + data.lines}
               </Typography>
            </div>
         </Paper>
      )
   }

   /**
    * 竞速结果
    */
   makeSpeedResult(data) {
      if (!data.win) {
         return this.makeLoseResult(data);
      }
      var classes = this.props.classes;
      var title = lang.get('Sprint 40L');
      var best = gameManager.user.speed40Best;
      if (data.time < best) {
         best = data.time;
      }
      return (
         <Paper className={classes.paper} elevation={4}>
            <div className={classes.content}>
               <Typography variant="display1" gutterBottom className={classes.title}>
                  {title}
               </Typography>
               <Typography component="p" gutterBottom className={classes.best}>
                  {lang.get('Personal Best') + ':' + best.toFixed(1)}
               </Typography>
               <Typography component="p" gutterBottom className={classes.item}>
                  {lang.get('Time') + ':' + data.time.toFixed(2)}
               </Typography>
               <Typography component="p" gutterBottom className={classes.item}>
                  {lang.get('Speed') + ':' + (data.count / data.time).toFixed(2)}
               </Typography>
            </div>
         </Paper>
      )
   }

   /**
    * 挖掘结果
    */
   makeDigResult(data) {
      if (!data.win) {
         return this.makeLoseResult(data);
      }
      var classes = this.props.classes;
      var title = '';
      var best = 1000;
      if (data.lineCount === 18) {
         title = lang.get('Dig Race 18L');
         best = gameManager.user.dig18Best;
         if (data.time < best) {
            best = data.time;
         }
      }
      return (
         <Paper className={classes.paper} elevation={4}>
            <div className={classes.content}>
               <Typography variant="display1" gutterBottom className={classes.title}>
                  {title}
               </Typography>
               <Typography component="p" gutterBottom className={classes.best}>
                  {lang.get('Personal Best') + ':' + best.toFixed(2)}
               </Typography>
               <Typography component="p" gutterBottom className={classes.item}>
                  {lang.get('Time') + ':' + data.time.toFixed(2)}
               </Typography>
               <Typography component="p" gutterBottom className={classes.item}>
                  {lang.get('Speed') + ':' + (data.count / data.time).toFixed(2)}
               </Typography>
               <Typography component="p" gutterBottom className={classes.item}>
                  {lang.get('Pieces') + ':' + data.count}
               </Typography>
            </div>
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
         case 'dig':
            result = this.makeDigResult(data);
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