import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import Typography from 'material-ui/Typography';
import Button from 'material-ui/Button';
// import Checkbox from 'material-ui/Checkbox';

import http from '../util/http.js';
import gameManager from '../game/GameManager.js';
import lang from '../util/lang';

const styles = theme => ({
   root: {
      width: '500px',
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
      height: '200px',
   },
   statsDiv: {
      height: '300px',
      textAlign: 'left',
   }
});

class Profile extends React.Component {
   state = {
      user: null,
   };

   componentDidMount() {
      http.get({ url: 'userInfo', data: { id: this.props.userId } }, (err, result) => {
         if (err) {
            alert(err);
         } else {
            this.setState({ user: result });
         }
      })
   }

   onReturnClick = () => {
      this.props.onReturn();
   }

   render() {
      const { classes } = this.props;
      var { user } = this.state;
      if (!user) {
         return null;
      }
      var speed40Times = user.speed40Times;
      var speed40Best = parseFloat(user.speed40Best);
      if (speed40Best) {
         if (speed40Best >= 999) {
            speed40Best = lang.get('None');
         } else {
            speed40Best = speed40Best.toFixed(1) + lang.get('Secs');
         }
      }
      var maohao = lang.get(': ');
      return (
         <div className={classes.root}>
            <div className={classes.userDiv} >
               <Button
                  color="primary"
                  size="large"
                  className={classes.button}
                  onClick={this.onReturnClick}
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
               </Typography>
            </div>
         </div>
      );
   }
}

Profile.propTypes = {
   classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Profile); 