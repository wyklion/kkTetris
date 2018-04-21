import Game from './Game';
import gameManager from './GameManager';
import socket from '../socket/GameSocket';
import Tools from '../util/Tools';

export default class DigGame extends Game {
   constructor(lineCount) {
      super();
      this.gameType = 'dig';
      this.lineCount = lineCount;
   }
   start() {
      // 延时上涨行
      this.delayAddTrash = 0;
      // 已清垃圾行
      this.clearTrashCount = 0;
      // 已涨垃圾行，起始为9
      this.addedCount = 9;
      this.tetris.playData.reset();
      this.tetris.init();
      this.tetris.raiseTrash(9);
      this.tetris.start();
   }
   onLock(clearLine, clearTrash) {
      if (clearTrash > 0) {
         this.clearTrashCount += clearTrash;
         this.tetris.renderer.renderSpecialData(this.lineCount - this.clearTrashCount);
         if (this.clearTrashCount >= this.lineCount) {
            this.tetris.gameOver(true);
            socket.sendDigScore(this.lineCount, this.tetris.playData.time);
            return;
         }
         this.delayAddTrash += clearTrash;
         // 最多不能涨超过总行数和开头涨的9行。
         if (this.addedCount + this.delayAddTrash > this.lineCount) {
            this.delayAddTrash = this.lineCount - this.addedCount;
         }
      } else {
         if (this.delayAddTrash > 0) {
            this.tetris.raiseTrash(this.delayAddTrash);
            this.addedCount += this.delayAddTrash;
            this.delayAddTrash = 0;
         }
      }
   }
   gameOver(win = false) {
      super.gameOver(win);
      var data = Tools.cloneObject(this.tetris.playData);
      data.gameType = this.gameType;
      data.win = win;
      data.lineCount = this.lineCount;
      gameManager.onGameOver(win, data);
   }
}