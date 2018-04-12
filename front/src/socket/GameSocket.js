/**
 * Created by kk on 2018/4/8.
 */
import io from 'socket.io-client';
import config from '../config';
import gameManager from '../game/GameManager';
import { OPERTABLE, MSG_TYPE } from './OperTable';
import Listeners from '../util/Listeners';

class GameSocket {
   constructor() {
      // main.spin();
      // $('#openWaiting').remove();
      this.connected = false;
      this.socket = io(config.server);
      this._onConnection();
      this._onDisconnect();
      this._onReconnect();
      this._onMsg();
      this._onLobbyInfo();
      this._onRoomInfo();
      this._onCreateRoom();
      this._onJoinRoom();
      this._onExitRoom();
      this._onOperate();
      this.connectListeners = new Listeners();
      this.connectFailListeners = new Listeners();
      this.disconnectListeners = new Listeners();
      this.reconnectListeners = new Listeners();
      this.createRoomListeners = new Listeners();
   }
   static _instance = null;
   static getInstance() {
      if (!GameSocket._instance) {
         GameSocket._instance = new GameSocket();
      }
      return GameSocket._instance;
   }
   connect() {
      if (this.socket.connected) {
         this.connectListeners.execute();
      } else {
         this.socket.connect();
      }
   }
   disconnect() {
      this.connected = false;
      this.socket.disconnect();
   }
   _onConnection() {
      this.socket.on('onConnection', (data) => {
         if (!data.err) {
            // 初始化不触发刷新
            gameManager.user = data.user;
            gameManager.users = data.users;
            gameManager.rooms = data.rooms;
            console.log("login:", data);
            this.connected = true;
            this.connectListeners.execute();
         }
         else {
            console.log(data.err);
            this.connectFailListeners.execute();
         }
      });
   }
   _onDisconnect() {
      this.socket.on('disconnect', () => {
         console.log('disconnect...');
         this.disconnectListeners.execute();
         //this.socket.reconnect();
      });
   }
   _onReconnect() {
      this.socket.on('reconnect', (transport_type, reconnectionAttempts) => {
         console.log('reconnect...', transport_type, reconnectionAttempts);
         this.reconnectListeners.execute();
      });
   }
   sendMsg(data) {
      this.socket.emit("chat", data);
   }
   _onMsg() {
      this.socket.on('chat', function (data) {
         // main.putMsg(data.user, data.msg);
      });
   }
   _onLobbyInfo() {
      var _this = this;
      this.socket.on('lobbyInfo', function (data) {
         if (!data.err) {
            console.log("============== lobbyInfo ===============", data);
            if (data.type === 'addUser') {
               gameManager.addUser(data.user);
            } else if (data.type === 'removeUser') {
               gameManager.removeUser(data.user);
            } else if (data.type === 'setRoom') {
               gameManager.setRoom(data.room);
            } else if (data.type === 'removeRoom') {
               gameManager.removeRoom(data.roomId);
            }
         }
         else
            console.log(data.err);
      });
   }
   getRoomOtherUser() {
      if (!gameManager.room) return null;
      if (gameManager.room.playUsers.length < 2) return null;
      var otherUser = gameManager.user.id === gameManager.room.playUsers[0] ? gameManager.room.playUsers[1] : gameManager.room.playUsers[0];
      return otherUser;
   }
   _onRoomInfo() {
      var _this = this;
      this.socket.on('roomInfo', function (data) {
         gameManager.room = data.room;
         console.log("roomInfo:", gameManager.room);
         if (data.join) {
            // main.game.someoneJoined(data.userId, data.watch);
         }
         else {
            // main.game.someoneLeft(data.userId, data.watch);
         }
         //if(main.game.single && gameManager.room.playUsers.length == 2){
         //    main.game.someoneJoined();
         //}
         //else if(!main.game.single && gameManager.room.playUsers.length == 1)
         //    main.game.someoneLeft();
      });
   }
   createRoom(func) {
      // main.spin();
      if (func) {
         this.createRoomListeners.add(func, true);
      }
      this.socket.emit("createRoom");
   }
   _onCreateRoom() {
      this.socket.on("onCreateRoom", (data) => {
         if (!data.err) {
            gameManager.room = data.room;
            gameManager.setRoom(data.room);
            console.log("onCreateRoom", gameManager.room);
            this.createRoomListeners.execute(true);
            // main.goRoom();
         }
         else {
            console.log(data.err);
            this.createRoomListeners.execute(false);
         }
         // main.stopSpin();
      });
   }
   joinRoom(roomId, watch) {
      // main.spin();
      this.socket.emit("joinRoom", { roomId: roomId, watch: watch });
   }
   _onJoinRoom() {
      this.socket.on("onJoinRoom", (data) => {
         if (!data.err) {
            gameManager.room = data.room;
            if (data.watch) {
               // main.goRoom(true);
               console.log("watch room:", gameManager.room);
            }
            else {
               // main.goRoom();
               console.log("onJoinRoom", gameManager.room);
            }
         }
         else
            console.log(data.err);
         // main.stopSpin();
      });
   }
   exitRoom() {
      // main.spin();
      // this.socket.emit("exitRoom", { watch: main.game.watch });
   }
   _onExitRoom() {
      this.socket.on("onExitRoom", (data) => {
         if (!data.err) {
            console.log("onExitRoom", gameManager.roomId);
            gameManager.roomId = null;
            gameManager.room = null;
            // main.exitRoom();
         }
         else
            console.log(data.err);
         // main.stopSpin();
      });
   }
   operate(oper, data) {
      var info = { oper: oper };
      if (data) {
         info.data = data;
      }
      this.socket.emit("operation", info);
   }
   _onOperate() {
      var _this = this;
      this.socket.on("onOperation", (data) => {
         console.log("other operate:", data.oper);
         // if (main.game) {
         //    var hostTetris, imitateTetris;
         //    if (main.game.watch) {
         //       if (main.game.hostUser === data.userId) {
         //          imitateTetris = main.game.tetris;
         //       }
         //       else
         //          imitateTetris = main.game.otherTetris;
         //    }
         //    else {
         //       hostTetris = main.game.tetris;
         //       imitateTetris = main.game.otherTetris;
         //    }
         //    switch (data.oper) {
         //       case OPERTABLE.ready:
         //          main.game.userReady(data.userId);
         //          break;
         //       case OPERTABLE.start:
         //          main.game.startVS(data.shapes);
         //          break;
         //       case OPERTABLE.gameover:
         //          main.game.gameOver(data.result);
         //          break;
         //       case OPERTABLE.dead:
         //          break;
         //       case OPERTABLE.left:
         //          imitateTetris.moveLeft();
         //          break;
         //       case OPERTABLE.leftEnd:
         //          imitateTetris.moveLeftToEnd();
         //          break;
         //       case OPERTABLE.right:
         //          imitateTetris.moveRight();
         //          break;
         //       case OPERTABLE.rightEnd:
         //          imitateTetris.moveRightToEnd();
         //          break;
         //       case OPERTABLE.down:
         //          imitateTetris.moveDown();
         //          break;
         //       case OPERTABLE.downEnd:
         //          imitateTetris.moveDownToEnd();
         //          break;
         //       case OPERTABLE.downNature:
         //          imitateTetris.moveDownNature();
         //          break;
         //       case OPERTABLE.drop:
         //          imitateTetris.drop();
         //          break;
         //       case OPERTABLE.attack:
         //          if (!main.game.watch)
         //             hostTetris.hurt(data.data);
         //          break;
         //       case OPERTABLE.hurt:
         //          imitateTetris.hurt(data.data);
         //          break;
         //       case OPERTABLE.trash:
         //          imitateTetris.trash(data.data);
         //          break;
         //       case OPERTABLE.rotateL:
         //          imitateTetris.rotate(true);
         //          break;
         //       case OPERTABLE.rotateR:
         //          imitateTetris.rotate(false);
         //          break;
         //       case OPERTABLE.hold:
         //          imitateTetris.holdShape();
         //          break;
         //    }
         // }
      });
   }
   single(time) {
      this.socket.emit("single40", {
         time: time,
      });
   }
   setSetting(setting) {
      gameManager.user.setting = setting;
      this.socket.emit("setting", { type: "setting", setting: setting });
   }
   setKeyboard(keyboard) {
      for (var k in keyboard) {
         gameManager.user.keyboard[k] = keyboard[k];
      }
      // if (main.game) {
      //    main.game.updateInput();
      // }
      this.socket.emit("setting", { type: "keyboard", keyboard: keyboard });
   }
}

var socket = GameSocket.getInstance();
export default socket;
