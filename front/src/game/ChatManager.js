import Listeners from '../util/Listeners';
import socket from '../socket/GameSocket';
import { MSG_TYPE } from '../socket/OperTable';

export default class ChatManager {
   constructor() {
      // 消息
      this.messages = [];

      // 监听
      this.updateChatListeners = new Listeners();
   }
   setMessages(msgs) {
      this.messages = msgs;
      for (var i = 0; i < msgs.length; i++) {
         msgs[i].idx = i;
         msgs[i].msg = decodeURI(msgs[i].msg);
      }
      this.msgIdx = msgs.length;
   }
   add(data) {
      data.idx = this.msgIdx++;
      data.msg = decodeURI(data.msg);
      this.messages.push(data);
      this.updateChatListeners.execute(data);
   }
   sendLobby(msg) {
      var data = {
         to: MSG_TYPE.lobby,
         msg: msg
      }
      socket.chat(data);
   }
   getMessages() {
      return this.messages;
   }
}
