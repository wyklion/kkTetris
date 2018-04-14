/**
 * Created by kk on 2016/4/28.
 */
var SocketIO = require('socket.io');
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
      this.socket = socket;
      this.user = user;
      var userId = this.userId = user.id;
      this.roomId = null;

      if (!this.userManager.has(userId)) {
         this.userManager.add(userId)
      }

      socket.on('disconnect', this.onDisconnect.bind(this));
      socket.on('createRoom', this.onCreateRoom.bind(this));
      socket.on('joinRoom', this.onJoinRoom.bind(this));
      socket.on('exitRoom', this.onExitRoom.bind(this));
      socket.on('operation', this.onPlaying.bind(this));

      socket.on('single40', this.onSingle.bind(this));
      socket.on('setting', this.onSetting.bind(this));
      socket.on('chat', this.onChat.bind(this));

      // 通知
      socket.emit('onConnection', { err: null, user: user, users: this.userManager.getUsers(), rooms: this.roomManager.getRooms() });
      socket.broadcast.emit('lobbyInfo', { err: null, type: 'setUser', user: this.userManager.get(userId) });
   }
   onDisconnect(reason) {
      var socket = this.socket;
      var userId = this.userId;
      console.log(userId, "disconnect for reason:", reason);
      var roomId = this.userManager.getRoom(userId);
      this.userManager.remove(userId);
      if (roomId != null) {
         this.roomManager.userLeave(roomId, userId, socket);
         var room = this.roomManager.getRoom(roomId);
         if (room) {
            this.io.emit('lobbyInfo', { err: null, type: 'setRoom', room: room });
         } else {
            this.io.emit('lobbyInfo', { err: null, type: 'removeRoom', roomId: roomId });
         }
      }
      this.io.emit('lobbyInfo', { err: null, type: 'removeUser', userId: userId });
   }
   onCreateRoom(data) {
      var socket = this.socket;
      var userId = this.userId;
      var roomId = this.roomId;
      if (roomId != null) {
         socket.emit("onCreateRoom", { err: 'already in room ' + roomId });
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
      socket.emit("onCreateRoom", { err: null, roomId: roomId });
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
   onExitRoom(data) {
      var socket = this.socket;
      var roomId = this.roomId;
      var userId = this.userId;
      this.userManager.leaveRoom(userId);
      var result = this.roomManager.exitRoom(roomId, userId, data.watch);
      if (!result.err) {
         socket.leave("room" + roomId);    // 退出房间
         console.log(userId, "exit room", roomId);
         this.io.to("room" + roomId).emit('msg', userId + '退出了房间', this.roomManager.getRoom(roomId));
         if (result.delRoom) {
            socket.broadcast.emit('lobbyInfo', { err: null, type: 'removeRoom', roomId: roomId });
         }
         else {
            socket.broadcast.emit('lobbyInfo', { err: null, type: 'setRoom', room: this.roomManager.getRoom(roomId) });
            socket.broadcast.to("room" + roomId).emit('roomInfo', { room: this.roomManager.getRoom(roomId), userId: userId, join: false, watch: data.watch });
         }
         this.roomId = null;
         socket.emit("onExitRoom", { err: null, result: "ok" });
         // socket.emit("lobbyInfo", { users: this.users, rooms: this.roomManager.getRooms() });
         //mongo.insertOne("gameinfo", {id:userId, type:"exitRoom", roomId:roomId, time:Tools.getTime()})
      }
      else
         socket.emit("onExitRoom", { err: result.err });
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
   onSingle(data) {
      var socket = this.socket;
      mongo.updateAddValue("users", { id: this.userId }, { single40Times: 1 });
      mongo.updateOne("users", { id: this.userId, single40Best: { "$gt": data.time } }, { single40Best: data.time });
   }
   onSetting(data) {
      var socket = this.socket;
      if (data.type === "keyboard") {
         mongo.updateOne("users", { id: this.userId }, { keyboard: data.keyboard });
      }
      else if (data.type === "setting") {
         mongo.updateOne("users", { id: this.userId }, { setting: data.setting });
      }
   }
   onChat(data) {
      var socket = this.socket;
      if (data.to === MSG_TYPE.lobby) {
         this.io.emit("chat", { user: this.userId, msg: data.msg });
      }
   }
}

module.exports = GameSocket;
