import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
// import AppBar from 'material-ui/AppBar';
import Tabs, { Tab } from 'material-ui/Tabs';
import Typography from 'material-ui/Typography';
import Paper from 'material-ui/Paper';
import Input from 'material-ui/Input';
import Button from 'material-ui/Button';

import gameManager from '../game/GameManager';
// import config from '../config';
import Tools from '../util/Tools';
import lang from '../util/lang';
import MsgTypeEnum from '../enum/MsgTypeEnum';

function TabContainer(props) {
   return (
      <Typography component="div" style={{ padding: 8 * 3 }}>
         {props.children}
      </Typography>
   );
}

TabContainer.propTypes = {
   children: PropTypes.node.isRequired,
};

const styles = theme => ({
   root: {
      width: '50%',
      height: '40%',
      position: 'absolute',
      top: '60%'
      // background: '#888888',
   },
   paper: {
      margin: '0 10px',
      height: 'calc(100% - 10px)',
   },
   tabs: {
      // background: '#dddddd'
   },
   content: {
      height: 'calc(100% - 48px)',
      // background: '#dddddd'
   },
   chatContent: {
      height: 'calc(100% - 30px)',
      // background: '#ffffff',
      overflowY: 'auto',
   },
   message: {
      textAlign: 'left',
      padding: '0 8px',
      color: '#AAAAAA',
   },
   date: {
      color: '#2486ad',
   },
   sysMsg: {
      color: '#ff59ff',
   },
   scoreMsg: {
      color: '#ff6543',
   },
   replay: {
      // color: 'yellow',
   },
   chatInput: {
      height: '30px',
   },
   input: {
      margin: '0 8px',
      width: 'calc(100% - 16px)',
      fontSize: '14px'
   },
   userName: {
      fontWeight: 'bold',
   }
});

class Chat extends React.Component {
   constructor(props) {
      super(props);
      this.chatContentRef = null;
      this.inputRef = null;
      this.hasRoom = false;
      this.chatManager = gameManager.chatManager;
   }
   state = {
      value: 0,
      messages: [],
      chatInput: '',
   };

   componentWillMount() {
      this.setState({
         messages: this.chatManager.getMessages(),
         roomMsgs: this.chatManager.getRoomMsgs()
      });
   }
   componentDidMount() {
      this.chatManager.updateChatListeners.add(this.onGetMessage);
      this.scrollToBottom();
   }
   componentWillUpdate(props) {
      // 刚进对战的时候自动切到房间频道
      if (this.props.playState !== props.playState) {
         if (props.playState === 'battle') {
            this.hasRoom = true;
            this.setState({ value: 1 });
         } else {
            this.hasRoom = false;
            this.setState({ value: 0 });
         }
         // this.scrollToBottom();
      }
   }
   componentDidUpdate() {
      this.scrollToBottom();
   }
   componentWillUnmount() {
      this.chatManager.updateChatListeners.remove(this.onGetMessage);
   }

   scrollToBottom() {
      this.chatContentRef.scrollTop = this.chatContentRef.scrollHeight;
   }

   handleChangeTab = (event, value) => {
      this.setState({ value });
   };

   handleChange = name => event => {
      this.setState({
         [name]: event.target.value,
      });
   };

   sendMessage(msg) {
      if (msg === '') {
         return;
      }
      if (this.state.value === 0) {
         this.chatManager.sendLobby(msg);
      } else {
         this.chatManager.sendRoom(gameManager.roomManager.roomId, msg);
      }
   }

   onGetMessage = (data) => {
      var messages = this.state.messages;
      var roomMsgs = this.state.roomMsgs;

      this.setState({ messages, roomMsgs });
      this.scrollToBottom();
   }

   onKeyDown = (event) => {
      // 回车
      if (event.keyCode === 13) {
         this.sendMessage(encodeURI(this.state.chatInput));
         this.setState({ chatInput: '' });
      }
   }

   /**
    * 焦点事件
    */
   onFocus = () => {
      gameManager.setFocus(false);
   }
   onBlur = () => {
      gameManager.setFocus(true);
   }

   replay = (replayId) => {
      return () => {
         gameManager.loadReplay(replayId);
      }
   }

   getDiffDays(dateNow, msgDate) {
      msgDate.setHours(1);
      msgDate.setMinutes(0);
      msgDate.setSeconds(0);
      return parseInt(Math.abs(dateNow - msgDate) / 86400000, 10);
   }

   /**
    * 系统消息
    */
   makeSystemMessage(time, data) {
      const { classes } = this.props;
      // 系统消息
      var msg;
      if (data.msg === 'enter') {
         msg = data.user + ' ' + (data.type === MsgTypeEnum.room ? lang.get('enterRoom') : lang.get('enter...'));
      } else if (data.msg === 'left') {
         msg = data.user + ' ' + (data.type === MsgTypeEnum.room ? lang.get('leftRoom') : lang.get('left...'));
      } else {
         msg = lang.get('System message') + ': ' + decodeURI(data.msg);
      }
      return (
         <div key={data.idx} className={classes.message}><span>{time}</span><span className={classes.sysMsg}>{msg}</span></div >
      )
   }

