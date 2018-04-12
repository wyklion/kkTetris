import Render from '../render/Render';
import SpeedGame from './SpeedGame';
import socket from '../socket/GameSocket';
import Listeners from '../util/Listeners';

/**
 * 游戏管理
 */
class GameManager {
   constructor() {
      // 唯一画布
      this.canvas = null;
      // 用户信息
      this.user = null;
      // 所有用户
      this.users = {};
      // 所有房间
      this.rooms = {};
      // 当前所在房间
      this.room = null;
      this.roomId = null;

      // 当前游戏
      this.game = null;
      // 更新函数
      this.updateFuncs = [];
      // this.updateLasts = {};
      // 主界面
      this.main = null;

      // 监听
      this.updateRoomsListeners = new Listeners();
      this.updateUsersListeners = new Listeners();
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
      this.render.render();
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
   setRenderDiv(div) {
      this.render.attach(div);
   }
   reset() {
      if (this.game) {
         this.game.dispose();
         this.game = null;
      }
   }
   /**
    * 房间更新
    */
   setRooms(rooms) {
      this.rooms = rooms;
      this.updateRoomsListeners.execute();
   }
   setRoom(room) {
      this.rooms[room.id] = room;
      this.updateRoomsListeners.execute();
   }
   removeRoom(roomId) {
      delete this.rooms[roomId];
      this.updateRoomsListeners.execute();
   }
   /**
    * 用户更新
    */
   setUsers(users) {
      this.users = users;
      this.updateUsersListeners.execute();
   }
   setUser(user) {
      this.users[user.id] = user;
      this.updateUsersListeners.execute();
   }
   removeUser(userId) {
      delete this.users[userId];
      this.updateUsersListeners.execute();
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