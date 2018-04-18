
var lang = {}

var table = {
   'KK Tetris': ['KK俄罗斯方块'],
   'Setting': ['设置'],
   'Sound': ['音效'],
   'Keyboard Setting': ['键盘设置'],
   'Leader Board': ['排行榜'],
   'Profile': ['个人信息'],
   'Logout': ['退出登录'],
   'Lobby Chat': ['大厅聊天'],
   'I say': ['我说'],
   'Info': ['信息'],
   'Delete': ['删除'],
   'No friends': ['没朋友'],
   inputFriendId: ['请输入好友帐号！', 'Please input firend\'s id'],
   'Add friend': ['加好友'],
   'Nickname': ['昵称'],
   'Operation': ['操作'],
   friendId: ['好友帐号', "Friend's ID"],
   'Save': ['保存'],
   'Cancel': ['取消'],
   'Key': ['键位'],
   'DAS': ['首次延时'],
   'Move Delay': ['移动延时'],
   'Soft Down Delay': ['软降延时'],

   keyLeft: ['左移', 'Move Left'],
   keyRight: ['右移', 'Move Right'],
   keyDrop: ['硬降', 'Hard Drop'],
   keyDown: ['软降', 'Soft Down'],
   keyRotate: ['逆旋', 'CCW Rotate'],
   keyRotateRight: ['顺旋', 'CW Rotate'],
   keyRotate180: ['180度旋', '180 Rotate'],
   keyRotateHold: ['暂存', 'Hold'],

   Rooms: ['房间'],
   Friends: ['好友'],
   Online: ['在线'],
   Return: ['返回'],
   'PLAYER INFO': ['玩家信息'],
   'GAME INFO': ['游戏信息'],
   'Sprint 40L times': ['竞速40行次数'],
   'Sprint 40L best': ['竞速40行最佳'],
   'Sprint 40L': ['竞速40行'],
   ID: ['帐号'],
   Sign: ['签名'],
   ': ': ['： '],

   'Nobody': ['空无一人'],
   'Time': ['时间'],
   'Speed': ['速度'],
   'Pieces': ['块数'],
   'Lines': ['消行'],
   'Personal Best': ['个人最佳'],
   'Game Over': ['游戏结束'],
   'Waiting': ['等待中'],
   'Join': ['加入'],
   'Watch': ['观战'],
   'No Rooms': ['空无一房'],
   'Create Room': ['创建房间'],
   'RoomId': ['房间ID'],
   'Players': ['玩家'],
   'None': ['无'],
   'Secs': ['秒'],
   'Sprint': ['竞速'],
   'Dig': ['挖掘'],
   'Dig 20L': ['挖掘20行'],
}

/**
 * zh: 0
 * en: 1
 */
lang.idx = 0;
lang.init = (idx) => {
   lang.idx = idx || 0;
}

lang.isEn = () => {
   return lang.idx === 1;
}

lang.get = (key) => {
   if (table[key] && table[key][lang.idx]) {
      return table[key][lang.idx];
   }
   return key;
}

export default lang;