import React, { Component } from 'react';
// import Button from 'material-ui/Button';
// import teal from 'material-ui/colors/teal';
// var color = teal;
// import logo from './logo.svg';
import './App.css';
import HeadBar from './ui/HeadBar';
import Login from './ui/Login';
import http from './util/http';
import UserManager from './UserManager';
import socket from './socket/GameSocket';

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
      UserManager.user = result;
      this.setState({ checked: true, logined: true });
      socket.connect();
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

      if (!logined) {
         return (
            <div style={classes.bg}>
               <Login onLogin={this.onLogin} />
            </div>
         )
      }
      return (
         <div style={classes.bg} className="App">
            <HeadBar onLogout={this.onLogout} />
         </div>
      );
   }
}

export default App;
