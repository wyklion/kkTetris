import Render from '../render/Render';
import SpeedGame from './SpeedGame';
import DigGame from './DigGame';
import socket from '../socket/GameSocket';
import RoomManager from './RoomManager';
import UserManager from './UserManager';
import ChatManager from './ChatManager';
import config from '../config';
import lang from '../util/lang';
import TetrisSound from '../sound/TetrisSound'
import TextureManager from '../render/TextureManager';
import LayoutManager from '../render/LayoutManager';
import Listeners from '../util/Listeners';
import http from '../util/http';

/**
 * 游戏管理
 */
class GameManager {
   constructor() {
      // 唯一画布
      this.canvas = null;
      // 用户管理
      this.userManager = new UserManager();
      // 房间管理
      this.roomManager = new RoomManager();
      // 聊天管理
      this.chatManager = new ChatManager();
      // 音效管理
      this.soundManager = new TetrisSound();
      // 贴图管理
      this.textureManager = new TextureManager();
      // 布局管理
      this.layoutManager = new LayoutManager();

      // 当前游戏
      this.game = null;
      // 更新函数
      this.updateFuncs = [];
      // this.updateLasts = {};
      // 主界面
      this.main = null;
      // 登录状态
      this.logined = false;
      // 是否全处理按键
      this.focus = true;

      // 监听
      this.keySettingListener = new Listeners();
   }
   static _instance = null;
   static getInstance() {
      if (!GameManager._instance) {
         gameManager = GameManager._instance = new GameManager();
         // GameManager._instance.init();
      }
      return GameManager._instance;
   }
   init() {
      this.render = new Render();
      this._lastUpdate = Date.now();
      this.mainLoop();
   }
   calculateDeltaTime() {
      var now = Date.now();
      this._deltaTime = (now - this._lastUpdate) / 1000;
      this._lastUpdate = now;
   }
   mainLoop = () => {
      this.calculateDeltaTime();
      for (var i = 0; i < this.updateFuncs.length; i++) {
         this.updateFuncs[i](this._deltaTime);
      }
      if (this.logined && config.fps60) {
         this.render.render();
      }
      this.aniHandle = requestAnimationFrame(this.mainLoop);
   }
   addUpdate(object) {
      // this.updateLasts[object.update] = Date.now();
      this.updateFuncs.push(object.update);
   }
   removeUpdate(object) {
      var idx = this.updateFuncs.indexOf(object.update);
      if (idx > -1) {
         this.updateFuncs.splice(idx, 1);
      }
   }
   reset() {
      if (this.game) {
         this.game.dispose();
         this.game = null;
      }
   }
   /**
    * 登录
    */
   login() {
      gameManager.logined = true;
      var user = this.userManager.user;
      // 加载用户设置
      lang.init(user.langId);
      this.render.onChangeLang();
      this.soundManager.init(user.setting.sound);
      this.textureManager.init(user.setting.pic);
   }
   /**
    * 登出处理
    */
   logout() {
      this.logined = false;
      this.reset();
   }
   /**
    * 改语言
    */
   changeLang(langId) {
      lang.init(langId);
      this.render.onChangeLang();
      this.app.forceUpdate();
      socket.changeLang(langId);
   }

   /**
    * 房间信息
    */
   get rooms() {
      return this.roomManager.rooms;
   }
   get room() {
      return this.roomManager.room;
   }
   get roomId() {
      return this.roomManager.roomId;
   }
   /**
    * 用户信息
    */
   get users() {
      return this.userManager.users;
   }
   get user() {
      return this.userManager.user;
   }
   get userId() {
      return this.userManager.userId;
   }

   /**
    * 获取房间另一个玩家
    */
   getRoomOtherUser() {
      var room = this.roomManager.room;
      if (!room) return null;
      if (room.playUsers.length < 2) return null;
      var otherUser = this.userManager.user.id === room.playUsers[0] ? room.playUsers[1] : room.playUsers[0];
      return otherUser;
   }

   /**
    * 设置
    */
   setting(settings) {
      this.soundManager.init(settings.sound);
      this.textureManager.init(settings.pic);
      socket.setting(settings);
   }
   /**
    * 更新键位
    */
   updateKeyboard() {
      if (this.game) {
         this.game.updateKeyboard();
      }
      this.keySettingListener.execute();
   }
   /**
    * 游戏焦点事件没在输入框里就是true
    */
   setFocus(focus) {
      this.focus = focus;
   }
   /**
    * 开始竞速游戏
    */
   startSpeedGame() {
      this.reset();
      var game = this.game = new SpeedGame(40);
      this.render.main.setTetris(game.tetris);
      game.start();
   }
   /**
    * 开始挖掘游戏
    */
   startDigGame(lines) {
      this.reset();
      var game = this.game = new DigGame(lines);
      this.render.main.setTetris(game.tetris);
      game.start();
   }

   /**
    * 游戏结束，由各Game通知
    */
   onGameOver(win, data) {
      this.main.onGameOver(win, data);
   }
   /**
    * 主动结束游戏，由main界面通知
    */
   endGame() {
      this.reset();
   }
   /**
    * 主动重开游戏
    */
   restart() {
      if (this.game) {
         this.game.start();
      }
   }
   /**
    * 回放
    */
   replay(replayId) {
      if (this.game) {
         this.game.replay();
      }
   }
   /**
    * 加载回数据再回放
    */
   loadReplay(replayId) {
      http.get({ url: 'replay', data: { id: replayId } }, (err, result) => {
         if (!err) {
            this.onLoadReplay(result);
         }
      })
   }
   onLoadReplay(replay) {
      var game;
      if (replay.type === 'speed40') {
         this.reset();
         game = this.game = new SpeedGame(40);
         this.render.main.setTetris(game.tetris);
         game.recorder.decode(replay.replay);
         game.replay();
      } else if (replay.type === 'dig18') {
         this.reset();
         game = this.game = new DigGame(18);
         this.render.main.setTetris(game.tetris);
         game.recorder.decode(replay.replay);
         game.replay();
      }
      this.main.onLoadReplay();
   }
   /**
    * 创建房间
    */
   createRoom() {
      console.log("create room");
      socket.createRoom((err, result) => {
         if (!err) {
            this.main.onCreateRoom();
            this.render.showOtherTetris(true);
         }
      });
   }
   /**
    * 退出房间
    */
   exitRoom() {
      console.log("exit room");
      socket.exitRoom((err, result) => {
         if (!err) {
            this.main.onExitRoom();
            this.render.showOtherTetris(false);
         }
      });
   }
   /**
    * 在对战时显示或隐藏大厅
    */
   showLobby(show) {
      this.render.showOtherTetris(!show);
      this.main.onShowLobby(show);
   }
}

var gameManager = GameManager.getInstance();
export default gameManager;