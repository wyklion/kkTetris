
var Tools = require('./Tools');
var OPERTABLE = require('./OperTable');
var OperEnum = require('./enum/OperEnum');

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
         players: [userId],
         watchers: [],
         ready: {},
      };
      return idx;
   }
   joinRoom(roomId, userId, watch) {
      var room = this.rooms[roomId];
      if (room) {
         if (!watch) {
            if (room.players.length == 1) {
               room.players.push(userId);
               return { err: null };
            }
            else
               return { err: "room " + roomId + " is empty." };
         }
         else if (room.players.length == 2) {
            room.watchers.push(userId);
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
         var idx = room.players.indexOf(userId);
         if (idx > -1) {
            room.players.splice(idx, 1);
            room.ready = {};
            if (room.players.length === 0) {
               delete this.rooms[roomId];
               return { err: null, delRoom: true, watch: false };
            }
            else
               return { err: null, delRoom: false, watch: false };
         }
         else {
            // 是不是旁观玩家
            var watchIdx = room.watchers.indexOf(userId);
            if (watchIdx > -1) {
               room.watchers.splice(watchIdx, 1);
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
      var idx = room.players.indexOf(userId);
      var watchIdx = room.watchers.indexOf(userId);
      if (idx > -1) {
         room.players.splice(idx, 1);
         room.ready = {};
         // socket.broadcast.to("room" + roomId).emit('roomInfo', { room: room, userId: userId, join: false, watch: false });
         if (room.playing) {
            room.playing = false;
            // 数据库记录，用户游戏中断线
            // mongo.updateAddValue("users", { id: userId }, { disconnect: 1 });
         }
         if (room.players.length === 0) {
            delete this.rooms[roomId];
         }
      }
      else if (watchIdx > -1) {
         room.watchers.splice(watchIdx, 1);
         // socket.broadcast.to("room" + roomId).emit('roomInfo', { room: room, userId: userId, join: false, watch: true });
      }
   }
   getOtherUserId(room, userId) {
      if (room.players.length == 2) {
         return room.players[0] == userId ? room.players[1] : room.players[0];
      }
      return null;
   }
   /**
    * 玩家准备
    */
   userReady(gameSocket) {
      if (gameSocket.roomId === null) return;
      var room = this.rooms[gameSocket.roomId];
      if (!room) return;
      // 准备状态
      room.ready[gameSocket.userId] = true;
      var otherUser = this.getOtherUserId(room, gameSocket.userId);
      console.log("room", gameSocket.roomId, "user", gameSocket.userId, "is ready...");
      if (otherUser) {
         if (room.ready[otherUser]) {
            // 如果对方也准备了就开始游戏
            this.startBattle(room, gameSocket);
            // mongo.insertOne("gameinfo", { id: socket.userId, id2: otherUser, type: "vsGame", roomId: gameSocket.roomId, time: Tools.getTime() })
         }
      }
   }
   /**
    * 开始对战
    */
   startBattle(room, gameSocket) {
      room.win = null;
      room.playing = true;
      room.seed = Math.floor(Math.random() * 50000);
      gameSocket.io.to("room" + room.id).emit("battle", { oper: OperEnum.start, seed: room.seed });
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
      socket.emit("onOperation", { oper: OperEnum.gameover, result: { win: otherUser, lose: socket.userId } });
      socket.broadcast.to("room" + socket.roomId).emit('onOperation', { oper: OperEnum.gameover, result: { win: otherUser, lose: socket.userId } });
      console.log("room", socket.roomId, "user", socket.userId, "lose", otherUser, "win");
      mongo.updateAddValue("users", { id: socket.userId }, { lose: 1 });
      mongo.updateAddValue("users", { id: otherUser }, { win: 1 });
   }
};

module.exports = RoomManager;