import React, { Component } from 'react';
import { MuiThemeProvider } from 'material-ui/styles';
// import Button from 'material-ui/Button';
// import teal from 'material-ui/colors/teal';
// var color = teal;
// import logo from './logo.svg';
import './App.css';
import HeadBar from './ui/HeadBar';
import Login from './ui/Login';
import http from './util/http';
import socket from './socket/GameSocket';
import Main from './ui/Main';
import Profile from './ui/Profile';
import theme from './ui/Theme';
import gameManager from './game/GameManager';

const classes = {
   bg: {
      // backgroundColor: color[900],
      width: '100%',
      height: '100%',
   }
}
class App extends Component {
   state = {
      checked: false, // 检查登录
      logined: false, // 是否登录
      profile: null, // 个人信息页面
   }

   constructor(props) {
      super(props);
      this.checkLogin();
   }

   componentDidMount() {
      gameManager.app = this;
   }

   componentWillUnmount() {
      gameManager.app = null;
   }

   /**
    * 检查登录
    */
   checkLogin() {
      http.get({ url: 'checklogin' }, (err, result) => {
         if (err) {
            this.setState({ checked: true })
         } else {
            this.onLogin(result);
         }
      })
   }

   /**
    * 点击登录且成功
    */
   onLogin = (result) => {
      socket.connectListeners.addOnce(this.onSocketConnect, true);
      socket.connectFailListeners.addOnce(this.onConnectFail, true);
      socket.connect();
   }

   /**
    * socket连接成功
    */
   onSocketConnect = () => {
      gameManager.logined = true;
      this.setState({ checked: true, logined: true });
      socket.onConnect = null;
   }

   /**
    * socket连接失败
    */
   onConnectFail = (err) => {
      this.setState({ checked: true, logined: false });
      socket.onConnectFail = null;
      alert(err);
   }

   /**
    * 登出
    */
   onLogout = () => {
      gameManager.logout();
      this.setState({ logined: false });
      socket.disconnect();
   }

   /**
    * 玩家信息页面
    */
   onProfile = (userId) => {
      this.setState({ profile: userId });
   }
   onCloseProfile = () => {
      this.setState({ profile: null });
   }

   render() {
      var state = this.state;
      var checked = state.checked;
      var logined = state.logined;
      if (!checked) {
         return (
            null
         )
      }
      var ui;
      if (!logined) {
         ui = (
            <div style={classes.bg}>
               <Login onLogin={this.onLogin} />
            </div>
         )
      } else {
         ui = (
            <div style={classes.bg} className="App">
               <HeadBar onLogout={this.onLogout} onProfile={this.onProfile} />
               <Main hidden={state.profile} onProfile={this.onProfile} />
               {state.profile && <Profile userId={state.profile} onReturn={this.onCloseProfile} />}
            </div>
         )
      }
      return (
         <MuiThemeProvider theme={theme}>
            {ui}
         </MuiThemeProvider>
      );
   }
}

export default App;
