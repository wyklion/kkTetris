import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import Typography from 'material-ui/Typography';
import Button from 'material-ui/Button';
// import Table, { TableBody, TableCell, TableHead, TableRow } from 'material-ui/Table';
// import PlayIcon from 'material-ui-icons/PlayArrow';
// import Checkbox from 'material-ui/Checkbox';

// import http from '../util/http.js';
import gameManager from '../game/GameManager.js';
import lang from '../util/lang';
// import keyName from '../util/keyName';
import Tools from '../util/Tools';

const styles = theme => ({
   root: {
      // width: '500px',
      // margin: '0 auto',
      height: '100%',
      overflow: 'auto',
   },
   title: {
      margin: '20px 0',
   },
});

class About extends React.Component {
   state = {
      user: null,
      replays: null,
   };

   componentDidMount() {
   }

   onReturnClick = () => {
      this.props.onReturn();
   }

   render() {
      const { classes } = this.props;
      var { user, replays } = this.state;
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
            <Typography variant="display4" className={classes.title}>
               I don't now what's about yet.
            </Typography>
            <Typography variant="display1" className={classes.title}>
               <p>Discord group: https://discord.gg/QTPUCGc</p>
               <p>QQ群: 761836300</p>
               <p>Ctrl+V is disabled... Use contextmenu to copy...</p>
            </Typography>
         </div>
      );
   }
}

About.propTypes = {
   classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(About); 