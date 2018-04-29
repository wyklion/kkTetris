/**
 * Created by kk on 2016/4/28.
 */
var SocketIO = require('socket.io');
var ObjectId = require('mongodb').ObjectId;
var Tools = require('./Tools');
var RoomManager = require('./RoomManager');
var OPERTABLE = require('./OperTable');

var MSG_TYPE = {
   lobby: 0,
   room: 1,
};

class GameSocket {
   constructor(socketManager, socket, user) {
      this.socketManager = socketManager;
      this.io = socketManager.io;
      this.userManager = socketManager.userManager;
      this.roomManager = socketManager.roomManager;
      this.chatManager = socketManager.chatManager;
      this.socket = socket;
      this.user = user;
      var userId = this.userId = user.id;
      this.roomId = null;

      this.userManager.add(userId, this);

      socket.on('disconnect', this.onDisconnect.bind(this));
      socket.on('createRoom', this.onCreateRoom.bind(this));
      socket.on('joinRoom', this.onJoinRoom.bind(this));
      socket.on('exitRoom', this.onExitRoom.bind(this));
      socket.on('operation', this.onPlaying.bind(this));

      socket.on('speed40', this.onSpeed.bind(this));
      socket.on('dig18', this.onDig18.bind(this));
      socket.on('setting', this.onSetting.bind(this));
      socket.on('chat', this.onChat.bind(this));
      socket.on('friend', this.onFriend.bind(this));

      // 记录最新登录时间
      mongo.updateOne("users", { id: this.userId }, { lastLogin: Date.now() });
      // 通知
      socket.emit('onConnection', { err: null, user: user, users: this.userManager.getUsers(), rooms: this.roomManager.getRooms(), chat: this.chatManager.getMessages() });
      socket.broadcast.emit('lobbyInfo', { err: null, type: 'setUser', user: this.userManager.get(userId) });

      // 聊天区发系统消息
      socket.broadcast.emit("chat", { time: Date.now(), type: 'sys', user: this.userId, msg: 'enter' });
   }
   dispose() {
      var userId = this.userId;
      console.log("dispose gamesocket...", userId);
      var roomId = this.userManager.getRoom(userId);
      this.userManager.remove(userId);
      if (roomId != null) {
         this.roomManager.userLeave(roomId, userId, this.socket);
         var room = this.roomManager.getRoom(roomId);
         if (room) {
            this.io.emit('lobbyInfo', { err: null, type: 'setRoom', room: room });
         } else {
            this.io.emit('lobbyInfo', { err: null, type: 'removeRoom', roomId: roomId });
         }
      }
      this.io.emit('lobbyInfo', { err: null, type: 'removeUser', userId: userId });
      // 聊天区发系统消息
      this.io.emit("chat", { time: Date.now(), type: 'sys', user: this.userId, msg: 'left' });
      // socket管理移除
      this.socketManager.removeSocket(userId);
      // 主动断开
      this.disconnect('dispose...');
   }
   disconnect(reason) {
      if (this.socket.connected) {
         this.socket.disconnect(reason);
      }
   }
   onDisconnect(reason) {
      this.dispose();
   }
   onCreateRoom(data, callback) {
      var socket = this.socket;
      var userId = this.userId;
      var roomId = this.roomId;
      if (roomId != null) {
         callback('already in room ' + roomId);
         return;
      }
      roomId = this.roomManager.createRoom(userId);
      this.userManager.enterRoom(userId, roomId);
      this.roomId = roomId;
      // socket进房间
      socket.join("room" + roomId);
      // 通知所有人
      this.io.emit('lobbyInfo', { err: null, type: 'setRoom', room: this.roomManager.getRoom(roomId) });
      // 通知建房成功
      callback(null, { roomId: roomId });
      // 写入数据库记录
      mongo.insertOne("gameinfo", { id: userId, type: "createRoom", roomId: roomId, time: Tools.getTime() })
      console.log(userId, "createRoom", roomId);
   }
   onJoinRoom(data) {
      var socket = this.socket;
      var userId = this.userId;
      var roomId = data.roomId;
      this.userManager.enterRoom(userId, roomId);
      var result = this.roomManager.joinRoom(roomId, userId, data.watch);
      if (!result.err) {
         this.roomId = roomId;
         socket.emit("onJoinRoom", { err: null, room: this.roomManager.getRoom(roomId), watch: data.watch });
         console.log(userId, data.watch ? "watchRoom" : "joinRoom", roomId);
         socket.join("room" + roomId);
         socket.broadcast.emit('lobbyInfo', { err: null, type: 'setRoom', room: this.roomManager.getRoom(roomId) });
         socket.broadcast.to("room" + roomId).emit('roomInfo', { room: this.roomManager.getRoom(roomId), userId: userId, join: true, watch: data.watch });
         // 通知房间内人员
         this.io.to("room" + roomId).emit('msg', userId + '加入了房间', this.roomManager.getRoom(roomId));
         mongo.insertOne("gameinfo", { id: userId, type: data.watch ? "watchRoom" : "joinRoom", roomId: roomId, time: Tools.getTime() })
      }
      else {
         socket.emit("onJoinRoom", { err: result.err })
      }
   }
   onExitRoom(data, callback) {
      var socket = this.socket;
      var roomId = this.roomId;
      var userId = this.userId;
      this.userManager.leaveRoom(userId);
      var result = this.roomManager.exitRoom(roomId, userId);
      if (!result.err) {
         socket.leave("room" + roomId);    // 退出房间
         console.log(userId, "exit room", roomId);
         this.io.to("room" + roomId).emit('msg', userId + '退出了房间', this.roomManager.getRoom(roomId));
         if (result.delRoom) {
            this.io.emit('lobbyInfo', { err: null, type: 'removeRoom', roomId: roomId });
         }
         else {
            this.io.emit('lobbyInfo', { err: null, type: 'setRoom', room: this.roomManager.getRoom(roomId) });
            // socket.broadcast.to("room" + roomId).emit('roomInfo', { room: this.roomManager.getRoom(roomId), userId: userId, join: false, watch: data.watch });
         }
         this.roomId = null;
         callback(null, 'ok');
         // socket.emit("lobbyInfo", { users: this.users, rooms: this.roomManager.getRooms() });
         //mongo.insertOne("gameinfo", {id:userId, type:"exitRoom", roomId:roomId, time:Tools.getTime()})
      }
      else {
         callback(result.err);
      }
   }
   onPlaying(data) {
      var socket = this.socket;
      var oper = data.oper;
      if (oper === OPERTABLE.dead) {
         this.roomManager.userDead(socket);
         return;
      }
      data.userId = this.userId;
      socket.broadcast.to("room" + this.roomId).emit('onOperation', data);
      if (oper === OPERTABLE.ready) {
         this.roomManager.userReady(socket);
      }
   }
   /**
    * 保存录像写入数据库，返回id。
    */
   saveReplay(type, data, callback) {
      // 回放写入数据库记录
      mongo.insertOne("replay", { id: this.userId, type: type, ...data, date: Date.now() }, (err, result) => {
         if (err) {
            callback(err);
         } else {
            callback(null, result.insertedIds[0].toString());
         }
      });

   }
   /**
    * 竞速记录
    */
   onSpeed(data) {
      var socket = this.socket;
      mongo.updateAddValue("users", { id: this.userId }, { speed40Times: 1 });
      if (data.replay) {
         this.saveReplay('speed40', data, (err, id) => {
            var msg;
            if (err) {
               msg = { time: Date.now(), type: 'speed40', user: this.userId, msg: data.time };
            } else {
               msg = { time: Date.now(), type: 'speed40', user: this.userId, msg: data.time, replay: id };
               mongo.updateOne("users", { id: this.userId, speed40Best: { "$gt": data.time } }, { speed40Best: data.time, s40r: id, speed40Date: Date.now() });
            }
            this.io.emit("chat", msg);
            this.chatManager.add(msg);
         })
      } else {
         // 没录像，这种情况应该不存在
         mongo.updateOne("users", { id: this.userId, speed40Best: { "$gt": data.time } }, { speed40Best: data.time, speed40Date: Date.now() });
      }
   }
   /**
    * 挖掘记录
    */
   onDig18(data) {
      mongo.updateAddValue("users", { id: this.userId }, { dig18Times: 1 });
      if (data.replay) {
         this.saveReplay('dig18', data, (err, id) => {
            var msg;
            if (err) {
               msg = { time: Date.now(), type: 'dig18', user: this.userId, msg: data.time };
            } else {
               msg = { time: Date.now(), type: 'dig18', user: this.userId, msg: data.time, replay: id };
               mongo.updateOne("users", { id: this.userId, dig18Best: { "$gt": data.time } }, { dig18Best: data.time, d18r: id, dig18Date: Date.now() });
            }
            this.io.emit("chat", msg);
            this.chatManager.add(msg);
         })
      } else {
         // 没录像，这种情况应该不存在
         mongo.updateOne("users", { id: this.userId, dig18Best: { "$gt": data.time } }, { dig18Best: data.time, dig18Date: Date.now() });
      }
   }
   /**
    * 设置
    */
   onSetting(data) {
      var socket = this.socket;
      if (data.type === "keyboard") {
         mongo.updateOne("users", { id: this.userId }, { keyboard: data.keyboard });
      } else if (data.type === "setting") {
         mongo.updateOne("users", { id: this.userId }, { setting: data.setting });
      } else if (data.type === "lang") {
         mongo.updateOne("users", { id: this.userId }, { langId: data.id });
      }
   }
   /**
    * 聊天
    */
   onChat(data) {
      var socket = this.socket;
      if (data.to === MSG_TYPE.lobby) {
         data.user = this.userId;
         this.chatManager.add(data);
         this.io.emit("chat", data);
      }
   }
   /**
    * 好友
    */
   onFriend(data, callback) {
      if (data.type === 'add') {
         if (this.userId == data.id) {
            callback('不能加自己为好友！');
         } else {
            mongo.addFriend(this.userId, data.id, callback);
         }
      } else if (data.type === 'remove') {
         mongo.removeFriend(this.userId, data.id, callback);
      }
   }
}

module.exports = GameSocket;
