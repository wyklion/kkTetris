/**
 * Created by KK on 2018/4/9.
 */

import Shape from './Shape';
import PlayData from './PlayData';
// import { OPERTABLE } from '../socket/OperTable';
import gameManager from '../game/GameManager';
import TrashManager from './TrashManager';
import SeedRandom from '../util/SeedRandom';
import OperEnum from '../enum/OperEnum';

var COL = 10;
var ROW = 20;

// var RandomGenerator = function () {
//    var shapes = [];
//    for (var i = 0; i < 100; i++) {
//       var bag = [1, 2, 3, 4, 5, 6, 7];
//       for (var j = 0; j < 7; j++) {
//          var idx = Math.floor(Math.random() * bag.length);
//          shapes.push(bag[idx])
//          bag.splice(idx, 1);
//       }
//    }
//    return shapes;
// };

var Combo = [0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 4, 5];

export default class Tetris {
   constructor(game, me) {
      this.rand = new SeedRandom();
      this.trashManager = new TrashManager(this);
      this.game = game;
      this.me = me;
      this.row = ROW;
      this.col = COL;
      this.playData = new PlayData();
      this.renderer = null;
      this.renderCount = 0;
      this.init();
   }
   init() {
      this.playData.reset();
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
   generateShapes() {
      var bag = [1, 2, 3, 4, 5, 6, 7];
      for (var i = 0; i < 7; i++) {
         var idx = this.rand.get(0, bag.length - 1);
         this.shapes.push(bag[idx])
         bag.splice(idx, 1);
      }
   }
   ready(seed) {
      this.init();
      // 垃圾包重置
      this.trashManager.reset();
      // 随机种子和生成器
      this.seed = seed || Math.floor(Math.random() * 50000);
      this.rand.seed = this.seed;
      // 初始化方块队列只成生一个包7块。
      this.shapes = [];
      this.generateShapes();
      // 五个预览块
      for (var j = 0; j < 5; j++) {
         var shapeId = this.shapes.shift();
         this.nextShapes[j] = new Shape(this, shapeId);
      }
      if (this.game.single) {
         // 剩余多少刷新
         this.renderer.renderSpecialData(this.game.lineCount);
      }
      // 数据刷新
      this.renderer.renderData();
      // 画图
      this.render();
   }
   start(shapes) {
      this.playing = true;
      this.newShape();
   }
   newShape() {
      this.holded = false;
      this.shape = this.nextShapes.shift();
      //var shapeId = Math.ceil(Math.random()*7);
      var shapeId = this.shapes.shift();
      // 方块队列少于7块要补充
      if (this.shapes.length < 7) {
         this.generateShapes();
      }
      if (!shapeId) {
         this.gameOver();
         return;
      }
      this.nextShapes.push(new Shape(this, shapeId));
      if (!this.shape.checkSelf())
         this.gameOver();
      this.render();
   }
   /**
    * 冻结当前操作块，出下一块。
    */
   freeze() {
      this.playData.count++;
      this.attackLines = 0;
      this.shape.freeze();
      this.clearLines();
      this.game.onLock(this.clearRowCount, this.clearTrashCount);
      if (!this.game.single)
         this.checkAttack();
      // 首尾相接的地方，出新块
      this.newShape();
      // 音效
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
         // this.operate(OPERTABLE.dead);
         this.game.gameOver(win);
      }
      this.render();
      this.renderer.renderData();
   }
   /**
    * 检查消除行
    */
   clearLines() {
      var lines = [];
      this.clearTrashCount = 0;
      var x, y;
      for (y = 0; y < this.row; y++) {
         var full = true;
         var hasTrash = false;
         for (x = 0; x < this.col; x++) {
            var bid = this.board[y][x];
            if (bid === 0) {
               full = false;
               break;
            } else if (bid === 8) {
               hasTrash = true;
            }
         }
         if (full) {
            lines.push(y);
            if (hasTrash) {
               // 消了多少垃圾行
               this.clearTrashCount++;
            }
         }
      }
      // 一共可以消几行
      this.clearRowCount = lines.length;
      if (this.clearRowCount === 0) {
         this.combo = 0;
         return;
      }

      // 攻击行数
      var attackLine = this.checkClear(this.clearRowCount);

      var line = lines.shift();
      var moveTable = [];
      var i;
      for (i = 0; i < this.row; i++) {
         if (line === undefined || i < line) {
            moveTable.push(i);
            continue;
         }
         else if (i === line) {
            line = lines.shift();
            continue;
         }
      }
      //console.log(moveTable);
      for (i = 0; i < moveTable.length; i++) {
         for (x = 0; x < this.col; x++)
            this.board[i][x] = this.board[moveTable[i]][x];
      }
      for (i = moveTable.length; i < this.row; i++) {
         for (x = 0; x < this.col; x++)
            this.board[i][x] = 0;
      }

      //check all clear
      var allclear = true;
      for (i = 0; i < COL; i++) {
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
   // 消行计算，tspin或消4行算一次攻击状态，连续这个状态有加成。
   checkClear(lines) {
      this.combo++;
      this.playData.lines += lines;
      var attackLine;
      // 先检查T-Spin
      if (this.checkTspin()) {
         if (this.lastClear)
            attackLine = lines === 3 ? 8 : lines * 2 + 1;
         else
            attackLine = lines * 2;
         this.lastClear = true;
      }
      // 攻击状态。
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
   /**
    * T-Spin检查
    */
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
   /**
    * 暂存
    */
   holdShape() {
      if (this.holded) return;
      if (this.saveShape) {
         if (!this.saveShape.check(4, 19, 0))
            return;
         this.record(OperEnum.hold);
         var shapeId = this.shape.shapeId;
         this.shape.init(this.saveShape.shapeId);
         this.shape.makeShadow();
         this.saveShape.setId(shapeId);
      }
      else {
         this.record(OperEnum.hold);
         this.saveShape = this.shape;
         this.newShape();
      }
      this.holded = true;
      this.render();
   }
   /**
    * 旋转
    */
   rotate(anti) {
      var ok = this.shape.rotate(anti);
      if (ok) {
         if (anti)
            this.record(OperEnum.rotateL);
         else
            this.record(OperEnum.rotateR);
         this.lastRotate = true;
         this.checkFloor();
         this.render();
      }
   }
   /**
    * 旋转180度
    */
   rotate180() {
      var ok = this.shape.rotate180();
      if (ok) {
         this.record(OperEnum.rotate180);
         this.lastRotate = true;
         this.checkFloor();
         this.render();
      }
   }
   /**
    * 硬降
    */
   drop() {
      this.attackLines = 0;
      this.record(OperEnum.drop);
      this.shape.drop();
      this.render();
   }
   /**
    * 各种移动
    */
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
         this.record(OperEnum.left);
         this.render();
      }
      return ok;
   }
   moveLeftToEnd() {
      var ok = false;
      while (this.move(-1, 0)) {
         ok = true;
         this.lastRotate = false;
         this.checkFloor();
      }
      if (ok) {
         this.record(OperEnum.leftEnd);
         this.render();
      }
   }
   moveRight() {
      var ok = this.move(1, 0);
      if (ok) {
         this.lastRotate = false;
         this.checkFloor();
         this.record(OperEnum.right);
         this.render();
      }
      return ok;
   }
   moveRightToEnd() {
      var ok = false;
      while (this.move(1, 0)) {
         ok = true;
         this.lastRotate = false;
         this.checkFloor();
      }
      if (ok) {
         this.record(OperEnum.rightEnd);
         this.render();
      }
   }
   moveDown() {
      if (!this.shape.checkDown())
         return;
      this.record(OperEnum.down);
      this.move(0, -1);
      this.lastRotate = false;
      this.checkFloor();
      this.render();
   }
   moveDownToEnd() {
      var ok = false;
      while (this.shape.checkDown()) {
         ok = true;
         this.move(0, -1);
         this.lastRotate = false;
         this.checkFloor();
      }
      if (ok) {
         this.record(OperEnum.downEnd);
         this.render();
      }
   }
   /**
    * 自然下落
    */
   moveDownNature() {
      var ok = this.move(0, -1);
      if (ok) {
         // 这是落下未锁定
         this.record(OperEnum.down);
         this.render();
      } else {
         // 落下锁定相当于drop
         this.record(OperEnum.drop);
      }
   }
   /**
    * 检查在地面可以操作多少次
    */
   checkFloor() {
      // 已经在地上了操作时可以清除自然下落计时。最多15次。
      if (this.shape.floor) {
         if (this.shape.floorCount < 15) {
            this.shape.floorCount++;
            this.game.clearFloorTime();
         }
      }
      // 刚落地，记录状态
      else if (!this.shape.checkDown()) {
         this.shape.floor = true;
         this.shape.floorCount = 0;
         this.game.clearFloorTime();
      }
   }
   /**
    * 上涨垃圾行
    */
   raiseTrash(lines = 1) {
      var trashDatas = this.trashManager.makeTrash(lines);
      this.moveBoardUp(lines);
      this.fillTrash(trashDatas);
      this.render();
   }
   /**
    * 整体向上移几行
    */
   moveBoardUp(lines) {
      // 超出的一行也要移，之后再判断gameOver。
      for (var y = this.row; y >= lines; y--) {
         for (var x = 0; x < this.col; x++) {
            this.board[y][x] = this.board[y - lines][x];
         }
      }
   }
   /**
    * 填充垃圾行
    */
   fillTrash(datas) {
      var len = datas.length;
      for (var i = 0; i < len; i++) {
         var blank = datas[i];
         for (var col = 0; col < COL; col++) {
            if (col === blank) {
               this.board[len - 1 - i][col] = 0;
            }
            else {
               // 垃圾8，死亡9
               this.board[len - 1 - i][col] = 8;
            }
         }
      }
   }
   record(oper) {
      this.game.record(oper);
   }
   //=============== for vs game =================
   //only me
   // operate(oper, data) {
   //    if (!this.me) return;
   //    if (!this.game.single)
   //       socket.operate(oper, data);
   // }
   // //both, but only me send operate
   // checkAttack() {
   //    if (this.game.setting.useBuffer) {
   //       if (this.clearRowCount === 0) {
   //          if (this.trashes.length > 0) {
   //             this.riseRow(this.trashes);
   //             //console.log("tell other i got trash...");
   //             this.trashes = [];
   //          }
   //       }
   //       else if (this.trashes.length >= this.attackLines) {
   //          this.trashes.splice(0, this.attackLines);
   //       }
   //       else {
   //          this.attack(this.attackLines - this.trashes.length);
   //          this.trashes = [];
   //       }
   //    }
   //    else {
   //       this.attack(this.attackLines);
   //    }
   //    //if(!this.me)
   //    //    console.log("other trash:", this.trashes);
   // }
   // //only me...
   // attack(lines) {
   //    if (!this.me) return;
   //    var trash = [];
   //    var hole = Math.floor(Math.random() * COL);
   //    for (var i = 0; i < lines; i++)
   //       trash.push(hole);
   //    this.operate(OPERTABLE.attack, trash);
   // }
   // //both...
   // hurt(trash) {
   //    if (this.game.setting.useBuffer) {
   //       this.trashes = this.trashes.concat(trash);
   //       this.operate(OPERTABLE.hurt, trash);
   //       //if(!this.me)
   //       //    console.log("other trash:", this.trashes);
   //    }
   //    else {
   //       if (this.me)
   //          this.realHurt(trash);
   //    }
   // }
   // //only me... useBuffer = false
   // realHurt(trash) {
   //    var dead = this.riseRow(trash);

   //    var ok = this.shape.check(this.shape.x, this.shape.y, this.shape.rotation);
   //    var offY = 0;
   //    while (!ok && this.shape.y < 19) {
   //       offY++;
   //       this.shape.y++;
   //       ok = this.shape.check(this.shape.x, this.shape.y, this.shape.rotation);
   //    }

   //    this.shape.makeShadow();

   //    //console.log("tell other i got trash...");
   //    this.operate(OPERTABLE.trash, { trash: trash, offY: offY });

   //    if (!ok)
   //       dead = true;
   //    if (dead) {
   //       this.gameOver();
   //    }
   // }
   // //both use...
   // riseRow(trash) {
   //    var dead = false;
   //    var trashLengh = trash.length;
   //    for (var y = this.row; y >= trashLengh; y--) {
   //       for (var x = 0; x < this.col; x++) {
   //          if (y >= this.row - trashLengh && this.board[y][x] > 0)
   //             dead = true;
   //          this.board[y][x] = this.board[y - trashLengh][x];
   //       }
   //    }
   //    for (var i = 0; i < trashLengh; i++) {
   //       var blank = trash[i];
   //       var id = 1 + Math.floor(Math.random() * 7);
   //       for (var col = 0; col < COL; col++) {
   //          if (col === blank) {
   //             this.board[trashLengh - 1 - i][col] = 0;
   //          }
   //          else
   //             this.board[trashLengh - 1 - i][col] = id;
   //       }
   //    }
   //    return dead;
   // }
   // //only other... useBuffer = false
   // trash(data) {
   //    //console.log("other get trash:", data.trash, data.offY);
   //    this.riseRow(data.trash);
   //    this.shape.y += data.offY;
   //    this.shape.makeShadow();
   // }
   print() {
      console.log(this.board);
   }
   dispose() {
      this.renderer.setTetris(null);
      this.renderer.clear();
      this.renderer = null;
      this.trashManager = null;
      this.rand = null;
      this.playData = null;
   }
};
