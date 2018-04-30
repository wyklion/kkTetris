import Listeners from '../util/Listeners';

export default class RoomManager {
   constructor() {
      // 所有房间
      this.rooms = {};
      // 当前所在房间id
      this.roomId = null;

      // 监听
      this.updateRoomsListeners = new Listeners();
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
   initRooms(rooms) {
      this.rooms = rooms;
      this.updateRoomsListeners.execute();
   }
   setRoom(room) {
      this.rooms[room.id] = room;
      this.updateRoomsListeners.execute();
   }
   removeRoom(roomId) {
      delete this.rooms[roomId];
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
   /**
    * 自己的操作
    */
   exitRoom() {
      this.roomId = null;
   }
}
