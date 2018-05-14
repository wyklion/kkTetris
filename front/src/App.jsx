import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import { MuiThemeProvider } from 'material-ui/styles';
import Typography from 'material-ui/Typography';
import 'typeface-roboto'
// import Button from 'material-ui/Button';
// import teal from 'material-ui/colors/teal';
// var color = teal;
// import logo from './logo.svg';
import './App.css';
import HeadBar from './ui/HeadBar';
import Login from './ui/Login';
import http from './util/http';
import Main from './ui/Main';
import Profile from './ui/Profile';
import Rank from './ui/Rank';
import About from './ui/About';
import theme from './ui/Theme';
import gameManager from './game/GameManager';
import socket from './socket/GameSocket';
// import lang from './util/lang';

const styles = {
   bg: {
      // backgroundColor: color[900],
      width: '100%',
      height: '100%',
   },
   note: {
      textAlign: 'center',
   }
}
class App extends React.Component {
   state = {
      checked: false, // 检查登录
      logined: false, // 是否登录
      profile: null, // 个人信息页面
      rank: null, // 排行榜
      about: null, // 关于
      width: null, // 内容宽
   }

   constructor(props) {
      super(props);
      this.checkLogin();
   }

   componentDidMount() {
      gameManager.app = this;
      gameManager.init();
      socket.disconnectListeners.add(this.onDisconnect);
      socket.connectListeners.add(this.onSocketConnect);
      socket.connectFailListeners.add(this.onConnectFail);
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
      socket.connect();
   }

   /**
    * socket连接成功
    */
   onSocketConnect = () => {
      gameManager.login();
      this.setState({ checked: true, logined: true });
   }

   /**
    * socket连接失败
    */
   onConnectFail = (err) => {
      this.setState({ checked: true, logined: false });
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
    * 被断开连接
    */
   onDisconnect = () => {
      console.log('你已被断开连接。。。')
      this.setState({ logined: false });
   }

   /**
    * 玩家信息页面
    */
   onProfile = (userId) => {
      this.setState({ profile: userId, rank: null, about: null });
   }
   onCloseProfile = () => {
      this.setState({ profile: null, rank: null, about: null });
   }

   /**
    * 排行榜
    */
   onRank = (rankType) => {
      this.setState({ rank: rankType, profile: null, about: null });
   }
   onCloseRank = () => {
      this.setState({ rank: null, profile: null, about: null });
   }

   /**
    * 关于
    */
   onAbout = () => {
      this.setState({ about: true, profile: null, rank: null });
   }
   onCloseAbout = () => {
      this.setState({ about: null, rank: null, profile: null });
   }

   onResize = (width) => {
      this.setState({ width: width });
   }

   render() {
      const { classes } = this.props;
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
               <Typography variant="subheading" className={classes.note}>
                  Sorry guys, the server has been hacked on May 10, 2018.
                  The database is cleared.
                  So maybe you need to register a new account.
                  The work of this game is almost done now. Battle is ok. I dont know what to improve. Bye~
                  <div>
                     --2018.5.11 wyklion
                  </div>
               </Typography>
               <Login onLogin={this.onLogin} />
            </div>
         )
      } else {
         ui = (
            <div className='App'>
               <HeadBar onLogout={this.onLogout} width={state.width} />
               <Main hidden={state.profile || state.rank || state.about} onResize={this.onResize} />
               {state.profile && <Profile userId={state.profile} onReturn={this.onCloseProfile} />}
               {state.rank && <Rank rankType={state.rank} onReturn={this.onCloseRank} />}
               {state.about && <About onReturn={this.onCloseAbout} />}
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
