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
});

class Chat extends React.Component {
   constructor(props) {
      super(props);
      this.chatContentRef = null;
      this.inputRef = null;
      this.chatManager = gameManager.chatManager;
   }
   state = {
      value: 0,
      messages: [],
      chatInput: '',
   };

   componentWillMount() {
      this.setState({ messages: this.chatManager.getMessages() });
   }
   componentDidMount() {
      this.chatManager.updateChatListeners.add(this.onGetMessage);
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
      this.chatManager.sendLobby(msg);
   }

   onGetMessage = (data) => {
      var messages = this.state.messages;
      this.setState({ messages: messages });
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
         msg = data.user + ' ' + lang.get('enter...');
      } else if (data.msg === 'left') {
         msg = data.user + ' ' + lang.get('left...');
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
      if (data.type === 'speed40') {
         msg = lang.get('speed40Score', data.user, data.msg);
      } else if (data.type === 'dig18') {
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
    * 消息内容
    */
   makeMessages() {
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
         var time = Tools.formatTime(data.time, '[hh:mm:ss]');
         var msgDate = new Date(data.time);
         var diffDays = this.getDiffDays(dateNow, msgDate);
         if (diffDays < longest) {
            longest = diffDays;
            // if (i !== 0) {//&& diffDays === 0
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
            // }
         }
         if (data.type === 'sys') {
            msgs.push(this.makeSystemMessage(time, data))
         } else if (data.type === 'speed40' || data.type === 'dig18') {
            msgs.push(this.makeScoreMessage(time, data))
         } else {
            // 用户聊天
            msgs.push(
               <div key={data.idx} className={classes.message}><span>{time}</span><span>{data.user}:</span> <span>{decodeURI(data.msg)}</span></div >
            )
         }
      }
      return msgs;
   }

   render() {
      const { classes, show } = this.props;
      if (!show) {
         return null;
      }
      var messages = this.makeMessages();
      return (
         <div className={classes.root}>
            <Paper className={classes.paper}>
               <Tabs
                  className={classes.tabs}
                  value={this.state.value}
                  onChange={this.handleChangeTab}
                  indicatorColor="primary"
                  textColor="primary"
                  fullWidth
               >
                  <Tab label={lang.get('Lobby Chat')} />
               </Tabs>
               <div className={classes.content} >
                  <div ref={instance => this.chatContentRef = instance} className={classes.chatContent} >
                     {messages}
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