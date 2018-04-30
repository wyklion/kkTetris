import Game from './Game';
import gameManager from './GameManager';
import socket from '../socket/GameSocket';
import Tetris from '../logic/Tetris';

export default class BattleGame extends Game {
   constructor(seed) {
      super();
      this.seed = seed;
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
      this.operate(data.oper, tetris);
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
