

class ChatManager {
   constructor() {
      this.messages = [];
      this.maxSaveCount = 100;
   }
   init() {
      // 从数据库取出最后50条。
      mongo.findOption("chat", {}, {
         limit: this.maxSaveCount, sort: { '_id': -1 }
      }, (err, result) => {
         if (!err) {
            this.messages = result.reverse();
         }
      });
   }
   add(data) {
      if (!data.time) {
         data.time = Date.now();
      }
      this.messages.push(data);
      if (this.messages.length > this.maxSaveCount) {
         this.messages.shift();
      }
      // 存到数据库
      mongo.insertOne("chat", data);
   }
   getMessages() {
      return this.messages;
   }
};

exports = module.exports = ChatManager;