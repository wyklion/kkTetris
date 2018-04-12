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
   constructor(socketManager, socket, userData) {
      this.socketManager = socketManager;
      this.io = socketManager.io;
      this.userManager = socketManager.userManager;
      this.roomManager = socketManager.roomManager;
      this.socket = socket;
      this.user = userData;

      if (!this.userManager.has(socket.userId)) {
         this.userManager.add(socket.userId)
      }
      socket.emit('onConnection', { err: null, user: userData, users: this.userManager.getUsers(), rooms: this.roomManager.getRooms() });
      socket.broadcast.emit('lobbyInfo', { err: null, type: 'setUser', user: this.userManager.get(socket.userId) });

      socket.on('disconnect', this.onDisconnect.bind(this));
      socket.on('createRoom', this.onCreateRoom.bind(this));
      socket.on('joinRoom', this.onJoinRoom.bind(this));
      socket.on('exitRoom', this.onExitRoom.bind(this));
      socket.on('operation', this.onPlaying.bind(this));

      socket.on('single40', this.onSingle.bind(this));
      socket.on('setting', this.onSetting.bind(this));
      socket.on('chat', this.onChat.bind(this));

   }
   onDisconnect() {
      var socket = this.socket;
      console.log(socket.userId, "disconnect");
      this.userManager.remove(socket.userId);
      this.roomManager.userLeave(socket);
      socket.broadcast.emit('lobbyInfo', { err: null, type: 'removeUser', userId: socket.userId });
   }
   onCreateRoom(data) {
      var socket = this.socket;
      var idx = this.roomManager.createRoom(socket.userId);
      socket.roomId = idx;
      socket.join("room" + socket.roomId);
      socket.emit("onCreateRoom", { err: null, room: this.roomManager.getRoom(idx) });
      socket.broadcast.send('lobbyInfo', { err: null, type: 'setRoom', room: this.roomManager.getRoom(idx) });
      console.log(socket.userId, "createRoom", socket.roomId);
      mongo.insertOne("gameinfo", { id: socket.userId, type: "createRoom", roomId: idx, time: Tools.getTime() })
   }
   onJoinRoom(data) {
      var socket = this.socket;
      var result = this.roomManager.joinRoom(data.roomId, socket.userId, data.watch);
      if (!result.err) {
         socket.roomId = data.roomId;
         socket.emit("onJoinRoom", { err: null, room: this.roomManager.getRoom(socket.roomId), watch: data.watch });
         console.log(socket.userId, data.watch ? "watchRoom" : "joinRoom", socket.roomId);
         socket.join("room" + socket.roomId);
         socket.broadcast.emit('lobbyInfo', { err: null, type: 'setRoom', room: this.roomManager.getRoom(socket.roomId) });
         socket.broadcast.to("room" + socket.roomId).emit('roomInfo', { room: this.roomManager.getRoom(socket.roomId), userId: socket.userId, join: true, watch: data.watch });
         // 通知房间内人员
         this.io.to("room" + socket.roomId).emit('msg', socket.userId + '加入了房间', this.roomManager.getRoom(socket.roomId));
         mongo.insertOne("gameinfo", { id: socket.userId, type: data.watch ? "watchRoom" : "joinRoom", roomId: socket.roomId, time: Tools.getTime() })
      }
      else {
         socket.emit("onJoinRoom", { err: result.err })
      }
   }
   onExitRoom(data) {
      var socket = this.socket;
      var roomId = socket.roomId;
      var result = this.roomManager.exitRoom(roomId, socket.userId, data.watch);
      if (!result.err) {
         socket.leave("room" + roomId);    // 退出房间
         console.log(socket.userId, "exit room", roomId);
         this.io.to("room" + roomId).emit('msg', socket.userId + '退出了房间', this.roomManager.getRoom(roomId));
         if (result.delRoom) {
            socket.broadcast.emit('lobbyInfo', { err: null, type: 'removeRoom', roomId: roomId });
         }
         else {
            socket.broadcast.emit('lobbyInfo', { err: null, type: 'setRoom', room: this.roomManager.getRoom(roomId) });
            socket.broadcast.to("room" + socket.roomId).emit('roomInfo', { room: this.roomManager.getRoom(roomId), userId: socket.userId, join: false, watch: data.watch });
         }
         socket.roomId = null;
         socket.emit("onExitRoom", { err: null, result: "ok" });
         // socket.emit("lobbyInfo", { users: this.users, rooms: this.roomManager.getRooms() });
         //mongo.insertOne("gameinfo", {id:socket.userId, type:"exitRoom", roomId:roomId, time:Tools.getTime()})
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
      data.userId = socket.userId;
      socket.broadcast.to("room" + socket.roomId).emit('onOperation', data);
      if (oper === OPERTABLE.ready) {
         this.roomManager.userReady(socket);
      }
   }
   onSingle(data) {
      var socket = this.socket;
      mongo.updateAddValue("users", { id: socket.userId }, { single40Times: 1 });
      mongo.updateOne("users", { id: socket.userId, single40Best: { "$gt": data.time } }, { single40Best: data.time });
   }
   onSetting(data) {
      var socket = this.socket;
      if (data.type === "keyboard") {
         mongo.updateOne("users", { id: socket.userId }, { keyboard: data.keyboard });
      }
      else if (data.type === "setting") {
         mongo.updateOne("users", { id: socket.userId }, { setting: data.setting });
      }
   }
   onChat(data) {
      var socket = this.socket;
      if (data.type === MSG_TYPE.lobby) {
         this.io.emit("chat", { user: socket.userId, msg: data.msg });
      }
   }
}

module.exports = GameSocket;
