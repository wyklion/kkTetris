import gameManager from './GameManager';

export default class BattleManager {
   // constructor() {
   //    this.otherId = null;
   //    this.userId = gameManager.userManager.userId;
   //    this.ready = false;
   //    this.otherReady = false;
   //    this.roomIdj = gameManager.roomManager.roomId;

   //    gameManager.roomManager.updateRoomsListeners.add(this.onUpdateRooms);

   // }
   // onUpdateRooms = (room) => {
   //    if (!room || room.id !== this.roomId) {
   //       return;
   //    }

   // }
   // update() {
   //    var room = gameManager.roomManager.room;
   //    if (!room) {
   //       return;
   //    }
   //    this.otherId = this.userId === room.players[0] ? room.players[1] : room.players[0];
   //    this.ready = room.ready[this.userId];
   //    this.otherReady = room.ready[this.otherId];
   //    gameManager.battleListener.execute();
   // }
   // setOtherReady(ready) {
   //    this.otherReady = ready;
   // }
   // dispose() {
   //    gameManager.roomManager.updateRoomsListeners.remove(this.onUpdateRooms);

   // }
}
