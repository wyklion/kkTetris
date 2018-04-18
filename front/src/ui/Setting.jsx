import React from 'react';
// import Typography from 'material-ui/Typography';
import Button from 'material-ui/Button';
// import TextField from 'material-ui/TextField';
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

import socket from '../socket/GameSocket';
import gameManager from '../game/GameManager';
import lang from '../util/lang';


class Setting extends React.Component {
   constructor(props) {
      super(props);
      this.open = false;
      this.state = {
         sound: true,
      }
   }

   componentWillMount() {
      this.state.sound = gameManager.soundManager.soundOn;
   }

   handleClose = () => {
      this.props.close();
   };

   handleSave = () => {
      var setting = {
         sound: this.state.sound,
      }
      gameManager.setting(setting);
      this.props.close();
   }

   handleChange = name => event => {
      this.setState({
         [name]: event.target.checked,
      });
   };

   render() {
      return (
         <Dialog
            disableEscapeKeyDown
            open={this.props.open}
            onClose={this.handleClose}
            aria-labelledby="form-dialog-title"
            onKeyDown={this.onKeyDown}
         >
            <DialogTitle id="form-dialog-title">{lang.get('Setting')}</DialogTitle>
            <DialogContent style={{ width: 300, height: 200 }}>
               <Typography variant="subheading" style={{ float: 'left', lineHeight: '48px' }}>
                  {lang.get('Sound')}
               </Typography>
               <Switch
                  checked={this.state.sound}
                  onChange={this.handleChange('sound')}
                  value='sound'
                  color="primary"
               />
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

export default Setting;