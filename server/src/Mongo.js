/**
 * Created by kk on 2016/4/27.
 */

var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://localhost:27017/tetris';

var Mongo = function (callback) {
   MongoClient.connect(url, (err, db) => {
      console.log("连接成功！");
      this.db = db.db("tetris");
      // 重启更新表，仅需一次。
      // this.refreshUser();
      if (callback)
         callback();
   });
};
Mongo.prototype = {
   constructor: Mongo,
   onOpen: function () {

   },
   createNewUser: function (userId, name, password, callback) {
      this.insertOne("users", {
         id: userId, // 帐号
         nick: name, // 昵称
         password: password, // 密码
         sign: '', // 签名
         // 对战信息
         level: 0, // 等级
         score: 0, // 分数
         win: 0, // 胜
         lose: 0, // 负
         disconnect: 0, // 掉线
         // 单人信息
         speed40Times: 0, // 40行次数
         speed40Best: 1000, // 40行最佳
         // 好友
         friends: [],
         // 个人设置
         keyboard: {
            // left: 37, right: 39, down: 70, drop: 40, rotate: 82, rotateRight: 69, rotate180: 87, hold: 84, dasDelay: 120, moveDelay: 20, downDelay: 20
            left: 37, right: 39, down: 32, drop: 40, rotate: 38, rotateRight: null, rotate180: null, hold: null, dasDelay: 120, moveDelay: 20, downDelay: 20
         },
         setting: {
            theme: 0,
         }
      }, function (err, result) {
         if (callback) callback(err, result);
      })
   },
   /**
    * 更新用户表，仅需一次
    */
   refreshUser: function (userId) {
      var c = this.db.collection("users");
      c.updateMany({ "friends": { $exists: true } }, { $set: { "friends": {} } }, function (err, res) {
         if (err) {
            console.log(err);
         } else {
            console.log(res.result.nModified + " 条用户记录被更新");
         }
      });
   },
   /**
    * 查找用户
    */
   findUser: function (userId, callback) {
      this.findOne('users', { id: userId }, callback);
   },
   getUserInfo: function (userId, callback) {

   },
   /**
    * 好友
    */
   addFriend: function (userId, friendId, callback) {
      this.findUser(friendId, (err, friend) => {
         if (err) {
            callback('找不到好友！');
         } else {
            this.findUser(userId, (err, user) => {
               if (err) {
                  callback('找不到用户！');
               } else {
                  if (user.friends[friendId] && friend.friends[userId]) {
                     callback('已经是好友了！');
                  }
                  var newFriend;
                  var add1 = false;
                  if (!user.friends[friendId]) {
                     add1 = true;
                     newFriend = { id: friendId, nick: friend.nick };
                     user.friends[friendId] = newFriend;
                     this.updateOne('users', { id: userId }, { friends: user.friends }, (err, result) => {
                        if (err) {
                           callback('添加好友出错');
                        } else {
                           callback(null, newFriend);
                        }
                     });
                  }
                  if (!friend.friends[userId]) {
                     // 把自己加成对方好友
                     friend.friends[userId] = { id: userId, nick: user.nick };
                     this.updateOne('users', { id: friendId }, { friends: friend.friends }, (err, result) => {
                        // 第一条没执行的时候由这条返回
                        if (!add1) {
                           if (err) {
                              callback('添加好友出错');
                           } else {
                              callback(null, null);
                           }
                        }
                     });
                  }
               }
            });
         }
      });
   },
   checkAddFinish: function () {

   },
   removeFriend: function (userId, friendId, callback) {
      this.findUser(friendId, (err, friend) => {
         if (err) {
            callback('好友不存在！');
         } else {
            this.findUser(userId, (err, user) => {
               if (err) {
                  callback('找不到用户！');
               } else {
                  if (!user.friends[friendId]) {
                     callback('没有这个好友！');
                  } else {
                     delete user.friends[friendId];
                     this.updateOne('users', { id: userId }, { friends: user.friends }, (err, result) => {
                        if (err) {
                           callback('删除好友出错');
                        } else {
                           callback(null, friendId);
                        }
                     });
                  }
               }
            });
         }
      });
   },

   findOption: function (collection, query, options, callback) {
      var c = this.db.collection(collection);
      c.find(query, options).toArray(function (err, result) {
         if (err) {
            console.log('Error:' + err);
            return;
         }
         else
            callback(result);
      });
   },
   find: function (collection, query, callback) {
      var c = this.db.collection(collection);
      var sort;
      if (query.sort) {
         sort = { sort: query.sort };
         delete query.sort;
      }
      else
         sort = { sort: {} };
      c.find(query, sort).toArray(function (err, result) {
         if (err) {
            console.log('Error:' + err);
            return;
         }
         else
            callback(result);
      });
   },
   findOne: function (collection, query, callback) {
      var c = this.db.collection(collection);
      c.find(query).toArray(function (err, result) {
         if (err) {
            callback(err);
         }
         else {
            if (result.length > 0) {
               callback(null, result[0]);
            } else {
               callback('find nothing');
            }
         }
      });
   },
   insertOne: function (collection, doc, callback) {
      var c = this.db.collection(collection);
      c.insertMany([doc], function (err, result) {
         if (callback) callback(err, result);
      });
   },
   insert: function (collection, docs, callback) {
      var c = this.db.collection(collection);
      c.insertMany(docs, function (err, result) {
         if (callback) callback(err, result);
      });
   },
   updateOne: function (collection, query, doc, callback) {
      var c = this.db.collection(collection);
      c.updateOne(query, { $set: doc }, function (err, result) {
         if (callback) callback(err, result);
      });
   },
   updateAddToSet: function (collection, query, doc, callback) {
      var c = this.db.collection(collection);
      c.updateOne(query, { $addToSet: doc }, function (err, result) {
         if (callback) callback(err, result);
      });
   },
   updateAddValue: function (collection, query, doc, callback) {
      var c = this.db.collection(collection);
      c.updateOne(query, { $inc: doc }, function (err, result) {
         if (callback) callback(err, result);
      });
   },
}

module.exports = Mongo;
