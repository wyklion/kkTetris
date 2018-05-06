
var Tools = require('./Tools');
var OPERTABLE = require('./OperTable');
var OperEnum = require('./enum/OperEnum');

// class Score {
//    constructor() {
//       this.score = [0, 0];
//    }
//    init(p1, p2) {
//       this.idx = { p1: 0, p2: 1 };
//       this.score = [0, 0];
//    }
//    addScore(player) {
//       var idx = this.idx[player];
//       if (idx === undefined) {
//          return;
//       }
//       var oldScore = this.score[idx];
//       this.score[idx] = oldScore + 1;
//    }
// }

// class Room {
//    constructor(idx, user){
//      this.id = idx,
//       this.players=[user];
//       this.watchers=[];
//       this.score= new Score();
//       this.ready= {};
//    }
//    addPlayer(player){
//       this.players.push(player);
//    }
// }

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
         score: {},
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
            room.score = {};
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
         room.score = {};
         room.ready = {};
         // socket.broadcast.to("room" + roomId).emit('roomInfo', { room: room, userId: userId, join: false, watch: false });
         if (room.playing) {
            room.playing = false;
            // 数据暂不统计
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
   userReady(gameSocket, ready) {
      if (gameSocket.roomId === null) return;
      var room = this.rooms[gameSocket.roomId];
      if (!room) return;
      // 非正常操作。
      if (room.players.indexOf(gameSocket.userId) === -1) {
         return;
      }
      // 准备状态
      room.ready[gameSocket.userId] = ready;
      var otherUser = this.getOtherUserId(room, gameSocket.userId);
      // console.log("room", gameSocket.roomId, "user", gameSocket.userId, 'ready', ready);
      if (ready && otherUser) {
         if (room.ready[otherUser]) {
            // 如果对方也准备了就开始游戏
            this.startBattle(room, gameSocket);
            // 数据暂不统计
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
   /**
    * 一方gameOver
    */
   userDead(gameSocket) {
      if (gameSocket.roomId === null) return;
      var room = this.rooms[gameSocket.roomId];
      if (!room) return;
      // 重置房间状态
      room.ready = {};
      room.playing = false;
      // 先死的才算输
      if (room.win) return;
      var otherUser = this.getOtherUserId(room, gameSocket.userId);
      room.win = otherUser;
      // 记比分      
      if (!room.score[otherUser]) {
         room.score[otherUser] = 1;
      } else {
         room.score[otherUser] = room.score[otherUser] + 1;
      }
      gameSocket.io.to("room" + room.id).emit('battle', { oper: OperEnum.gameover, winner: otherUser });
      // console.log("room", gameSocket.roomId, "user", gameSocket.userId, "lose", otherUser, "win");
      // 数据暂不统计
      // mongo.updateAddValue("users", { id: gameSocket.userId }, { lose: 1 });
      // mongo.updateAddValue("users", { id: otherUser }, { win: 1 });
   }
};

module.exports = RoomManager;