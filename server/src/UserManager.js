

class UserManager {
   constructor() {
      this.users = {};
   }
   add(userId) {
      this.users[userId] = { id: userId };
   }
   remove(userId) {
      if (this.users[userId]) {
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
};

module.exports = UserManager;