import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import Typography from 'material-ui/Typography';
import Button from 'material-ui/Button';
import TextField from 'material-ui/TextField';
import Input from 'material-ui/Input';
import Dialog, {
   DialogActions,
   DialogContent,
   DialogContentText,
   DialogTitle,
} from 'material-ui/Dialog';
import Divider from 'material-ui/Divider';
import Table, { TableBody, TableCell, TableHead, TableRow } from 'material-ui/Table';

import UserManager from '../UserManager';

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
   { key: 'left', name: '左移' },
   { key: 'right', name: '右移' },
   { key: 'drop', name: '硬降' },
   { key: 'down', name: '软降' },
   { key: 'rotate', name: '逆旋' },
   { key: 'rotateRight', name: '顺旋' },
   { key: 'rotate180', name: '180度旋' },
   { key: 'hold', name: '暂存' }
];

class KeyboardSetting extends React.Component {
   state = {
      settingKey: null,
   }
   constructor(props) {
      super(props);
      this.settingKey = null;
      this.open = false;
      this.initKeys();
   }

   componentWillUpdate(props) {
      if (props.open != this.open) {
         if (props.open) {
            this.state.settingKey = null;
            this.initKeys();
         }
         this.open = props.open;
      }
   }

   initKeys() {
      var keyboard = UserManager.user.keyboard;
      this.keyboard = {};
      for (var i = 0; i < keys.length; i++) {
         this.keyboard[keys[i].key] = keyboard[keys[i].key];
      }
      this.state.dasDelay = keyboard.dasDelay;
      this.state.moveDelay = keyboard.moveDelay;
   }

   handleClose = () => {
      this.props.close();
   };

   handleSave = () => {

   }

   onKeyDown = (event) => {
      var settingKey = this.state.settingKey;
      if (!this.props.open || !settingKey) {
         return;
      }
      // ESC
      if (event.keyCode == 27) {
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
               <TableCell>{keys[i].name}</TableCell>
               <TableCell onClick={this.onClickKey(keys[i].key)}>{this.state.settingKey == key ? '' : keyName[code]}</TableCell>
            </TableRow>
         );
      }
      return (
         <Table style={{ width: '400px' }}>
            <TableHead>
               <TableRow>
                  <TableCell>操作</TableCell>
                  <TableCell>键位</TableCell>
               </TableRow>
            </TableHead>
            <TableBody>
               {cells}
               <TableRow>
                  <TableCell>首次延时(10~999ms)</TableCell>
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
                  <TableCell>移动延时(0~500ms)</TableCell>
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
            </TableBody>
         </Table>
      )
   }

   render() {
      const { classes } = this.props;
      var keyTable = this.makeKeyTable();

      return (
         <Dialog
            disableEscapeKeyDown
            open={this.props.open}
            onClose={this.handleClose}
            aria-labelledby="form-dialog-title"
            onKeyDown={this.onKeyDown}
         >
            <DialogTitle id="form-dialog-title">键盘设置</DialogTitle>
            <DialogContent>
               {keyTable}
            </DialogContent>
            <DialogActions>
               <Button onClick={this.handleClose} color="primary">
                  取消
               </Button>
               <Button onClick={this.handleSave} color="primary">
                  保存
               </Button>
            </DialogActions>
         </Dialog>
      );
   }
}

export default KeyboardSetting;