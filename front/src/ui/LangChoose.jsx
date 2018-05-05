import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import Button from 'material-ui/Button';
// import Input from 'material-ui/Input';
import Dialog, {
   // DialogActions,
   DialogContent,
   // DialogContentText,
   DialogTitle,
} from 'material-ui/Dialog';
// import Divider from 'material-ui/Divider';
// import Typography from 'material-ui/Typography';
// import { FormLabel, FormControl, FormControlLabel, FormHelperText } from 'material-ui/Form';

import gameManager from '../game/GameManager';
import lang from '../util/lang';

// import c1 from "%PUBLIC_URL%/cell1.png"
// import c2 from "%PUBLIC_URL%/cell2.png"

const styles = theme => ({
   root: {
      display: 'flex',
   },
   langDiv: {
      padding: '20px 40px'
   },
   right: {
      float: 'right',
   }
});

class LangChoose extends React.Component {
   choose(langIdx) {
      return () => {
         gameManager.changeLang(langIdx);
         this.props.close();
      }
   }

   render() {
      const { classes } = this.props;
      return (
         <Dialog
            disableEscapeKeyDown
            open={this.props.open}
            onClose={this.props.close}
            aria-labelledby="form-dialog-title"
            onKeyDown={this.onKeyDown}
         >
            <DialogTitle id="form-dialog-title">{lang.get('Choose Language')}</DialogTitle>
            <DialogContent style={{ width: 300, height: 100 }}>
               <div className={classes.langDiv}>
                  <Button variant="raised" onClick={this.choose(0)} color="primary">
                     中文
                  </Button>
                  <Button variant="raised" onClick={this.choose(1)} color="primary" className={classes.right} >
                     English
                  </Button>
               </div>
            </DialogContent>
         </Dialog>
      );
   }
}

LangChoose.propTypes = {
   classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(LangChoose);