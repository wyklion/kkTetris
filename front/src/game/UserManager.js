import Listeners from '../util/Listeners';

export default class UserManager {
   constructor() {
      // 所有用户
      this.users = {};
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
   initUsers(users) {
      this.users = users;
      this.updateUsersListeners.execute();
   }
   setUser(user) {
      this.users[user.id] = user;
      this.updateUsersListeners.execute();
   }
   removeUser(userId) {
      delete this.users[userId];
      this.updateUsersListeners.execute();
   }
}