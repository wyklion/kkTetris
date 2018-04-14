import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import AppBar from 'material-ui/AppBar';
import Tabs, { Tab } from 'material-ui/Tabs';
import Typography from 'material-ui/Typography';
import Paper from 'material-ui/Paper';
import Input from 'material-ui/Input';

import gameManager from '../game/GameManager';
import config from '../config';
import Tools from '../util/Tools';

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
      this.state.messages = this.chatManager.getMessages();
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
      if (msg == '') {
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

   makeMessages() {
      const { classes } = this.props;
      var msgs = [];
      var messages = this.state.messages;
      for (var i = 0; i < messages.length; i++) {
         var data = messages[i];
         var time = Tools.formatTime(data.time, '[hh:mm:ss]');
         msgs.push(
            <div key={data.idx} className={classes.message}><span>{time}</span><span>{data.user}:</span> <span>{decodeURI(data.msg)}</span></div >
         )
      }
      return msgs;
   }

   render() {
      const { classes, theme, show } = this.props;
      const { value } = this.state;
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
                  <Tab label="大厅聊天" />
               </Tabs>
               <div className={classes.content} >
                  <div ref={instance => this.chatContentRef = instance} className={classes.chatContent} >
                     {messages}
                  </div>
                  <div className={classes.chatInput}>
                     <Input
                        ref={instance => this.inputRef = instance}
                        placeholder="我说"
                        fullWidth
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