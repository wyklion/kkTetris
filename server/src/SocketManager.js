/**
 * Created by kk on 2018/4/12.
 */

var SocketIO = require('socket.io');
var Tools = require('./Tools');
var RoomManager = require('./RoomManager');
var UserManager = require('./UserManager');
var ChatManager = require('./ChatManager');
var OPERTABLE = require('./OperTable');
var GameSocket = require('./GameSocket');

var MSG_TYPE = {
   lobby: 0,
   room: 1,
};

class SocketManager {
   constructor(app, server) {
      this.mongoStore = app.mongoStore;
      this.sessionMidleware = app.sessionMidleware;
      this.io = new SocketIO();
      this.io.attach(server);
      // this.io.attach(httpServer);
      this.session = null;
      this.init();

      this.userManager = new UserManager();
      this.roomManager = new RoomManager();
      this.chatManager = new ChatManager();

      this.gameSockets = [];
   }
   init() {
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
   }
   start() {
      this.io.on('connection', (socket) => {
         var session = socket.request.headers.session;
         if (!session || !session.user) return;
         var userId = session.user.id;
         mongo.find("users", { id: userId }, (result) => {
            if (result.length > 0) {
               if (this.userManager.has(userId)) {
                  console.log(userId, 'already connected...');
                  socket.emit('onConnection', { err: '该用户已登录！' });
                  socket.disconnect(true);
                  return;
               } else {
                  console.log(userId, "connected... " + socket.id);
                  var gameSocket = new GameSocket(this, socket, result[0]);
                  this.gameSockets.push(gameSocket);
               }
            }
            else {
               socket.emit('onConnection', { err: '找不到该用户！' });
               socket.disconnect(true);
               console.log(userId, 'is not exists...');
            }
         })
      });
   }
   removeSocket(socket) {
      var idx = this.gameSockets.indexOf(socket);
      if (idx > -1) {
         this.gameSockets.splice(idx, 1);
      }
   }
}

module.exports = SocketManager;
