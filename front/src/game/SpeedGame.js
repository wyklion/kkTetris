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
         if (!this.isReplay) {
            socket.sendSpeed40(this.tetris.playData.time);
         }
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
      gameManager.onGameOver(win, data);
   }
}