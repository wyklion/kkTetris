import Listeners from '../util/Listeners';
import gameManager from './GameManager';

export default class RoomManager {
   constructor() {
      // 所有房间
      this.rooms = {};
      // 当前所在房间id
      this.roomId = null;
      this.watch = false;
      this.hostId = null;
      this.hostReady = false;
      this.hostScore = 0;
      this.otherId = null;
      this.otherReady = false;
      this.otherScore = 0;

      // 监听
      this.updateRoomsListeners = new Listeners();
      this.updateBattleListeners = new Listeners();
      this.newBattleListeners = new Listeners();
   }
   get room() {
      if (this.roomId == null) {
         return null;
      }
      return this.rooms[this.roomId];
   }
   get(roomId) {
      return this.rooms[roomId];
   }
   /**
    * 创建和加入房间会调用
    */
   setRoomId(roomId) {
      this.roomId = roomId;
      // 所在房间处理
      this.updateRoom();
   }
   /**
    * 所在房间更新
    */
   updateRoom() {
      var room = this.room;
      if (room) {
         this.watch = room.watchers.indexOf(gameManager.userId) > -1;
         var hostId;
         if (this.watch) {
            hostId = room.players.length > 0 ? room.players[0] : null;
         } else {
            hostId = gameManager.userId;
         }
         var otherId = this.getRoomOtherUser(hostId);
         // 换人分数清空，离开不清空。
         if ((hostId && hostId !== this.hostId) || (otherId && otherId !== this.otherId)) {
            this.hostScore = room.score[hostId] || 0;
            this.otherScore = room.score[otherId] || 0;
            this.newBattleListeners.execute();
         }
         this.hostId = hostId;
         this.otherId = otherId;
         if (this.otherId === null) {
            gameManager.clearOtherTetris();
            this.otherReady = false;
         } else {
            this.otherReady = room.ready[this.otherId];
         }
         if (this.hostId === null) {
            gameManager.clearMyTetris();
            this.hostReady = false;
         } else {
            this.hostReady = room.ready[this.hostId];
         }
      }
      this.updateBattleListeners.execute();
   }
   initRooms(rooms) {
      this.rooms = rooms;
      this.updateRooms();
   }
   setRoom(room) {
      this.rooms[room.id] = room;
      this.updateRooms();
      // 所在房间处理
      if (room.id === this.roomId) {
         this.updateRoom();
      }
   }
   removeRoom(roomId) {
      if (this.roomId === roomId) {
         this.roomId = null;
      }
      delete this.rooms[roomId];
      this.updateRooms();
   }
   /**
    * 房间变化处理
    */
   updateRooms() {
      this.updateRoomsListeners.execute();
   }
   isUserInRoom(userId, roomId) {
      var room = this.get(roomId);
      if (!room) {
         return false;
      }
      if (room.players.indexOf(userId) > -1 || room.watchers.indexOf(userId) > -1) {
         return true;
      }
      return false;
   }
   //================下面是对战房间相关================
   /**
    * 自己的操作
    */
   exitRoom() {
      this.roomId = null;
   }
   /**
    * 获取房间另一个玩家
    */
   getRoomOtherUser(userId) {
      var room = this.room;
      if (!room || !userId) return null;
      if (room.players.length < 2) return null;
      var otherUser = userId === room.players[0] ? room.players[1] : room.players[0];
      return otherUser;
   }
   /**
    * 别人准备，也有自己
    */
   userReady(data) {
      var room = this.room;
      if (!room) return null;
      if (this.otherId === data.userId) {
         this.otherReady = data.data;
         if (data.data) {
            gameManager.clearOtherTetris();
         }
      } else if (this.hostId === data.userId) {
         this.hostReady = data.data;
         if (data.data) {
            gameManager.clearMyTetris();
            // 主机准备才清空对战数据
            gameManager.render.battle.reset();
         }
         gameManager.main.battleReady(data.data);
      }
      this.updateBattleListeners.execute();
   }
   /**
    * 单局结束，状态还原，记分
    */
   battleEnd(data) {
      var room = this.room;
      if (!room) return null;
      room.ready = {};
      this.hostReady = false;
      this.otherReady = false;
      if (data.winner === this.hostId) {
         this.hostScore++;
      } else {
         this.otherScore++;
      }
      room.playing = false;
      gameManager.render.battle.renderBattle();
      this.updateBattleListeners.execute();
   }
}
