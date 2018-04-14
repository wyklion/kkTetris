

class ChatManager {
   constructor() {
      this.messages = [];
      this.maxSaveCount = 50;
   }
   add(data) {
      data.time = Date.now();
      this.messages.push(data);
      if (this.messages.length > this.maxSaveCount) {
         this.messages.shift();
      }
   }
   getMessages() {
      return this.messages;
   }
};

exports = module.exports = ChatManager;