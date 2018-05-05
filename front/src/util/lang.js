import localStore from "./localStore";

var lang = {}

var table = {
   // 登录
   'ID': ['帐号'],
   'Nickname': ['昵称'],
   'Password': ['密码'],
   'Repeat Password': ['再次重入密码'],
   'Login': ['登录'],
   'Register': ['注册'],
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
   'Quit': ['退出'],
   // 聊天
   'Lobby Chat': ['大厅聊天'],
   'I say': ['我说'],
   'enter...': ['进来了。。。'],
   'left...': ['走了。。。'],
   'enterRoom': ['进入了房间', 'enter room'],
   'leftRoom': ['离开了房间', 'left room'],
   'System message': ['系统消息'],
   'Today': ['今天'],
   'Yestoday': ['昨天'],
   'speed40Score': ['%1完成了一次竞速40行，用时%2秒', '%1 finish sprint 40L use time: %2'],
   'dig18Score': ['%1完成了一次挖掘18行，用时%2秒', '%1 finish dig race 18L use time: %2'],
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
   Sign: ['签名'],
   'Last login': ['最后登录'],
   ': ': ['： '],
   'None': ['无'],
   'Secs': ['秒'],
   'Type': ['类型'],
   'Last Games': ['最近游戏'],
   'Date': ['日期'],
   // 菜单
   'Sprint': ['竞速'],
   'Dig': ['挖掘'],
   'Restart': ['重来'],
   'End': ['结束'],
   // 游戏
   'READY': ['准备'],
   'GO': ['开始'],
   'Time': ['时间'],
   'Speed': ['速度'],
   'Pieces': ['块数'],
   'Lines': ['消行'],
   'Remain': ['剩余'],
   'Personal Best': ['个人最佳'],
   'Game Over': ['游戏结束'],
   'Waiting': ['等待中'],
   'Replay': ['回放'],
   // 对战
   'Ready': ['准备'],
   'Win': ['赢了'],
   'Lose': ['输了'],
   'Attack': ['攻击'],
   'Winner': ['赢家'],
   'battleNobody': ['没人', 'Nobody'],
}

/**
 * zh: 0
 * en: 1
 */
lang.idx = localStore.get('lang', 1);
lang.init = (idx) => {
   if (idx === undefined) {
      return;
   }
   lang.idx = idx;
   localStore.set('lang', idx);
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