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
      // // 确保gameManager先创建。
      // gameManager.reset();
      this.userManager = gameManager.userManager;
      this.roomManager = gameManager.roomManager;
      this.chatManager = gameManager.chatManager;

      this.socket = io(config.server, {
         autoConnect: false
      });

      this.socket.on('connect', this.onConnect);
      this.socket.on('disconnect', this.onDisconnect);
      this.socket.on('reconnect', this.onReconnect);
      this.socket.on('onConnection', this.onConnection);
      this.socket.on('lobbyInfo', this.onLobbyInfo);
      this.socket.on('chat', this.onChat);
      this.socket.on('roomInfo', this.onRoomInfo);
      this.socket.on('onCreateRoom', this.onCreateRoom);
      this.socket.on('onJoinRoom', this.onJoinRoom);
      this.socket.on('onExitRoom', this.onExitRoom);
      this.socket.on('onOperation', this.onOperation);

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
      this.socket.connect();
   }
   disconnect() {
      this.socket.disconnect();
   }
   onConnect = () => {
   }
   onDisconnect = () => {
      console.log('disconnect...');
      this.disconnectListeners.execute();
      //this.socket.reconnect();
   }
   onReconnect = (transport_type, reconnectionAttempts) => {
      console.log('reconnect...', transport_type, reconnectionAttempts);
      this.reconnectListeners.execute();
   }
   onConnection = (data) => {
      if (!data.err) {
         // 初始化不触发刷新
         this.userManager.initUsers(data.user, data.users);
         this.roomManager.initRooms(data.rooms);
         this.chatManager.setMessages(data.chat);
         console.log("login:", data);
         this.connectListeners.execute();
      }
      else {
         console.log(data.err);
         this.connectFailListeners.execute(data.err);
      }
   }

   /**
    * 聊天
    */
   chat(data) {
      this.socket.emit("chat", data);
   }
   onChat = (data) => {
      this.chatManager.add(data);
   }

   /**
    * 大厅信息
    */
   onLobbyInfo = (data) => {
      if (!data.err) {
         console.log("============== lobbyInfo ===============", data);
         if (data.type === 'setUser') {
            this.userManager.setUser(data.user);
         } else if (data.type === 'removeUser') {
            this.userManager.removeUser(data.userId);
         } else if (data.type === 'setRoom') {
            this.roomManager.setRoom(data.room);
         } else if (data.type === 'removeRoom') {
            this.roomManager.removeRoom(data.roomId);
         }
      }
      else
         console.log(data.err);
   }

   /**
    * 房间信息
    */
   onRoomInfo = (data) => {
      this.roomManager.room = data.room;
      console.log("roomInfo:", this.roomManager.room);
      if (data.join) {
         // main.game.someoneJoined(data.userId, data.watch);
      }
      else {
         // main.game.someoneLeft(data.userId, data.watch);
      }
      //if(main.game.single && this.roomManager.room.playUsers.length == 2){
      //    main.game.someoneJoined();
      //}
      //else if(!main.game.single && this.roomManager.room.playUsers.length == 1)
      //    main.game.someoneLeft();
   }

   /**
    * 创建房间
    */
   createRoom(func) {
      // main.spin();
      if (func) {
         this.createRoomListeners.add(func, true);
      }
      this.socket.emit("createRoom");
   }
   onCreateRoom = (data) => {
      if (!data.err) {
         this.roomManager.roomId = data.roomId;
         console.log("onCreateRoom ", this.roomManager.room);
         this.createRoomListeners.execute(true);
         // main.goRoom();
      }
      else {
         console.log(data.err);
         this.createRoomListeners.execute(false);
      }
      // main.stopSpin();
   }

   /**
    * 加入房间
    */
   joinRoom(roomId, watch) {
      // main.spin();
      this.socket.emit("joinRoom", { roomId: roomId, watch: watch });
   }
   onJoinRoom = (data) => {
      if (!data.err) {
         this.roomManager.room = data.room;
         if (data.watch) {
            // main.goRoom(true);
            console.log("watch room:", this.roomManager.room);
         }
         else {
            // main.goRoom();
            console.log("onJoinRoom", this.roomManager.room);
         }
      }
      else
         console.log(data.err);
      // main.stopSpin();
   }

   /**
    * 离开房间
    */
   exitRoom() {
      // main.spin();
      // this.socket.emit("exitRoom", { watch: main.game.watch });
   }
   onExitRoom = (data) => {
      if (!data.err) {
         console.log("onExitRoom", this.roomManager.roomId);
         this.roomManager.roomId = null;
         this.roomManager.room = null;
         // main.exitRoom();
      }
      else
         console.log(data.err);
      // main.stopSpin();
   }

   /**
    * 游戏操作
    */
   operate(oper, data) {
      var info = { oper: oper };
      if (data) {
         info.data = data;
      }
      this.socket.emit("operation", info);
   }
   onOperation = (data) => {
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
   }

   /**
    * 竞速40行记录
    */
   sendSpeed40(time) {
      this.socket.emit("speed40", {
         time: time,
      });
   }
   /**
    * 挖掘记录
    */
   sendDigScore(lines, time) {
      this.socket.emit('dig' + lines, {
         time: time,
      });
   }

   /**
    * 改语言
    */
   changeLang(langId) {
      this.socket.emit("setting", { type: "lang", id: langId });
   }

   /**
    * 设置
    */
   setting(setting) {
      this.userManager.user.setting = setting;
      this.socket.emit("setting", { type: "setting", setting: setting });
   }

   /**
    * 键位设置
    */
   setKeyboard(keyboard) {
      for (var k in keyboard) {
         this.userManager.user.keyboard[k] = keyboard[k];
      }
      // if (main.game) {
      //    main.game.updateInput();
      // }
      this.socket.emit("setting", { type: "keyboard", keyboard: keyboard });
   }

   /**
    * 好友
    */
   addFriend(friendId, callback) {
      this.socket.emit('friend', {
         type: 'add',
         id: friendId
      }, (err, result) => {
         if (!err) {
            this.userManager.setFriend(result);
         }
         callback(err, result);
      });
   }
   removeFriend(friendId, callback) {
      this.socket.emit('friend', {
         type: 'remove',
         id: friendId
      }, (err, result) => {
         if (!err) {
            this.userManager.removeFriend(friendId);
         }
         callback(err, result);
      });
   }
}

var socket = GameSocket.getInstance();
export default socket;
