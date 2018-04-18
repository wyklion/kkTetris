/**
 * Created by KK on 2018/4/9.
 */

import Shape from './Shape';
import PlayData from './PlayData';
import socket from '../socket/GameSocket';
import { OPERTABLE } from '../socket/OperTable';
import gameManager from '../game/GameManager';

var COL = 10;
var ROW = 20;

var RandomGenerator = function () {
   var shapes = [];
   for (var i = 0; i < 100; i++) {
      var bag = [1, 2, 3, 4, 5, 6, 7];
      for (var j = 0; j < 7; j++) {
         var idx = Math.floor(Math.random() * bag.length);
         shapes.push(bag[idx])
         bag.splice(idx, 1);
      }
   }
   return shapes;
};

var Combo = [0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 4, 5];

export default class Tetris {
   constructor(game, me) {
      this.game = game;
      this.me = me;
      this.row = ROW;
      this.col = COL;
      this.playData = new PlayData();
      this.renderer = null;
      this.operateCount = 0;
      this.renderCount = 0;
      this.init();
   }

   init() {
      this.board = [];
      for (var i = 0; i < this.row + 1; i++) {
         this.board[i] = [];
         for (var j = 0; j < this.col; j++) {
            this.board[i][j] = 0;
         }
      }
      this.shapes = [];
      this.shape = null;
      this.nextShapes = [];
      this.saveShape = null;
      this.playing = false;

      this.lastClear = false;
      this.lastRotate = false;
      this.combo = 0;

      //when setting.buffer == ture;
      this.trashes = [];
   }
   render() {
      this.renderer.renderAll();
   }
   start(shapes) {
      this.playing = true;
      if (shapes) {
         for (var i = 0; i < shapes.length; i++)
            this.shapes.push(shapes[i]);
      }
      else
         this.shapes = RandomGenerator();
      for (var j = 0; j < 3; j++) {
         var shapeId = this.shapes.shift();
         this.nextShapes[j] = new Shape(this, shapeId);
      }

      this.newShape();
   }
   newShape() {
      this.holded = false;
      this.shape = this.nextShapes.shift();
      //var shapeId = Math.ceil(Math.random()*7);
      var shapeId = this.shapes.shift();
      if (!shapeId) {
         this.gameOver();
         return;
      }
      this.nextShapes.push(new Shape(this, shapeId));
      if (!this.shape.checkSelf())
         this.gameOver();
      this.render();
   }
   freeze() {
      this.playData.count++;
      this.attackLines = 0;
      this.shape.freeze();
      this.clearLines();
      if (!this.game.single)
         this.checkAttack();
      this.newShape();
      this.render();
      if (this.clearRowCount === 0) {
         gameManager.soundManager.lock();
      } else {
         gameManager.soundManager.linefall();
      }
   }
   checkOver() {
      for (var i = 0; i < this.col; i++) {
         if (this.board[this.row][i] > 0) {
            this.gameOver();
            return true;
         }
      }
      return false;
   }
   gameOver(win = false) {
      this.playing = false;
      if (this.me) {
         this.operate(OPERTABLE.dead);
         this.game.gameOver(win);
      }
      this.render();
   }
   restart(shapes) {
      this.init();
      this.start(shapes);
   }
   clearLines() {
      var lines = [];
      for (var y = 0; y < this.row; y++) {
         var full = true;
         for (var x = 0; x < this.col; x++) {
            if (this.board[y][x] == 0) {
               full = false;
               break;
            }
         }
         if (full)
            lines.push(y);
      }
      this.clearRowCount = lines.length;
      if (this.clearRowCount === 0) {
         this.combo = 0;
         return;
      }

      var attackLine = this.checkClear(this.clearRowCount);

      var line = lines.shift();
      var moveTable = [];
      for (var i = 0; i < this.row; i++) {
         if (line == undefined || i < line) {
            moveTable.push(i);
            continue;
         }
         else if (i == line) {
            line = lines.shift();
            continue;
         }
      }
      //console.log(moveTable);
      for (var i = 0; i < moveTable.length; i++) {
         for (var x = 0; x < this.col; x++)
            this.board[i][x] = this.board[moveTable[i]][x];
      }
      for (var i = moveTable.length; i < this.row; i++) {
         for (var x = 0; x < this.col; x++)
            this.board[i][x] = 0;
      }

      //check all clear
      var allclear = true;
      for (var i = 0; i < COL; i++) {
         if (this.board[0][i] > 0) {
            allclear = false;
            break;
         }
      }

      //data...
      if (allclear)
         this.attackLines = attackLine + 6;
      else
         this.attackLines = attackLine;

      this.playData.attack += this.attackLines;
   }
   //both ...
   checkClear(lines) {
      this.combo++;
      this.playData.lines += lines;
      var attackLine;
      if (this.checkTspin()) {
         if (this.lastClear)
            attackLine = lines === 3 ? 8 : lines * 2 + 1;
         else
            attackLine = lines * 2;
         this.lastClear = true;
      }
      else if (this.game.setting.attackMode === "0124") {
         if (lines >= 2) {
            if (lines === 4) {
               if (this.lastClear)
                  attackLine = 5;
               else
                  attackLine = 4;
               this.lastClear = true;
            }
            else {
               attackLine = lines - 1;
               this.lastClear = false;
            }
         }
         else
            attackLine = 0;
      }
      attackLine += this.combo >= 11 ? 5 : Combo[this.combo];
      return attackLine;
   }
   checkTspin() {
      if (this.game.setting.tspinMode === "3T") {
         if (!this.lastRotate || this.shape.shapeId !== 3) return false;
         var x = this.shape.x, y = this.shape.y;
         if (y === 0) {
            if (this.board[y + 1][x - 1] > 0 || this.board[y + 1][x + 1] > 0)
               return true;
         }
         else if (x === 0) {
            if (this.board[y + 1][x + 1] > 0 || this.board[y - 1][x + 1] > 0)
               return true;
         }
         else if (x === COL - 1) {
            if (this.board[y + 1][x - 1] > 0 || this.board[y - 1][x - 1] > 0)
               return true;
         }
         else {
            var t = 0;
            if (this.board[y + 1][x - 1] > 0) t++;
            if (this.board[y + 1][x + 1] > 0) t++;
            if (this.board[y - 1][x - 1] > 0) t++;
            if (this.board[y - 1][x + 1] > 0) t++;
            if (t >= 3) return true;
         }
      }
      return false;
   }
   holdShape() {
      if (this.holded) return;
      if (this.saveShape) {
         if (!this.saveShape.check(4, 19, 0))
            return;
         var shapeId = this.shape.shapeId;
         this.shape.init(this.saveShape.shapeId);
         this.shape.makeShadow();
         this.saveShape.setId(shapeId);
      }
      else {
         this.saveShape = this.shape;
         this.newShape();
      }
      this.holded = true;
      this.operate(OPERTABLE.hold);
      this.render();
   }
   rotate(anti) {
      var ok = this.shape.rotate(anti);
      if (ok) {
         if (anti)
            this.operate(OPERTABLE.rotateL);
         else
            this.operate(OPERTABLE.rotateR);
         this.lastRotate = true;
         this.checkFloor();
         this.render();
      }
   }
   rotate180() {
      var ok = this.shape.rotate180();
      if (ok) {
         this.operate(OPERTABLE.rotate180);
         this.lastRotate = true;
         this.checkFloor();
         this.render();
      }
   }
   move(offX, offY) {
      // console.log(offX, offY);
      var ok = this.shape.move(offX, offY);
      return ok;
   }
   moveLeft() {
      var ok = this.move(-1, 0);
      if (ok) {
         this.lastRotate = false;
         this.checkFloor();
         this.operate(OPERTABLE.left);
         this.render();
      }
      return ok;
   }
   moveLeftToEnd() {
      this.operate(OPERTABLE.leftEnd);
      var ok = false;
      while (this.move(-1, 0)) {
         ok = true;
         this.lastRotate = false;
         this.checkFloor();
      }
      if (ok) {
         this.render();
      }
   }
   moveRight() {
      var ok = this.move(1, 0);
      if (ok) {
         this.lastRotate = false;
         this.checkFloor();
         this.operate(OPERTABLE.right);
         this.render();
      }
      return ok;
   }
   moveRightToEnd() {
      this.operate(OPERTABLE.rightEnd);
      var ok = false;
      while (this.move(1, 0)) {
         ok = true;
         this.lastRotate = false;
         this.checkFloor();
      }
      if (ok) {
         this.render();
      }
   }
   moveDown() {
      if (!this.shape.checkDown())
         return;
      this.operate(OPERTABLE.down);
      this.move(0, -1);
      this.lastRotate = false;
      this.checkFloor();
      this.render();
   }
   moveDownToEnd() {
      this.operate(OPERTABLE.downEnd);
      var ok = false;
      while (this.shape.checkDown()) {
         ok = true;
         this.move(0, -1);
         this.lastRotate = false;
         this.checkFloor();
      }
      if (ok) {
         this.render();
      }
   }
   moveDownNature() {
      this.operate(OPERTABLE.downNature);
      this.move(0, -1);
      this.render();
   }
   drop() {
      this.attackLines = 0;
      this.operate(OPERTABLE.drop);
      this.shape.drop();
      this.render();
   }
   checkFloor() {
      if (this.shape.floor) {
         if (this.shape.floorCount < 15) {
            this.shape.floorCount++;
            this.game.clearFloorTime();
         }
      }
      else if (!this.shape.checkDown()) {
         this.shape.floor = true;
         this.shape.floorCount = 0;
         this.game.clearFloorTime();
      }
   }
   //=============== for vs game =================
   //only me
   operate(oper, data) {
      this.operateCount++;
      if (!this.me) return;
      if (!this.game.single)
         socket.operate(oper, data);
   }
   //both, but only me send operate
   checkAttack() {
      if (this.game.setting.useBuffer) {
         if (this.clearRowCount === 0) {
            if (this.trashes.length > 0) {
               this.riseRow(this.trashes);
               //console.log("tell other i got trash...");
               this.trashes = [];
            }
         }
         else if (this.trashes.length >= this.attackLines) {
            this.trashes.splice(0, this.attackLines);
         }
         else {
            this.attack(this.attackLines - this.trashes.length);
            this.trashes = [];
         }
      }
      else {
         this.attack(this.attackLines);
      }
      //if(!this.me)
      //    console.log("other trash:", this.trashes);
   }
   //only me...
   attack(lines) {
      if (!this.me) return;
      var trash = [];
      var hole = Math.floor(Math.random() * COL);
      for (var i = 0; i < lines; i++)
         trash.push(hole);
      this.operate(OPERTABLE.attack, trash);
   }
   //both...
   hurt(trash) {
      if (this.game.setting.useBuffer) {
         this.trashes = this.trashes.concat(trash);
         this.operate(OPERTABLE.hurt, trash);
         //if(!this.me)
         //    console.log("other trash:", this.trashes);
      }
      else {
         if (this.me)
            this.realHurt(trash);
      }
   }
   //only me... useBuffer = false
   realHurt(trash) {
      var dead = this.riseRow(trash);

      var ok = this.shape.check(this.shape.x, this.shape.y, this.shape.rotation);
      var offY = 0;
      while (!ok && this.shape.y < 19) {
         offY++;
         this.shape.y++;
         ok = this.shape.check(this.shape.x, this.shape.y, this.shape.rotation);
      }

      this.shape.makeShadow();

      //console.log("tell other i got trash...");
      this.operate(OPERTABLE.trash, { trash: trash, offY: offY });

      if (!ok)
         dead = true;
      if (dead) {
         this.gameOver();
      }
   }
   //both use...
   riseRow(trash) {
      var dead = false;
      var trashLengh = trash.length;
      for (var y = this.row; y >= trashLengh; y--) {
         for (var x = 0; x < this.col; x++) {
            if (y >= this.row - trashLengh && this.board[y][x] > 0)
               dead = true;
            this.board[y][x] = this.board[y - trashLengh][x];
         }
      }
      for (var i = 0; i < trashLengh; i++) {
         var blank = trash[i];
         var id = 1 + Math.floor(Math.random() * 7);
         for (var col = 0; col < COL; col++) {
            if (col === blank) {
               this.board[trashLengh - 1 - i][col] = 0;
            }
            else
               this.board[trashLengh - 1 - i][col] = id;
         }
      }
      return dead;
   }
   //only other... useBuffer = false
   trash(data) {
      //console.log("other get trash:", data.trash, data.offY);
      this.riseRow(data.trash);
      this.shape.y += data.offY;
      this.shape.makeShadow();
   }
   print() {
      console.log(this.board);
   }
   dispose() {
      this.renderer.setTetris(null);
      this.renderer.clear();
      this.renderer = null;
   }
};
