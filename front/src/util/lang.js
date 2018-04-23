
var lang = {}

var table = {
   // 主界面
   'KK TETRIS': ['KK俄罗斯方块'],
   'Setting': ['设置'],
   'Style': ['样式'],
   'Sound': ['音效'],
   'Leaderboard': ['排行榜'],
   'Profile': ['个人信息'],
   'Logout': ['退出登录'],
   // 设置
   'Type1': ['类型1'],
   'Type2': ['类型2'],
   'Solid Color': ['纯色'],
   'Keyboard Setting': ['键盘设置'],
   'Save': ['保存'],
   'Cancel': ['取消'],
   // 大厅
   Rooms: ['房间'],
   Friends: ['好友'],
   Online: ['在线'],
   Return: ['返回'],
   'Nickname': ['昵称'],
   'Operation': ['操作'],
   'Nobody': ['空无一人'],
   'No Rooms': ['空无一房'],
   'Info': ['信息'],
   'Delete': ['删除'],
   'No friends': ['没朋友'],
   friendId: ['好友帐号', "Friend's ID"],
   inputFriendId: ['请输入好友帐号！', 'Please input firend\'s id'],
   'Add friend': ['加好友'],
   'Join': ['加入'],
   'Watch': ['观战'],
   'Create Room': ['创建房间'],
   'RoomId': ['房间ID'],
   'Players': ['玩家'],
   // 聊天
   'Lobby Chat': ['大厅聊天'],
   'I say': ['我说'],
   'enter...': ['进来了。。。'],
   'left...': ['走了。。。'],
   'System message': ['系统消息'],
   'Today': ['今天'],
   'Yestoday': ['昨天'],
   'speed40Score': ['%1完成了一次竞速40行，用时%2秒', '%1 finish sprint 40L use time: %2'],
   'dig18Score': ['%1完成了一次挖掘18行，用时%2秒', '%1 finish sprint 40L use time: %2'],
   // 键位
   keyLeft: ['左移', 'Move Left'],
   keyRight: ['右移', 'Move Right'],
   keyDrop: ['硬降', 'Hard Drop'],
   keyDown: ['软降', 'Soft Down'],
   keyRotate: ['逆旋', 'CCW Rotate'],
   keyRotateRight: ['顺旋', 'CW Rotate'],
   keyRotate180: ['180度旋', '180 Rotate'],
   keyRotateHold: ['暂存', 'Hold'],
   keyStart: ['重来/准备', 'Restart/Ready'],
   'Key': ['键位'],
   'DAS': ['首次延时'],
   'Move Delay': ['移动延时'],
   'Soft Down Delay': ['软降延时'],
   // 排行榜
   'Place': ['排名'],
   // 档案
   'PLAYER INFO': ['玩家信息'],
   'GAME INFO': ['游戏信息'],
   'Sprint 40L times': ['竞速40行次数'],
   'Sprint 40L best': ['竞速40行最佳'],
   'Sprint 40L': ['竞速40行'],
   'Dig Race 18L times': ['挖掘18行次数'],
   'Dig Race 18L best': ['挖掘18行最佳'],
   'Dig Race 18L': ['挖掘18行'],
   ID: ['帐号'],
   Sign: ['签名'],
   ': ': ['： '],
   'None': ['无'],
   'Secs': ['秒'],
   // 菜单
   'Sprint': ['竞速'],
   'Dig': ['挖掘'],
   'Restart': ['重来'],
   'End': ['结束'],
   // 游戏
   'Time': ['时间'],
   'Speed': ['速度'],
   'Pieces': ['块数'],
   'Lines': ['消行'],
   'Remain': ['剩余'],
   'Personal Best': ['个人最佳'],
   'Game Over': ['游戏结束'],
   'Waiting': ['等待中'],
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

lang.get = (key, p1, p2, p3) => {
   var str = key;
   if (table[key] && table[key][lang.idx]) {
      str = table[key][lang.idx];
   }
   if (p1) {
      str = str.replace('%1', p1);
   }
   if (p2) {
      str = str.replace('%2', p2);
   }
   return str;
}

export default lang;