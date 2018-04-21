import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
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
import Rank from './ui/Rank';
import theme from './ui/Theme';
import gameManager from './game/GameManager';
import lang from './util/lang';

const styles = {
   bg: {
      // backgroundColor: color[900],
      width: '100%',
      height: '100%',
   }
}
class App extends React.Component {
   state = {
      checked: false, // 检查登录
      logined: false, // 是否登录
      profile: null, // 个人信息页面
      rank: false, // 排行榜
      width: null, // 内容宽
   }

   constructor(props) {
      super(props);
      this.checkLogin();
   }

   componentDidMount() {
      gameManager.app = this;
      gameManager.init();
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
      gameManager.login();
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
      this.setState({ profile: userId, rank: null });
   }
   onCloseProfile = () => {
      this.setState({ profile: null, rank: null });
   }

   /**
    * 排行榜
    */
   onRank = () => {
      this.setState({ rank: true, profile: null });
   }
   onCloseRank = () => {
      this.setState({ rank: null, profile: null });
   }

   onResize = (width) => {
      this.setState({ width: width });
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
            <div className={styles.bg}>
               <Login onLogin={this.onLogin} />
            </div>
         )
      } else {
         ui = (
            <div className='App'>
               <HeadBar onLogout={this.onLogout} width={state.width} />
               <Main hidden={state.profile || state.rank} onResize={this.onResize} />
               {state.profile && <Profile userId={state.profile} onReturn={this.onCloseProfile} />}
               {state.rank && <Rank onReturn={this.onCloseRank} />}
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

App.propTypes = {
   classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(App);
