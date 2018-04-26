
import socket from '../socket/GameSocket';
import { OPERTABLE } from '../socket/OperTable';
import gameManager from './GameManager';
import KeyManager from '../logic/KeyManager';
import Tetris from '../logic/Tetris';
import Recorder from '../logic/Recorder';
import OperEnum from '../enum/OperEnum';

export default class Game {
   constructor() {
      this.setting = {
         attackMode: "0124",
         tspinMode: "3T",
         useBuffer: true,
      }
      // 录像机
      this.recorder = new Recorder(this);
      // 是否要记录
      this.hasReplay = false;
      this.isReplay = false;

      // 1秒难编码
      this.interval = 0.95;
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
      this.setKeybaord();
   }
   updateKeyboard() {
      this.keyManager.updateInput();
   }
   setKeybaord() {
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
   setFocus(focus) {
      this.focus = focus;
   }
   /**
    * 回放
    */
   replay() {
      this.isReplay = true;
      this.keyManager.enable = false;
      this.recorder.playIdx = 0;
      this.tetris.ready(this.recorder.seed);
      this.onStart();
      this.go();
   }
   /**
    * 开始游戏
    */
   start() {
      this.isReplay = false;
      if (!this.watch) {
         this.keyManager.enable = true;
      }
      this.reset();
      this.state = 1;
      this.tetris.ready();
      // 开始记录
      if (this.single && this.hasReplay && !this.isReplay) {
         this.recorder.seed = this.tetris.seed;
         this.recorder.init(this);
      }
      // 开始时子类处理
      this.onStart();
      // 准备动画
      this.ready();
   }
   /**
    * 子类重写
    */
   onStart() {

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
   /**
    * 正式开始
    */
   go = () => {
      this.state = 2;
      this.tetris.start();
   }
   /**
    * 游戏结束，由tetris通知，子类继承
    */
   gameOver(win = false) {
      console.log(win ? 'win' : 'lose');
      this.state = 0;
      if (this.hasReplay) {
         // 记录总时间，或者回放时使用总时间。
         if (!this.isReplay) {
            this.recorder.end(this.tetris.playData.time);
         } else {
            this.tetris.playData.time = this.recorder.time;
         }
      }
      if (this.hasReplay && !this.isReplay) {
         // 回放编码测试
         this.recorder.print();
         var str = this.recorder.encode();
         console.log('encode:', str);
         var r = new Recorder();
         r.decode(str);
         r.print();
      }
      this.reset();
   }
   /**
    * 重置
    */
   reset() {
      // 取消准备状态
      if (this.readyHandle) {
         clearTimeout(this.readyHandle);
         this.readyHandle = null;
      }
      if (!this.watch)
         this.keyManager.reset();
   }
   /**
    * 记录操作
    */
   onOperate(oper) {
      if (!this.single || !this.hasReplay || this.isReplay) {
         return;
      }
      this.recorder.add(oper, this.tetris.playData.time);
   }
   /**
    * 回放操作
    */
   operate(oper) {
      switch (oper) {
         case OperEnum.left:
            this.tetris.moveLeft();
            break;
         case OperEnum.right:
            this.tetris.moveRight();
            break;
         case OperEnum.drop:
            this.tetris.drop();
            break;
         case OperEnum.down:
            this.tetris.moveDown();
            break;
         case OperEnum.rotateL:
            this.tetris.rotate(true);
            break;
         case OperEnum.rotateR:
            this.tetris.rotate(false);
            break;
         case OperEnum.rotate180:
            this.tetris.rotate180();
            break;
         case OperEnum.hold:
            this.tetris.holdShape();
            break;
         case OperEnum.downEnd:
            this.tetris.moveDownToEnd();
            break;
         case OperEnum.leftEnd:
            this.tetris.moveLeftToEnd();
            break;
         case OperEnum.rightEnd:
            this.tetris.moveRightToEnd();
            break;
         default:
            break;
      }
   }
   trashPool(trash) {
      this.tetris.hurt(trash);
   }
   clearFloorTime() {
      this.time = 0;
   }
   update = (dt) => {
      if (this.single) {
         if (dt > 0.1) {
            dt = 0.1;
         }
      }
      if (this.state === 2 && this.tetris.playing) {
         this.tetris.playData.time += dt;
         if (this.isReplay) {
            this.recorder.play(this.tetris.playData.time);
         } else {
            this.time += dt;
            if (!this.watch) {
               while (this.tetris.playing && this.time > this.interval) {
                  this.time -= this.interval;
                  this.tetris.moveDownNature();
               }
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
      this.reset();
      this.tetris.dispose();
      this.tetris = null;
      this.recorder = null;
   }
}
