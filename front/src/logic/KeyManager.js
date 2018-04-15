/**
 * Created by KK on 2018/4/9.
 */

import gameManager from '../game/GameManager';
import KeyState from './KeyState';

export default class KeyManager {
   constructor(options) {
      var _this = this;
      this.socket = options.socket;

      var keyboard = options.keyboard;
      this.dasDelay = keyboard.dasDelay;
      this.moveDelay = keyboard.moveDelay;
      this.leftKey = keyboard.left;
      this.leftFunc = options.leftFunc;
      this.leftEndFunc = options.leftEndFunc;
      this.rightKey = keyboard.right;
      this.rightFunc = options.rightFunc;
      this.rightEndFunc = options.rightEndFunc;
      this.downKey = keyboard.down;
      this.downFunc = options.downFunc;
      this.downEndFunc = options.downEndFunc;
      this.dropKey = keyboard.drop;
      this.dropFunc = options.dropFunc;
      this.rotateKey = keyboard.rotate;
      this.rotateFunc = options.rotateFunc;
      this.rotateRightKey = keyboard.rotateRight;
      this.rotateRightFunc = options.rotateRightFunc
      this.rotate180Key = keyboard.rotate180;
      this.rotate180Func = options.rotate180Func;
      this.holdKey = keyboard.hold;
      this.holdFunc = options.holdFunc;

      this.left = new KeyState(this, this.leftFunc, this.leftEndFunc);
      this.right = new KeyState(this, this.rightFunc, this.rightEndFunc);
      this.down = new KeyState(this, this.downFunc, this.downEndFunc);
   }
   onKeyDown(key) {
      var leftright = false;
      if (key === this.leftKey) {
         this.left.keyDown();
         this.right.keyUp();
         leftright = true;
      }
      else if (key === this.rightKey) {
         this.right.keyDown();
         this.left.keyUp();
         leftright = true;
      }
      else if (key === this.downKey) {
         this.down.keyDown();
      }
      else if (key === this.dropKey) {
         this.dropFunc();
      }
      else if (key === this.rotateKey) {
         this.rotateFunc();
      }
      else if (key === this.rotateRightKey) {
         this.rotateRightFunc();
      }
      else if (key === this.rotate180Key) {
         this.rotate180Func();
      }
      else if (key === this.holdKey) {
         this.holdFunc();
      }
      if (!leftright) {
         this.left.keepDown();
         this.right.keepDown();
      }
   }
   onKeyUp(key) {
      if (key === this.leftKey) {
         this.left.keyUp();
      }
      else if (key === this.rightKey) {
         this.right.keyUp();
      }
      else if (key === this.downKey) {
         this.down.keyUp();
      }
   }
   updateInput() {
      var keyboard = gameManager.user.keyboard;
      if (!keyboard) return;
      this.leftKey = keyboard.left;
      this.rightKey = keyboard.right;
      this.downKey = keyboard.down;
      this.dropKey = keyboard.drop;
      this.rotateKey = keyboard.rotate;
      this.rotateRightKey = keyboard.rotateRight;
      this.rotate180Key = keyboard.rotate180;
      this.holdKey = keyboard.hold;

      this.dasDelay = keyboard.dasDelay;
      this.moveDelay = keyboard.moveDelay;
   }
   stop() {
      this.left.stop();
      this.right.stop();
      this.down.stop();
   }
};