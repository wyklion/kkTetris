
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
      this.watch = false;
      this.focus = true;

      this.single = true;
      this.firstGame = true;
      this.tetris = new Tetris(this, true);
      this.hostUser = gameManager.user.id;

      this.state = 0; //0 没事 1 准备Go 2 游戏中
      this.init();
      gameManager.addUpdate(this);
   }
   init() {
      if (!this.watch)
         this.input();
   }
   updateKeyboard() {
      this.keyManager.updateInput();
   }
   setFocus(focus) {
      this.focus = focus;
   }
   input() {
      var keyboard = gameManager.user.keyboard;
      if (!keyboard) {
         keyboard = { left: 37, right: 39, down: 70, drop: 40, rotate: 82, rotateRight: 69, rotate180: 87, hold: 84, dasDelay: 120, moveDelay: 20, downDelay: 20 };
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

      this.onKeyDown = (e) => {
         // if (e.keyCode === 113) { // F2
         //    this.start();
         // }
         //else if(e.keyCode === 80) // P
         //    this.pause();
         if (this.focus && this.state === 2 && this.tetris.playing) {
            this.keyManager.onKeyDown(e.keyCode);
            if (e.keyCode === 38 || e.keyCode === 40 || e.keyCode === 32)
               e.preventDefault();
         }
      }
      this.onKeyUp = (e) => {
         this.keyManager.onKeyUp(e.keyCode);
      }

      document.body.addEventListener("keydown", this.onKeyDown, false);
      document.body.addEventListener("keyup", this.onKeyUp, false);
   }
   /**
    * 开始游戏
    */
   start() {
      // 取消准备状态
      if (this.readyHandle) {
         clearTimeout(this.readyHandle);
         this.readyHandle = null;
      }
      this.state = 1;
      // this.tetris.playData.reset();
      this.tetris.ready();
      this.ready();
   }
   /**
    * 准备
    */
   ready() {
      this.tetris.renderer.ready();
      this.readyHandle = setTimeout(() => {
         this.tetris.renderer.go();
         this.go();
      }, 1000);
   }
   go = () => {
      this.state = 2;
      this.tetris.start();
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
   /**
    * 游戏结束，由tetris通知
    */
   gameOver(win = false) {
      console.log(win ? 'win' : 'lose');
      this.state = 0;
      this.reset();
   }
   reset() {
      if (!this.watch)
         this.keyManager.stop();
   }
   trashPool(trash) {
      this.tetris.hurt(trash);
   }
   clearFloorTime() {
      this.time = 0;
   }
   update = (dt) => {
      if (this.state === 2 && this.tetris.playing) {
         this.tetris.playData.time += dt;
         this.time += dt;
         if (!this.watch) {
            while (this.tetris.playing && this.time > this.interval) {
               this.time -= this.interval;
               this.tetris.moveDownNature();
            }
         }
         this.tetris.renderer.renderData();
         this.checkOver();
      }
   }
   checkOver() {
      return false;
   }
   dispose() {
      document.body.removeEventListener("keydown", this.onKeyDown, false);
      document.body.removeEventListener("keyup", this.onKeyUp, false);
      gameManager.removeUpdate(this);
      this.tetris.dispose();
      this.tetris = null;
   }
}
