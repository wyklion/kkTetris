
import socket from '../socket/GameSocket';
import { OPERTABLE } from '../socket/OperTable';
import gameManager from './GameManager';
import KeyManager from '../logic/KeyManager';
import Tetris from '../logic/Tetris';

export default class Game {
   constructor() {
      this.setting = {
         attackMode: "0124",
         tspinMode: "3T",
         useBuffer: true,
      }
      this.interval = 1;
      this.time = 0;
      this.playTime = 0;
      this.watch = false;
      this.playing = false;
      this.ready = false;

      this.isPaused = false;
      this.firstGame = true;
      this.tetris = new Tetris(this, true);
      this.hostUser = gameManager.user.id;
      this.init();
      gameManager.addUpdate(this);
   }
   init() {
      if (!this.watch)
         this.input();
   }
   updateInput() {
      this.keyManager.updateInput();
   }
   input() {
      var keyboard = gameManager.user.keyboard;
      if (!keyboard) {
         keyboard = { left: 37, right: 39, down: 70, drop: 40, rotate: 82, rotateRight: 69, rotate180: 87, hold: 84, dasDelay: 150, moveDelay: 30 };
      }
      var _this = this;
      this.keyManager = new KeyManager({
         socket: socket,
         keyboard: keyboard,
         leftFunc: function () { _this.tetris.moveLeft(); },
         leftEndFunc: function () { _this.tetris.moveLeftToEnd(); },
         rightFunc: function () { _this.tetris.moveRight(); },
         rightEndFunc: function () { _this.tetris.moveRightToEnd(); },
         downFunc: function () { _this.tetris.moveDown(); },
         downEndFunc: function () { _this.tetris.moveDownToEnd(); },
         dropFunc: function () { _this.tetris.drop(); },
         rotateFunc: function () { _this.tetris.rotate(true); },
         rotateRightFunc: function () { _this.tetris.rotate(false); },
         rotate180Func: function () { _this.tetris.rotate180(); },
         holdFunc: function () { _this.tetris.holdShape(); },
      });

      this.onKeyDown = function (e) {
         // if (e.keyCode === 113) { // F2
         //    _this.start();
         // }
         //else if(e.keyCode === 80) // P
         //    _this.pause();
         if (!_this.isPaused && _this.tetris.playing) {
            _this.keyManager.onKeyDown(e.keyCode);
         }
         if (e.keyCode === 38 || e.keyCode === 40 || e.keyCode === 32)
            e.preventDefault();
      }
      this.onKeyUp = function (e) {
         _this.keyManager.onKeyUp(e.keyCode);
      }

      document.body.addEventListener("keydown", this.onKeyDown, false);
      document.body.addEventListener("keyup", this.onKeyUp, false);
   }
   start() {
      this.playTime = 0;
      this.tetris.playData.reset();
      if (this.firstGame) {
         this.firstGame = false;
         this.tetris.start();
      }
      else {
         this.tetris.restart();
      }
   }
   restart() {
      this.start();
   }
   //for watch
   userReady(userId) {
      console.log(userId, "ready");
      if (this.hostUser === userId)
         this.tetris.init();
      else if (this.otherUser === userId)
         this.otherTetris.init();
      // this.ui.userReady(userId);
   }
   gameOver(result) {
      console.log(result);
      this.reset();
      // this.ui.gameOver(result.win);
   }
   lose() {
      if (this.single) {
         this.reset();
      }
   }
   reset() {
      // this.ui.reset();
      if (!this.watch)
         this.keyManager.stop();
      this.playing = false;
      this.tetris.playing = false;
      this.otherTetris.playing = false;
   }
   trashPool(trash) {
      this.tetris.hurt(trash);
   }
   clearFloorTime() {
      this.time = 0;
   }
   update = (dt) => {
      if (this.isPaused) return;
      if (this.tetris.playing) {
         this.playTime += dt;
         //this.tetris.playData.time += dt;
         this.time += dt;
         if (this.single) {
            if (this.tetris.playData.lines >= 40) {
               this.tetris.gameOver();
               //socket.single(this.tetris.playData.time);
               socket.single(this.playTime);
               return;
            }
         }
         if (!this.watch) {
            while (this.time > this.interval) {
               this.time -= this.interval;
               this.tetris.moveDownNature();
            }
         }
      }
   }
   pause() {
      this.isPaused = !this.isPaused;
   }
   dispose() {
      document.body.removeEventListener("keydown", this.onKeyDown, false);
      document.body.removeEventListener("keyup", this.onKeyUp, false);
      gameManager.removeUpdate(this);
      this.tetris.dispose();
      this.tetris = null;
   }
}
