import Listeners from '../util/Listeners';

export default class UserManager {
   constructor() {
      // 所有用户
      this.users = {};
      this.userCount = 0;
      // 用户信息
      this.user = null;
      // 监听
      this.updateUsersListeners = new Listeners();
   }
   get userId() {
      if (this.user) {
         return this.user.id;
      }
      return null;
   }
   getUserCount() {
      this.userCount = 0;
      for (var i in this.users) {
         this.userCount++;
      }
   }
   initUsers(users) {
      this.users = users;
      this.updateUsersListeners.execute();
      this.getUserCount();
   }
   setUser(user) {
      this.users[user.id] = user;
      this.getUserCount();
      this.updateUsersListeners.execute();
   }
   removeUser(userId) {
      delete this.users[userId];
      this.getUserCount();
      this.updateUsersListeners.execute();
   }
}