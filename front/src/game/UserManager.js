import Listeners from '../util/Listeners';

export default class UserManager {
   constructor() {
      // 所有用户
      this.users = {};
      this.userCount = 0;
      // 用户信息
      this.user = null;
      this.friendCount = 0;
      this.friendOnlineCount = 0;
      // 监听
      this.updateUsersListeners = new Listeners();
   }
   get userId() {
      if (this.user) {
         return this.user.id;
      }
      return null;
   }
   get friends() {
      if (this.user) {
         return this.user.friends;
      }
      return null;
   }
   isUserOnline(id) {
      return this.users[id] ? true : false;
   }
   /**
    * 初始化在线玩家和好友
    */
   initUsers(user, users) {
      this.user = user;
      user.setting = user.setting || {};
      this.users = users;
      this.updateUserCount();
   }
   /**
    * 更新用户
    */
   updateUserCount() {
      // 在线用户数量
      this.userCount = Object.keys(this.users).length;
      // 好友数量
      this.friendCount = 0;
      // 在线好友数量
      this.friendOnlineCount = 0;
      for (var k in this.friends) {
         this.friendCount++;
         if (this.users[k]) {
            this.friendOnlineCount++;
         }
      }
      this.updateUsersListeners.execute();
   }
   setUser(user) {
      this.users[user.id] = user;
      this.updateUserCount();
   }
   removeUser(userId) {
      delete this.users[userId];
      this.updateUserCount();
   }
   /**
    * 更新好友
    */
   setFriend(friend) {
      if (!friend) {
         // 补加好友时会出现
         return;
      }
      this.user.friends[friend.id] = friend;
      this.updateUserCount();
   }
   removeFriend(friendId) {
      delete this.user.friends[friendId];
      this.updateUserCount();
   }
}