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

import socket from '../socket/GameSocket';
import gameManager from '../game/GameManager';
import lang from '../util/lang';

var keyName = {
   8: 'Backspace',
   9: 'Tab',
   13: 'Enter',
   16: 'Shift',
   17: 'Ctrl',
   18: 'Alt',
   19: 'Pause',
   20: 'Caps Lock',
   27: 'Esc',
   32: 'Space',
   33: 'PgUp',
   34: 'PgDn',
   35: 'End',
   36: 'Home',
   37: '←',
   38: '↑',
   39: '→',
   40: '↓',
   45: 'Insert',
   46: 'Delete',
   48: '0',
   49: '1',
   50: '2',
   51: '3',
   52: '4',
   53: '5',
   54: '6',
   55: '7',
   56: '8',
   57: '9',
   59: ';',
   61: '=',
   65: 'A',
   66: 'B',
   67: 'C',
   68: 'D',
   69: 'E',
   70: 'F',
   71: 'G',
   72: 'H',
   73: 'I',
   74: 'J',
   75: 'K',
   76: 'L',
   77: 'M',
   78: 'N',
   79: 'O',
   80: 'P',
   81: 'Q',
   82: 'R',
   83: 'S',
   84: 'T',
   85: 'U',
   86: 'V',
   87: 'W',
   88: 'X',
   89: 'Y',
   90: 'Z',
   96: '0kpad',
   97: '1kpad',
   98: '2kpad',
   99: '3kpad',
   100: '4kpad',
   101: '5kpad',
   102: '6kpad',
   103: '7kpad',
   104: '8kpad',
   105: '9kpad',
   106: '*',
   107: '+',
   109: '-',
   110: '.',
   111: '/',
   112: 'F1',
   113: 'F2',
   114: 'F3',
   115: 'F4',
   116: 'F5',
   117: 'F6',
   118: 'F7',
   119: 'F8',
   120: 'F9',
   121: 'F10',
   122: 'F11',
   123: 'F12',
   173: '-',
   187: '=',
   188: ',',
   190: '.',
   191: '/',
   192: '`',
   219: '[',
   220: '\\',
   221: ']',
   222: "'"
};

var keys = [
   { key: 'left', name: 'keyLeft' },
   { key: 'right', name: 'keyRight' },
   { key: 'drop', name: 'keyDrop' },
   { key: 'down', name: 'keyDown' },
   { key: 'rotate', name: 'keyRotate' },
   { key: 'rotateRight', name: 'keyRotateRight' },
   { key: 'rotate180', name: 'keyRotate180' },
   { key: 'hold', name: 'keyRotateHold' }
];

class KeyboardSetting extends React.Component {
   constructor(props) {
      super(props);
      this.open = false;
      this.initKeys();
      this.state = {
         settingKey: null,
         dasDelay: this.keyboard.dasDelay,
         moveDelay: this.keyboard.moveDelay,
         downDelay: this.keyboard.downDelay,
      }
   }

   componentWillUpdate(props) {
      if (props.open !== this.open) {
         if (props.open) {
            this.initKeys();
            this.setState({
               settingKey: null,
               dasDelay: this.keyboard.dasDelay,
               moveDelay: this.keyboard.moveDelay,
               downDelay: this.keyboard.downDelay,
            });
         }
         this.open = props.open;
      }
   }

   initKeys() {
      var keyboard = gameManager.user.keyboard;
      this.keyboard = {};
      for (var i = 0; i < keys.length; i++) {
         this.keyboard[keys[i].key] = keyboard[keys[i].key];
      }
      this.keyboard.dasDelay = keyboard.dasDelay;
      this.keyboard.moveDelay = keyboard.moveDelay;
      this.keyboard.downDelay = keyboard.downDelay;
   }

   handleClose = () => {
      this.props.close();
   };

   handleSave = () => {
      var dasDelay = parseInt(this.state.dasDelay);
      if (dasDelay < 10) dasDelay = 10; else if (dasDelay > 1000) dasDelay = 1000;
      this.keyboard.dasDelay = dasDelay;
      var moveDelay = parseInt(this.state.moveDelay);
      if (moveDelay < 0) moveDelay = 0; else if (moveDelay > 500) moveDelay = 500;
      this.keyboard.moveDelay = moveDelay;
      var downDelay = parseInt(this.state.downDelay);
      if (downDelay < 0) downDelay = 0; else if (downDelay > 500) downDelay = 500;
      this.keyboard.downDelay = downDelay;
      socket.setKeyboard(this.keyboard);
      this.props.close();
      gameManager.updateKeyboard();
   }

   onKeyDown = (event) => {
      var settingKey = this.state.settingKey;
      if (!this.props.open || !settingKey) {
         return;
      }
      // ESC
      if (event.keyCode === 27) {
         this.setState({ settingKey: null });
         return;
      }
      // console.log(event.keyCode);
      this.keyboard[settingKey] = event.keyCode;
      this.setState({ settingKey: null });
   }

   onClickKey = (key) => {
      return (event) => {
         this.setState({ settingKey: key });
      }
   }

   handleChange = name => event => {
      this.setState({
         [name]: event.target.value,
      });
   };

   makeKeyTable() {
      var keyboard = this.keyboard;
      var cells = [];
      for (var i = 0; i < keys.length; i++) {
         var key = keys[i].key;
         var code = keyboard[key];
         cells.push(
            <TableRow key={'row' + i}>
               <TableCell>{lang.get(keys[i].name)}</TableCell>
               <TableCell onClick={this.onClickKey(keys[i].key)}>{this.state.settingKey === key ? '' : keyName[code]}</TableCell>
            </TableRow>
         );
      }
      return (
         <Table style={{ width: '400px' }}>
            <TableHead>
               <TableRow>
                  <TableCell>{lang.get('Operation')}</TableCell>
                  <TableCell>{lang.get('Key')}</TableCell>
               </TableRow>
            </TableHead>
            <TableBody>
               {cells}
               <TableRow>
                  <TableCell>{lang.get('DAS') + '(10~999ms)'}</TableCell>
                  <TableCell>
                     <Input
                        inputProps={
                           {
                              min: 10,
                              max: 999
                           }
                        }
                        value={this.state.dasDelay}
                        onChange={this.handleChange('dasDelay')}
                        type="number"
                     />
                  </TableCell>
               </TableRow>
               <TableRow>
                  <TableCell>{lang.get('Move Delay' + '(0~500ms)')}</TableCell>
                  <TableCell>
                     <Input
                        inputProps={
                           {
                              min: 0,
                              max: 500
                           }
                        }
                        value={this.state.moveDelay}
                        onChange={this.handleChange('moveDelay')}
                        type="number"
                     />
                  </TableCell>
               </TableRow>
               <TableRow>
                  <TableCell>{lang.get('Soft Down Delay' + '(0~500ms)')}</TableCell>
                  <TableCell>
                     <Input
                        inputProps={
                           {
                              min: 0,
                              max: 500
                           }
                        }
                        value={this.state.downDelay}
                        onChange={this.handleChange('downDelay')}
                        type="number"
                     />
                  </TableCell>
               </TableRow>
            </TableBody>
         </Table>
      )
   }

   render() {
      // const { classes } = this.props;
      var keyTable = this.makeKeyTable();

      return (
         <Dialog
            disableEscapeKeyDown
            open={this.props.open}
            onClose={this.handleClose}
            aria-labelledby="form-dialog-title"
            onKeyDown={this.onKeyDown}
         >
            <DialogTitle id="form-dialog-title">{lang.get('Keyboard Setting')}</DialogTitle>
            <DialogContent>
               {keyTable}
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

export default KeyboardSetting;