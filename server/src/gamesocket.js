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

var GameSocket = function (app, server) {
   this.mongoStore = app.mongoStore;
   this.sessionMidleware = app.sessionMidleware;
   this.io = new SocketIO();
   this.io.attach(server);
   // this.io.attach(httpServer);
   this.session = null;
   this.init();

   this.users = [];
   this.roomManager = new RoomManager();
};
GameSocket.prototype = {
   constructor: GameSocket,
   init: function () {
      var _this = this;
      //this.io.use(function(socket, next) {
      //    //console.log("sesseion 1:",socket.request.session);
      //    //console.log("cookie 1", socket.request.headers.cookie);
      //    _this.sessionMidleware(socket.request, {}, next);
      //});
      //this.io.use(function(socket, next){
      //    //console.log("sesseion 2:",socket.request.session);
      //    if(!socket.request.headers.cookie)
      //        return;
      //    //console.log("cookie 2",socket.request.headers.cookie);
      //    socket.request.cookie = require('express/node_modules/cookie').parse(socket.request.headers.cookie);
      //    var connect_sid = socket.request.cookie['connect.sid'];
      //    var sid = '';
      //    if(connect_sid){
      //        sid = connect_sid.split(':')[1].split('.')[0];
      //        _this.mongoStore.get(sid, function(error, session){
      //            if (error || !session) {
      //                //console.log("io auth error:", error);
      //                // if we cannot grab a session, turn down the connection
      //                console.log(error.message);
      //            }
      //            else {
      //                console.log("io session:", sid, session);
      //                // save the session data and accept the connection
      //                socket.handshake.session = session;
      //                next();
      //            }
      //        });
      //    }
      //    else{
      //        console.log('nosession');
      //    }
      //    next();
      //});
      this.io.set('authorization', function (handshakeData, callback) {
         if (!handshakeData.headers.cookie)
            return;
         // 通过客户端的cookie字符串来获取其session数据
         handshakeData.cookie = require('express-session/node_modules/cookie').parse(handshakeData.headers.cookie);
         var connect_sid = handshakeData.cookie['connect.sid'];
         //console.log("conid:", connect_sid, "auth:", handshakeData.cookie);
         var sid = '';
         if (connect_sid) {
            sid = connect_sid.split(':')[1].split('.')[0];
            _this.mongoStore.get(sid, function (error, session) {
               if (error || !session) {
                  //console.log("io auth error:", error);
                  // if we cannot grab a session, turn down the connection
                  callback(error, false);
               }
               else {
                  //console.log("io session:", sid, session);
                  // save the session data and accept the connection
                  handshakeData.headers.session = session;
                  callback(null, true);
               }
            });
         }
         else {
            callback('nosession');
         }
      });
   },
   start: function () {
      this.io.on('connection', this.onConnection.bind(this));
      //mongo.find("users", {id:"kk"}, function(result){
      //    console.log(result);
      //})
   },
   onConnection: function (socket) {
      //console.log("connect session:", session);
      var _this = this;
      var session = socket.request.headers.session;
      if (!session || !session.user) return;
      socket.userId = session.user.id;
      console.log(socket.userId, "connected... " + socket.id);
      mongo.find("users", { id: socket.userId }, function (result) {
         if (result.length > 0) {
            _this.onDataConnection(result[0], socket);
         }
         else {
            socket.emit('onConnection', { err: "Can't find user when connect..." });
            console.log("Can't find user when connect...");
         }
      })
   },
   onDataConnection: function (userData, socket) {
      if (this.users.indexOf(socket.userId) === -1)
         this.users.push(socket.userId);
      socket.join("lobby");
      socket.emit('onConnection', { err: null, user: userData, users: this.users, rooms: this.roomManager.getRooms() });
      socket.broadcast.emit('lobbyInfo', { err: null, type: 'addUser', user: socket.userId });
      // socket.broadcast.to("lobby").emit('lobbyInfo', { err: null, users: this.users });

      this.onDisconnect(socket);
      this.onCreateRoom(socket);
      this.onJoinRoom(socket);
      this.onExitRoom(socket);

      this.onPlaying(socket);
      this.onSingle(socket);

      this.onSetting(socket);
      this.onMsg(socket);
   },
   onDisconnect: function (socket) {
      var _this = this;
      socket.on('disconnect', function () {
         var idx = _this.users.indexOf(socket.userId);
         if (idx > -1) {
            console.log(socket.userId, "disconnect");
            _this.users.splice(idx, 1);
            _this.roomManager.userLeave(socket);
            socket.broadcast.emit('lobbyInfo', { err: null, type: 'removeUser', user: socket.userId });
         }
      });
   },
   onCreateRoom: function (socket) {
      var _this = this;
      socket.on('createRoom', function (data) {
         var idx = _this.roomManager.createRoom(socket.userId);
         socket.roomId = idx;
         socket.leave("lobby");
         socket.join("room" + socket.roomId);
         socket.emit("onCreateRoom", { err: null, room: _this.roomManager.getRoom(idx) });
         socket.broadcast.send('lobbyInfo', { err: null, type: 'setRoom', room: _this.roomManager.getRoom(idx) });
         console.log(socket.userId, "createRoom", socket.roomId);
         mongo.insertOne("gameinfo", { id: socket.userId, type: "createRoom", roomId: idx, time: Tools.getTime() })
      });
   },
   onJoinRoom: function (socket) {
      var _this = this;
      socket.on('joinRoom', function (data) {
         var result = _this.roomManager.joinRoom(data.roomId, socket.userId, data.watch);
         if (!result.err) {
            socket.roomId = data.roomId;
            socket.emit("onJoinRoom", { err: null, room: _this.roomManager.getRoom(socket.roomId), watch: data.watch });
            console.log(socket.userId, data.watch ? "watchRoom" : "joinRoom", socket.roomId);
            socket.leave("lobby");
            socket.join("room" + socket.roomId);
            socket.broadcast.emit('lobbyInfo', { err: null, type: 'setRoom', room: _this.roomManager.getRoom(socket.roomId) });
            // socket.broadcast.to("lobby").emit('lobbyInfo', { rooms: _this.roomManager.getRooms() });
            socket.broadcast.to("room" + socket.roomId).emit('roomInfo', { room: _this.roomManager.getRoom(socket.roomId), userId: socket.userId, join: true, watch: data.watch });
            // 通知房间内人员
            _this.io.to("room" + socket.roomId).emit('msg', socket.userId + '加入了房间', _this.roomManager.getRoom(socket.roomId));
            mongo.insertOne("gameinfo", { id: socket.userId, type: data.watch ? "watchRoom" : "joinRoom", roomId: socket.roomId, time: Tools.getTime() })
         }
         else {
            socket.emit("onJoinRoom", { err: result.err })
         }
      });
   },
   onExitRoom: function (socket) {
      var _this = this;
      socket.on('exitRoom', function (data) {
         var roomId = socket.roomId;
         var result = _this.roomManager.exitRoom(roomId, socket.userId, data.watch);
         if (!result.err) {
            socket.leave("room" + roomId);    // 退出房间
            socket.join("lobby");
            console.log(socket.userId, "exit room", roomId);
            _this.io.to("room" + roomId).emit('msg', socket.userId + '退出了房间', _this.roomManager.getRoom(roomId));
            if (result.delRoom) {
               socket.broadcast.emit('lobbyInfo', { err: null, type: 'removeRoom', roomId: roomId });
               // socket.broadcast.to("lobby").emit('lobbyInfo', { rooms: _this.roomManager.getRooms() });
            }
            else {
               socket.broadcast.emit('lobbyInfo', { err: null, type: 'setRoom', room: _this.roomManager.getRoom(roomId) });
               socket.broadcast.to("room" + socket.roomId).emit('roomInfo', { room: _this.roomManager.getRoom(roomId), userId: socket.userId, join: false, watch: data.watch });
            }
            socket.roomId = null;
            socket.emit("onExitRoom", { err: null, result: "ok" });
            // socket.emit("lobbyInfo", { users: _this.users, rooms: _this.roomManager.getRooms() });
            //mongo.insertOne("gameinfo", {id:socket.userId, type:"exitRoom", roomId:roomId, time:Tools.getTime()})
         }
         else
            socket.emit("onExitRoom", { err: result.err });
      });
   },
   onPlaying: function (socket) {
      var _this = this;
      socket.on('operation', function (data) {
         var oper = data.oper;
         if (oper === OPERTABLE.dead) {
            _this.roomManager.userDead(socket);
            return;
         }
         data.userId = socket.userId;
         socket.broadcast.to("room" + socket.roomId).emit('onOperation', data);
         if (oper === OPERTABLE.ready) {
            _this.roomManager.userReady(socket);
         }
      })
   },
   onSingle: function (socket) {
      var _this = this;
      socket.on('single40', function (data) {
         mongo.updateAddValue("users", { id: socket.userId }, { single40Times: 1 });
         mongo.updateOne("users", { id: socket.userId, single40Best: { "$gt": data.time } }, { single40Best: data.time });
      })
   },
   onSetting: function (socket) {
      var _this = this;
      socket.on('setting', function (data) {
         if (data.type === "keyboard") {
            mongo.updateOne("users", { id: socket.userId }, { keyboard: data.keyboard });
         }
         else if (data.type === "setting") {
            mongo.updateOne("users", { id: socket.userId }, { setting: data.setting });
         }
      })
   },
   onMsg: function (socket) {
      var _this = this;
      socket.on('chat', function (data) {
         if (data.type === MSG_TYPE.lobby) {
            socket.broadcast.to("lobby").emit("chat", { user: socket.userId, msg: data.msg });
         }
      })
   },
}

module.exports = GameSocket;
