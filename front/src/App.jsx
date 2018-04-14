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
import theme from './ui/Theme';

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
      logined: false,
   }

   constructor(props) {
      super(props);
      this.checkLogin();
   }

   checkLogin() {
      http.get({ url: 'checklogin' }, (err, result) => {
         if (err) {
            this.setState({ checked: true })
         } else {
            this.onLogin(result);
         }
      })
   }

   onLogin = (result) => {
      socket.connectListeners.addOnce(this.onSocketConnect, true);
      socket.connectFailListeners.addOnce(this.onConnectFail, true);
      socket.connect();
   }

   onSocketConnect = () => {
      this.setState({ checked: true, logined: true });
      socket.onConnect = null;
   }

   onConnectFail = () => {
      this.setState({ checked: true, logined: false });
      socket.onConnectFail = null;
   }

   onLogout = () => {
      this.setState({ logined: false });
      socket.disconnect();
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
               <HeadBar onLogout={this.onLogout} />
               <Main />
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
