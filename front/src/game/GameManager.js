import Render from '../render/Render';
import SpeedGame from './SpeedGame';
import DigGame from './DigGame';
import BattleGame from './BattleGame';
import socket from '../socket/GameSocket';
import RoomManager from './RoomManager';
import UserManager from './UserManager';
import ChatManager from './ChatManager';
// import BattleManager from './BattleManager';
import config from '../config';
import lang from '../util/lang';
import TetrisSound from '../sound/TetrisSound'
import TextureManager from '../render/TextureManager';
import LayoutManager from '../render/LayoutManager';
import Listeners from '../util/Listeners';
import http from '../util/http';
import localStore from '../util/localStore';
import OperEnum from '../enum/OperEnum';

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
      // this.battleListener = new Listeners();
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
      // 本地记录
      localStore.set('lastLogin', user.id);
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
      var otherUser = this.roomManager.getRoomOtherUser(this.userManager.userId);
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
      if (this.game && this.game.gameType === 'battle') {
         alert('Can\'t replay in room');
         return;
      }
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
    * 自己创建房间
    */
   createRoom() {
      console.log("create room");
      this.reset();
      socket.createRoom((err, result) => {
         if (!err) {
            // this.battle = new BattleManager();
            this.main.onEnterRoom();
            this.render.showOtherTetris(true);
         }
      });
   }
   /**
    * 自己进入房间
    */
   joinRoom(roomId, watch) {
      console.log("join room");
      this.reset();
      socket.joinRoom(roomId, watch, (err, result) => {
         if (!err) {
            this._refreshRoom(true, watch);
         }
      })
   }
   /**
    * 自己退出房间
    */
   exitRoom() {
      console.log("exit room");
      this.reset();
      socket.exitRoom((err, result) => {
         if (!err) {
            this._refreshRoom(false);
         } else {
            if (!this.roomManager.roomId) {
               this._refreshRoom(false);
            }
         }
      });
   }
   _refreshRoom(enter, watch) {
      if (enter) {
         // this.battle = new BattleManager();
         // this.battle.update();
         this.main.onEnterRoom(watch);
         this.render.showOtherTetris(true);
      } else {
         // this.battle.dispose();
         this.main.onExitRoom();
         this.render.battle.reset();
         this.render.showOtherTetris(false);
      }
   }
   /**
    * 自己准备，lobbyMenu按钮触发。
    */
   battleReady(ready) {
      socket.battle(OperEnum.ready, ready);
      // 主机准备的时候游戏结束，界面清空
      this.roomManager.userReady({ userId: this.userId, data: ready });
   }
   /**
    * 别人准备，服务器通知，可能是主机。
    */
   onBattleReady(data) {
      console.log('user ready:', data.userId, data.data);
      // 房间状态变化
      this.roomManager.userReady(data);
      // // 对方准备状态
      // this.main.onBattleReady(data);
      // this.battleListener.execute('ready');
   }
   clearMyTetris() {
      if (this.game) {
         this.game.tetris.renderer.clear();
      }
   }
   clearOtherTetris() {
      if (this.game) {
         this.game.otherTetris.renderer.clear();
      }
   }
   /**
    * 开始对战游戏
    */
   startBattle(seed) {
      if (!this.roomManager.room) {
         return;
      }
      var game = this.game = new BattleGame(seed);
      this.render.main.setTetris(game.tetris);
      this.render.other.setTetris(game.otherTetris);
      game.start();
      // 界面变化
      this.main.onBattleStart();
   }
   /**
    * 对战一局结束，由battlGame通知
    */
   battleEnd(data) {
      // 房间状态变化
      this.roomManager.battleEnd(data);
      // 界面变化
      this.main.battleEnd(data);
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