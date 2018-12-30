import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
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
import gameManager from './game/GameManager';
import socket from './socket/GameSocket';
// import lang from './util/lang';

import { withRouter, Route } from "react-router-dom";


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
    * 页面跳转
    */
   linkTo = (path) => {
      this.props.history.push(path);
   }

   /**
    * 跳到主页
    */
   home = () => {
      this.linkTo('/');
   }

   /**
    * 排行页面
    */
   onRank = (rankType) => {
      this.linkTo('/rank/' + rankType);
   }

   /**
    * 玩家信息页面
    */
   onProfile = (userId) => {
      this.linkTo('/profile/' + userId);
   }

   /**
    * 回放页面
    */
   onReplay = (replayId) => {
      this.linkTo('/replay/' + replayId);
   }

   /**
    * 关于页面
    */
   onAbout = () => {
      this.linkTo('/about');
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
                  Hello, I'm back! Don't know when will gone.
                  <div>
                     --2018.12.30 wyklion
                  </div>
               </Typography>
               <Login onLogin={this.onLogin} />
            </div>
         )
      } else {
         ui = (
            < div className='App' >
               <HeadBar onLogout={this.onLogout} width={this.state.width} />
               <Route exact path="/" component={Main} />
               <Route path="/rank/:rankType" component={Rank} />
               <Route path="/profile/:userId" component={Profile} />
               <Route path="/replay/:replayId" component={Main} />
               <Route path="/about" component={About} />
            </div >
         )
      }
      return ui;
   }
}


App.propTypes = {
   classes: PropTypes.object.isRequired,
};

export default withRouter(withStyles(styles)(App));
