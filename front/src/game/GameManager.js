import Render from '../render/Render';
import SpeedGame from './SpeedGame';
import socket from '../socket/GameSocket';
import RoomManager from './RoomManager';
import UserManager from './UserManager';
import ChatManager from './ChatManager';
import config from '../config';

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

      // 当前游戏
      this.game = null;
      // 更新函数
      this.updateFuncs = [];
      // this.updateLasts = {};
      // 主界面
      this.main = null;
      // 登录状态
      this.logined = false;

   }
   static _instance = null;
   static getInstance() {
      if (!GameManager._instance) {
         GameManager._instance = new GameManager();
         GameManager._instance.init();
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
    * 登出处理
    */
   logout() {
      this.logined = false;
      this.reset();
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
    * 更新键位
    */
   updateKeyboard() {
      if (this.game) {
         this.game.updateKeyboard();
      }
   }
   /**
    * 40行游戏
    */
   startSpeedGame() {
      this.reset();
      var game = this.game = new SpeedGame(40);
      this.render.main.setTetris(game.tetris);
      game.start();
   }
   onGameOver(win, data) {
      this.main.onGameOver(win, data);
   }
   endGame() {
      this.reset();
   }
   restart() {
      if (this.game) {
         this.game.restart();
      }
   }
   /**
    * 创建房间
    */
   createRoom() {
      console.log("create room");
      socket.createRoom((success) => {
         console.log('create room result:', success);
      });
   }
}

var gameManager = GameManager.getInstance();
export default gameManager;