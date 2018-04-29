import Game from './Game';
import gameManager from './GameManager';
import socket from '../socket/GameSocket';
import Tools from '../util/Tools';

export default class SpeedGame extends Game {
   constructor(lineCount) {
      super();
      this.gameType = 'speed';
      this.lineCount = lineCount;
      this.hasReplay = true;
   }
   onLock(clearLine, clearTrash) {
      if (clearLine > 0) {
         this.tetris.renderer.renderSpecialData(this.lineCount - this.tetris.playData.lines);
      }
   }
   checkOver() {
      if (this.tetris.playData.lines >= this.lineCount) {
         this.tetris.gameOver(true);
         return true;
      }
      return false;
   }
   gameOver(win = false) {
      super.gameOver(win);
      var data = Tools.cloneObject(this.tetris.playData);
      data.gameType = this.gameType;
      data.win = win;
      data.lineCount = this.lineCount;
      data.hasReplay = this.hasReplay;
      data.isReplay = this.isReplay;
      // 发送成绩给服务器
      if (win && !this.isReplay) {
         // 40行发送时间，块数，记录消息。
         var sendData = {
            time: parseFloat(data.time.toFixed(2)),
            count: data.count,
         };
         if (this.hasReplay) {
            sendData.replay = this.recorder.encode();
         }
         socket.sendSpeed40(sendData);
      }
      gameManager.onGameOver(win, data);
   }
}