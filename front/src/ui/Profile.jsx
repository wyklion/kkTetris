import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import Typography from 'material-ui/Typography';
import Button from 'material-ui/Button';
// import Checkbox from 'material-ui/Checkbox';

import http from '../util/http.js';
import gameManager from '../game/GameManager.js';

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
            speed40Best = '无';
         } else {
            speed40Best = speed40Best.toFixed(1) + '秒';
         }
      }
      return (
         <div className={classes.root}>
            <div className={classes.userDiv} >
               <Button
                  color="primary"
                  size="large"
                  className={classes.button}
                  onClick={this.onReturnClick}
               >
                  返回
               </Button>
               <Typography variant="headline" color="inherit" className={classes.title}>
                  玩家信息
               </Typography>
               <Typography variant="subheading" color="inherit" className={classes.item}>
                  帐号： {user.id}
               </Typography>
               <Typography variant="subheading" color="inherit" className={classes.item}>
                  昵称： {user.nick}
               </Typography>
               <Typography variant="subheading" color="inherit" className={classes.item}>
                  签名： {user.sign}
               </Typography>
            </div>
            <div className={classes.statsDiv} >
               <Typography variant="headline" color="inherit" className={classes.title}>
                  游戏信息
               </Typography>
               <Typography variant="subheading" color="inherit" className={classes.item}>
                  竞速40行次数： {speed40Times}
               </Typography>
               <Typography variant="subheading" color="inherit" className={classes.item}>
                  竞速40行最佳： {speed40Best}
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