   /**
    * 成绩消息
    */
   makeScoreMessage(time, data) {
      const { classes } = this.props;
      // 系统消息
      var msg;
      if (data.type === MsgTypeEnum.speed40) {
         msg = lang.get('speed40Score', data.user, data.msg);
      } else if (data.type === MsgTypeEnum.dig18) {
         msg = lang.get('dig18Score', data.user, data.msg);
      }
      var replay = data.replay ?
         <Button color="primary" size="small" className={classes.replay} onClick={this.replay(data.replay)}>
            {lang.get('Replay')}
         </Button> : null;
      return (
         <div key={data.idx} className={classes.message}><span>{time}</span><span className={classes.scoreMsg}>{msg}</span>{replay}</div >
      )
   }

   /**
    * 一条消息
    */
   makeOneMessage(data) {
      const { classes } = this.props;
      var time = Tools.formatTime(data.time, '[hh:mm:ss]');
      var isSys = data.type === MsgTypeEnum.sys || (data.type === MsgTypeEnum.room && data.t2 === MsgTypeEnum.sys);
      // 系统消息，大厅房间一样
      if (isSys) {
         return this.makeSystemMessage(time, data);
      }
      // 成绩消息，只有大厅有
      else if (data.type === MsgTypeEnum.speed40 || data.type === MsgTypeEnum.dig18) {
         return this.makeScoreMessage(time, data);
      }
      // 用户聊天，大厅房间一样
      else {
         var msg;
         try {
            msg = decodeURI(data.msg);
         } catch (e) {
            msg = data.msg;
         }
         return <div key={data.idx} className={classes.message}><span>{time}</span><span className={classes.userName}>{data.user}</span><span>{':' + msg}</span></div>
      }
   }

   /**
    * 消息内容
    */
   makeLobbyMessages() {
      const { classes } = this.props;
      var msgs = [];
      var messages = this.state.messages;
      var dateNow = new Date();
      dateNow.setHours(24);
      dateNow.setMinutes(0);
      dateNow.setSeconds(0);
      var longest = 999;
      for (var i = 0; i < messages.length; i++) {
         var data = messages[i];
         var msgDate = new Date(data.time);
         var diffDays = this.getDiffDays(dateNow, msgDate);
         if (diffDays < longest) {
            longest = diffDays;
            var dateStr;
            if (diffDays === 0) {
               dateStr = lang.get('Today');
            } else if (diffDays === 1) {
               dateStr = lang.get('Yestoday');
            } else {
               dateStr = Tools.formatTime(data.time, 'yyyy-MM-dd');
            }
            msgs.push(
               <div key={'date' + data.idx} className={classes.date}><span>{dateStr}</span></div >
            )
         }
         msgs.push(this.makeOneMessage(data));
      }
      return msgs;
   }

   /**
    * 房间消息
    */
   makeRoomMessages() {
      var msgs = [];
      var messages = this.state.roomMsgs;
      for (var i = 0; i < messages.length; i++) {
         var data = messages[i];
         msgs.push(this.makeOneMessage(data));
      }
      return msgs;
   }

   render() {
      const { classes, show, playState } = this.props;
      const { value } = this.state;
      if (!show) {
         return null;
      }
      var lobbyMessages = this.makeLobbyMessages();
      var roomMsgs = this.makeRoomMessages();
      return (
         <div className={classes.root}>
            <Paper className={classes.paper}>
               <Tabs
                  className={classes.tabs}
                  value={this.hasRoom ? this.state.value : 0}
                  onChange={this.handleChangeTab}
                  indicatorColor="primary"
                  textColor="primary"
                  fullWidth
               >
                  <Tab label={lang.get('Lobby')} />
                  {playState === 'battle' ? <Tab label={lang.get('Room')} /> : null}
               </Tabs>
               <div className={classes.content} >
                  <div ref={instance => this.chatContentRef = instance} className={classes.chatContent} >
                     {value === 0 ? lobbyMessages : null}
                     {value === 1 ? roomMsgs : null}
                  </div>
                  <div className={classes.chatInput}>
                     <Input
                        ref={instance => this.inputRef = instance}
                        placeholder={lang.get('I say')}
                        fullWidth
                        onFocus={this.onFocus}
                        onBlur={this.onBlur}
                        value={this.state.chatInput}
                        onChange={this.handleChange('chatInput')}
                        className={classes.input}
                        onKeyDown={this.onKeyDown}
                        inputProps={{
                           'maxLength': 128,
                           'aria-label': 'Description',
                        }}
                     />
                  </div>
               </div>
            </Paper >
         </div>
      )
   }
}

Chat.propTypes = {
   classes: PropTypes.object.isRequired,
   theme: PropTypes.object.isRequired,
};

export default withStyles(styles, { withTheme: true })(Chat);