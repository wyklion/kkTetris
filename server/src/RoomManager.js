
var Tools = require('./Tools');
var OPERTABLE = require('./OperTable');

class RoomManager {
   constructor() {
      this.rooms = {};
      this.currentRoomIdx = 0;
   }
   getRooms() {
      return this.rooms;
   }
   getRoom(id) {
      return this.rooms[id];
   }
   createRoom(userId) {
      var idx = this.currentRoomIdx++;
      this.rooms[idx] = {
         id: idx,
         playUsers: [userId],
         watchUsers: [],
         ready: {},
      };
      return idx;
   }
   joinRoom(roomId, userId, watch) {
      var room = this.rooms[roomId];
      if (room) {
         if (!watch) {
            if (room.playUsers.length == 1) {
               room.playUsers.push(userId);
               return { err: null };
            }
            else
               return { err: "room " + roomId + " is empty." };
         }
         else if (room.playUsers.length == 2) {
            room.watchUsers.push(userId);
            return { err: null };
         }
         else
            return { err: "room " + roomId + " is not full." };
      }
      else
         return { err: "room " + roomId + " not exists." }
   }
   exitRoom(roomId, userId, watch) {
      var room = this.rooms[roomId];
      if (room) {
         // 是不是座上玩家
         var idx = room.playUsers.indexOf(userId);
         if (idx > -1) {
            room.playUsers.splice(idx, 1);
            room.ready = {};
            if (room.playUsers.length === 0) {
               delete this.rooms[roomId];
               return { err: null, delRoom: true, watch: false };
            }
            else
               return { err: null, delRoom: false, watch: false };
         }
         else {
            // 是不是旁观玩家
            var watchIdx = room.watchUsers.indexOf(userId);
            if (watchIdx > -1) {
               room.watchUsers.splice(watchIdx, 1);
               return { err: null, delRoom: false, watch: true };
            }
            else
               return { err: "who exits room?" };
         }
      }
      else
         return { err: "room " + roomId + " not exists." }
   }
   userLeave(roomId, userId, socket) {
      var room = this.rooms[roomId];
      if (!room) {
         return;
      }
      var idx = room.playUsers.indexOf(userId);
      var watchIdx = room.watchUsers.indexOf(userId);
      if (idx > -1) {
         room.playUsers.splice(idx, 1);
         room.ready = {};
         socket.broadcast.to("room" + roomId).emit('roomInfo', { room: room, userId: userId, join: false, watch: false });
         if (room.playing) {
            room.playing = false;
            // 数据库记录，用户游戏中断线
            mongo.updateAddValue("users", { id: userId }, { disconnect: 1 });
         }
         if (room.playUsers.length === 0) {
            delete this.rooms[roomId];
         }
      }
      else if (watchIdx > -1) {
         room.watchUsers.splice(watchIdx, 1);
         socket.broadcast.to("room" + roomId).emit('roomInfo', { room: room, userId: userId, join: false, watch: true });
      }
   }
   getOtherUserId(room, userId) {
      if (room.playUsers.length == 2) {
         return room.playUsers[0] == userId ? room.playUsers[1] : room.playUsers[0];
      }
      return null;
   }
   userReady(socket) {
      if (socket.roomId == null || socket.roomId == undefined) return;
      var room = this.rooms[socket.roomId];
      if (!room) return;
      room.ready[socket.userId] = true;
      var otherUser = this.getOtherUserId(room, socket.userId);
      if (otherUser) {
         if (room.ready[otherUser]) {
            room.win = null;
            room.playing = true;
            var randomShapes = Tools.RandomGenerator();
            socket.emit("onOperation", { oper: OPERTABLE.start, shapes: randomShapes });
            socket.broadcast.to("room" + socket.roomId).emit("onOperation", { oper: OPERTABLE.start, shapes: randomShapes });
            mongo.insertOne("gameinfo", { id: socket.userId, id2: otherUser, type: "vsGame", roomId: socket.roomId, time: Tools.getTime() })
         }
      }
      console.log("room", socket.roomId, "user", socket.userId, "is ready...");
   }
   userDead(socket) {
      if (socket.roomId == null || socket.roomId == undefined) return;
      var room = this.rooms[socket.roomId];
      if (!room) return;
      room.ready = {};
      room.playing = false;
      if (room.win) return; //already gameover...
      var otherUser = this.getOtherUserId(room, socket.userId);
      room.win = otherUser;
      socket.emit("onOperation", { oper: OPERTABLE.gameover, result: { win: otherUser, lose: socket.userId } });
      socket.broadcast.to("room" + socket.roomId).emit('onOperation', { oper: OPERTABLE.gameover, result: { win: otherUser, lose: socket.userId } });
      console.log("room", socket.roomId, "user", socket.userId, "lose", otherUser, "win");
      mongo.updateAddValue("users", { id: socket.userId }, { lose: 1 });
      mongo.updateAddValue("users", { id: otherUser }, { win: 1 });
   }
};

module.exports = RoomManager;