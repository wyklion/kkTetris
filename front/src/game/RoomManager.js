import Listeners from '../util/Listeners';
import gameManager from './GameManager';

export default class RoomManager {
   constructor() {
      // 所有房间
      this.rooms = {};
      // 当前所在房间id
      this.roomId = null;
      this.otherId = null;
      this.otherReady = false;

      // 监听
      this.updateRoomsListeners = new Listeners();
      this.updateBattleListeners = new Listeners();
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
      if (this.room) {
         this.otherId = gameManager.getRoomOtherUser();
         this.otherReady = this.room.ready[this.otherId];
         if (this.otherId === null) {
            gameManager.clearOtherTetris();
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
      if (!room) return null;
      if (room.players.length < 2) return null;
      var otherUser = userId === room.players[0] ? room.players[1] : room.players[0];
      return otherUser;
   }
   /**
    * 别人准备
    */
   userReady(data) {
      var room = this.room;
      if (!room) return null;
      this.otherReady = data.data;
      this.updateBattleListeners.execute();
   }
   /**
    * 单局结束
    */
   battleEnd(data) {
      var room = this.room;
      if (!room) return null;
      room.ready = {};
      this.otherReady = false;
      this.updateBattleListeners.execute();
   }
}
