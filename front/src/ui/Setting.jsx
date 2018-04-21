import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import Button from 'material-ui/Button';
import Input from 'material-ui/Input';
import Dialog, {
   DialogActions,
   DialogContent,
   // DialogContentText,
   DialogTitle,
} from 'material-ui/Dialog';
// import Divider from 'material-ui/Divider';
import Table, { TableBody, TableCell, TableHead, TableRow } from 'material-ui/Table';
import Switch from 'material-ui/Switch';
import Typography from 'material-ui/Typography';
import Radio, { RadioGroup } from 'material-ui/Radio';
import { FormLabel, FormControl, FormControlLabel, FormHelperText } from 'material-ui/Form';

import socket from '../socket/GameSocket';
import gameManager from '../game/GameManager';
import lang from '../util/lang';

// import c1 from "%PUBLIC_URL%/cell1.png"
// import c2 from "%PUBLIC_URL%/cell2.png"

const styles = theme => ({
   root: {
      display: 'flex',
   },
   formControl: {
      margin: theme.spacing.unit * 3,
   },
   soundGroup: {
      display: 'inline',
      marginLeft: '5px',
   },
   picGroup: {
      marginLeft: '1px',
   },
   picItem: {
      display: 'block',
      marginTop: '8px',
      marginBottom: '16px'
   },
   radio: {
      verticalAlign: 'middle',
   }
});

class Setting extends React.Component {
   constructor(props) {
      super(props);
      this.open = false;
      this.state = {
         sound: '1',
         pic: '1',
      }
   }

   componentWillMount() {
      // this.state.sound = gameManager.soundManager.idx + '';
      this.state.sound = gameManager.soundManager.soundOn;
      this.state.pic = gameManager.textureManager.idx + '';
   }

   handleClose = () => {
      this.props.close();
   };

   handleSave = () => {
      var setting = {
         // sound: parseInt(this.state.sound),
         sound: this.state.sound ? 1 : 0,
         pic: parseInt(this.state.pic)
      }
      gameManager.setting(setting);
      this.props.close();
   }

   handleCheckChange = name => event => {
      this.setState({
         [name]: event.target.checked,
      });
   };

   handleChange = name => event => {
      this.setState({
         [name]: event.target.value,
      });
   };

   render() {
      const { classes } = this.props;
      var pubUrl = process.env.PUBLIC_URL;
      return (
         <Dialog
            disableEscapeKeyDown
            open={this.props.open}
            onClose={this.handleClose}
            aria-labelledby="form-dialog-title"
            onKeyDown={this.onKeyDown}
         >
            <DialogTitle id="form-dialog-title">{lang.get('Setting')}</DialogTitle>
            <DialogContent style={{ width: 400, height: 360 }}>
               <div>
                  <Typography variant="subheading" style={{ float: 'left', lineHeight: '48px', width: '37px' }}>
                     {lang.get('Sound')}
                  </Typography>
                  <Switch
                     checked={this.state.sound}
                     onChange={this.handleCheckChange('sound')}
                     value='sound'
                     color="primary"
                  />
                  {/* <RadioGroup
                     aria-label="sound"
                     name="sound"
                     className={classes.soundGroup}
                     value={this.state.sound}
                     onChange={this.handleChange('sound')}
                  >
                     <FormControlLabel value="0" control={<Radio color="primary" />} label={lang.get('None')} />
                     <FormControlLabel value="1" control={<Radio color="primary" />} label={lang.get('Type1')} />
                     <FormControlLabel value="2" control={<Radio color="primary" />} label={lang.get('Type2')} />
                  </RadioGroup> */}
               </div>
               <div style={{ width: 100, float: 'left' }}>
                  <Typography variant="subheading" style={{ float: 'left', lineHeight: '48px', width: '37px' }}>
                     {lang.get('Style')}
                  </Typography>
                  <RadioGroup
                     aria-label="pic"
                     name="pic"
                     value={this.state.pic}
                     className={classes.picGroup}
                     onChange={this.handleChange('pic')}
                  >
                     <Radio className={classes.radio} color="primary" value='0' label={lang.get('Solid Color')} />
                     <Radio className={classes.radio} color="primary" value='1' />
                     <Radio className={classes.radio} color="primary" value='2' />
                     <Radio className={classes.radio} color="primary" value='3' />
                     <Radio className={classes.radio} color="primary" value='4' />
                     <Radio className={classes.radio} color="primary" value='5' />
                  </RadioGroup>
               </div>
               <div>
                  <Typography variant="body1" style={{ lineHeight: '48px' }}>
                     {lang.get('Solid Color')}
                  </Typography>
                  <img src={pubUrl + '/cell1.png'} width={288} height={32} className={classes.picItem} />
                  <img src={pubUrl + '/cell2.png'} width={288} height={32} className={classes.picItem} />
                  <img src={pubUrl + '/cell3.png'} width={288} height={32} className={classes.picItem} />
                  <img src={pubUrl + '/cell4.png'} width={288} height={32} className={classes.picItem} />
                  <img src={pubUrl + '/cell5.png'} width={288} height={32} className={classes.picItem} />
               </div>
            </DialogContent>
            <DialogActions>
               <Button onClick={this.handleClose} color="primary">
                  {lang.get('Cancel')}
               </Button>
               <Button onClick={this.handleSave} color="primary">
                  {lang.get('Save')}
               </Button>
            </DialogActions>
         </Dialog>
      );
   }
}

Setting.propTypes = {
   classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Setting);