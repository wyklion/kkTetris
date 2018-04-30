import Listeners from '../util/Listeners';
import socket from '../socket/GameSocket';
import MsgTypeEnum from '../enum/MsgTypeEnum';

export default class ChatManager {
   constructor() {
      // 大厅消息
      this.messages = [];
      // 房间
      this.roomMsgs = [];
      this.roomMsgId = 0;

      // 监听
      this.updateChatListeners = new Listeners();
   }

   /**
    * 初始化所有大厅消息
    */
   setMessages(msgs) {
      this.messages = msgs;
      for (var i = 0; i < msgs.length; i++) {
         msgs[i].idx = i;
         msgs[i].msg = decodeURI(msgs[i].msg);
      }
      this.msgIdx = msgs.length;
   }

   /**
    * 重置房间消息
    */
   resetRoomMsg() {
      this.roomMsgs.length = 0;
      this.roomMsgId = 0;
      this.updateChatListeners.execute();
   }

   /**
    * 收到消息
    */
   add(data) {
      // console.log(data);
      // 房间消息
      if (data.type === MsgTypeEnum.room) {
         data.idx = this.roomMsgId++;
         this.roomMsgs.push(data);
      }
      // 其他都是大厅消息
      else {
         data.idx = this.msgIdx++;
         data.msg = decodeURI(data.msg);
         this.messages.push(data);
      }
      this.updateChatListeners.execute(data);
   }

   /**
    * 发送大厅聊天消息
    */
   sendLobby(msg) {
      var data = {
         // 大厅免加
         // type: MsgTypeEnum.lobby,
         msg: msg
      }
      socket.chat(data);
   }

   /**
    * 发送大厅聊天消息
    */
   sendRoom(roomId, msg) {
      var data = {
         type: MsgTypeEnum.room,
         roomId: roomId,
         msg: msg
      }
      socket.chat(data);
   }

   getMessages() {
      return this.messages;
   }
   getRoomMsgs() {
      return this.roomMsgs;
   }
}
