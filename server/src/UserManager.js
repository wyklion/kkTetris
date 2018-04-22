

class UserManager {
   constructor() {
      this.users = {};
   }
   add(userId) {
      this.users[userId] = {
         id: userId,
         roomId: null,
      };
   }
   /**
    * 删掉
    */
   remove(userId) {
      var user = this.get(userId);
      if (user) {
         delete this.users[userId];
      }
   }
   has(userId) {
      var user = this.get(userId);
      return user != null;
   }
   getUsers() {
      return this.users;
   }
   get(userId) {
      return this.users[userId];
   }
   enterRoom(userId, roomId) {
      var user = this.get(userId);
      if (user) {
         user.roomId = roomId;
      }
   }
   leaveRoom(userId) {
      var user = this.get(userId);
      if (user) {
         user.roomId = null;
      }
   }
   getRoom(userId) {
      var user = this.get(userId);
      if (user) {
         if (user.roomId != null) {
            return user.roomId;
         }
      }
      return null;
   }
};

module.exports = UserManager;