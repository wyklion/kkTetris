import Game from './Game';
import gameManager from './GameManager';
import socket from '../socket/GameSocket';
import Tetris from '../logic/Tetris';
import OperEnum from '../enum/OperEnum';

export default class BattleGame extends Game {
   constructor(seed) {
      super();
      this.seed = seed;
      this.gameType = 'battle';
      this.single = false;
   }
   init() {
      this.otherTetris = new Tetris(this, false);
      var room = this.room = gameManager.roomManager.room;
      this.watch = room.players.indexOf(gameManager.userManager.userId) === -1;
      if (!this.watch) {
         this.hostUser = gameManager.userManager.userId;
         this.otherUser = gameManager.getRoomOtherUser();
         this.setKeyboard();
      }
      else {
         this.tetris.me = false;
         this.hostUser = room.players[0];
         this.otherUser = room.players[1];
         this.playing = room.playing;
      }
      this.tetrs = {};
      this.tetrs[this.hostUser] = this.tetris;
      this.tetrs[this.otherUser] = this.otherTetris;
   }
   onStart() {
      this.otherTetris.ready(this.seed);
   }
   onGo() {
      this.otherTetris.start();
   }
   /**
    * 记录操作，发给服务器
    */
   record(oper, data) {
      socket.battle(oper, data);
   }
   /**
    * 服务器传来的操作
    */
   onOperate(data) {
      var tetris = this.tetrs[data.userId];
      if (!tetris)
         return;
      if (data.oper === OperEnum.attack) {
         // 玩的别家的攻击，自己收到，只可能是主方块区
         this.tetris.hurt(data.data);
      } else if (data.oper === OperEnum.trash) {
         // 别的玩家垃圾状态，只可能是别人，或者旁观的话都可能。
         tetris.trash(data.data);
      } else {
         this.operate(data.oper, tetris);
      }
   }
   /**
    * 游戏结束，只有tetris发来的输，先通知服务器
    */
   gameOver(win = false) {
      super.gameOver(win);
      this.record(OperEnum.dead);
   }
   /**
    * 服务器通知结束
    */
   onGameOver(result) {
      super.gameOver(true);
      var data = {
         gameType: this.gameType,
         host: this.tetris.playData,
         other: this.otherTetris.playData,
         winner: result.winner,
         hostUser: this.hostUser,
         otherUser: this.otherUser,
         watch: this.watch,
      }
      gameManager.battleEnd(data);
   }

   // readyOrPlay() {
   //    if (this.single) {
   //       this.ui.readyOrPlay();
   //       this.tetris.playData.reset();
   //       this.tetris.start();
   //    }
   //    else {
   //       if (!this.playing && !this.ready) {
   //          console.log("ready...");
   //          this.ui.readyOrPlay();
   //          this.ready = true;
   //          this.tetris.init();
   //          socket.operate(OPERTABLE.ready);
   //       }
   //    }
   // }
   // //for watch
   // userReady(userId) {
   //    console.log(userId, "ready");
   //    if (this.hostUser === userId)
   //       this.tetris.init();
   //    else if (this.otherUser === userId)
   //       this.otherTetris.init();
   //    this.ui.userReady(userId);
   // }
   // gameOver(result) {
   //    console.log(result);
   //    this.reset();
   //    this.ui.gameOver(result.win);
   // }
   // lose() {
   //    if (this.single) {
   //       this.reset();
   //    }
   // }
   // reset() {
   //    super.reset();
   //    this.otherTetris.playing = false;
   // }
   // someoneJoined(userId, watch) {
   //    console.log(userId + " joined to ", watch ? "watch" : "play");
   //    if (this.hostUser)
   //       this.otherUser = userId;
   //    else
   //       this.hostUser = userId;
   //    if (!watch) {
   //       this.single = false;
   //       this.ready = false;
   //       this.tetris.init();
   //       this.otherTetris.init();
   //       this.tetris.playData.reset();
   //       this.otherTetris.playData.reset();
   //    }
   //    this.ui.someoneJoined(userId, watch);
   // }
   // someoneLeft(userId, watch) {
   //    console.log(watch ? "watcher " : "player " + userId + " left");
   //    if (!watch) {
   //       this.single = true;
   //       this.ready = false;
   //       if (!this.watch || userId === this.otherUser) {
   //          this.otherUser = null;
   //          this.otherTetris.playData.reset();
   //          this.otherTetris.init();
   //          if (this.playing) {
   //             this.playing = false;
   //             this.tetris.gameOver();
   //          }
   //       }
   //       else {
   //          this.hostUser = null;
   //          this.tetris.playData.reset();
   //          this.tetris.init();
   //          if (this.playing) {
   //             this.playing = false;
   //             this.otherTetris.gameOver();
   //          }
   //       }
   //    }
   //    this.ui.someoneLeft(userId, watch);
   // }
   // trashPool(trash) {
   //    this.tetris.hurt(trash);
   // }
   dispose() {
      super.dispose();
      this.otherTetris.dispose();
      this.otherTetris = null;
   }
}
