/**
 * Created by kk on 2018/4/19.
 */

import * as PIXI from 'pixi.js'

var shadowColor = 0x444444;
var deadColor = 0x444444;
// var colors = [
//    0x00FFFF, // 'cyan'
//    0xFFFF00, // 'yellow'
//    0xA020F0, // 'purple'
//    0xFFA500, // 'orange'
//    0x0000FF, // 'blue'
//    0xFF0000, // 'red'
//    0x00FF00,// 'green'
// ];
var colors = [
   0x0F9BD7, // I
   0xE39F02, // O
   0x9D298A, // T
   0xE35B02, // L
   0x2141C6, // J
   0xD70F37, // Z
   0x59B101, // S
   0x888888, // trash
];
// var colors2 = [
//    0x074D6B, // I
//    0x714F01, // O
//    0x4E1445, // T
//    0x712D01, // L
//    0x102063, // J
//    0x6B071B, // Z
//    0x2C5800, // S
//    0x222222, // trash
// ];

export default class GraphicRender {
   constructor(displayNext, baseSize) {
      this.idx = 0;
      this.displayNext = displayNext;
      this.baseSize = baseSize;
      this.nextSize = this.baseSize * 0.8;
      this.holdSize = this.baseSize * 0.6;
   }
   setTetris(tetris) {
      this.tetris = tetris;
   }

   /**
    * 初始化主方块区
    */
   initTetris(container) {
      this.tetrisGraphic = new PIXI.Graphics();
      container.addChild(this.tetrisGraphic);
   }

   /**
    * 预览区
    */
   initNext(container) {
      this.nextGraphic = new PIXI.Graphics();
      container.addChild(this.nextGraphic);
   }

   /**
    * 暂存区
    */
   initHold(container) {
      this.holdGraphic = new PIXI.Graphics();
      container.addChild(this.holdGraphic);
   }

   reset() {
      var graphics = this.tetrisGraphic;
      graphics.clear();
      if (this.displayNext) {
         this.nextGraphic.clear();
         this.holdGraphic.clear();
      }
   }

   draw() {
      if (!this.tetris) return;
      this.drawTetris();
      if (this.displayNext) {
         this.drawNext();
         this.drawHold();
      }
   }

   /**
    * 主方块区
    */
   drawTetris() {
      var tetris = this.tetris;
      for (var i = 0; i < tetris.row; i++) {
         for (var j = 0; j < tetris.col; j++) {
            if (tetris.board[i][j] > 0) {
               var color = tetris.game.state === 0 ? deadColor : colors[tetris.board[i][j] - 1];
               this.drawTetrisBlock(j, tetris.row - 1 - i, color);
            }
         }
      }
      // 操作的方块影子
      if (tetris.playing) {
         this.drawShape(true);
      }
      // 操作的方块
      this.drawShape();
   }

   /**
    * 方块区的一块
    */
   drawTetrisBlock(x, y, color) {
      var graphics = this.tetrisGraphic;
      // if (noLine) {
      //    graphics.lineStyle(0);
      // } else {
      //    graphics.lineStyle(2, 0x222222, 1);
      // }
      graphics.beginFill(color);
      graphics.drawRect(x * this.baseSize, y * this.baseSize, this.baseSize, this.baseSize);
      graphics.endFill();
   }

   /**
    * 当前块
    */
   drawShape(shadow) {
      var tetris = this.tetris;
      var shape = tetris.shape;
      if (!shape) {
         return;
      }
      var px = shape.x;
      var py;
      var color;
      if (shadow) {
         color = shadowColor; // tetris.playing ? colors2[shape.shapeId - 1] : deadColor;
         py = shape.shadowY;
      }
      else {
         color = tetris.playing ? colors[shape.shapeId - 1] : deadColor;
         py = shape.y;
      }
      for (var i = 0; i < 4; i++) {
         var x = px + shape.shapeModel.cells[shape.rotation][i * 2];
         var y = py + shape.shapeModel.cells[shape.rotation][i * 2 + 1];
         if (x < 0 || x >= tetris.col || y < 0 || y >= tetris.row)
            continue;
         this.drawTetrisBlock(x, tetris.row - 1 - y, color);
      }
   }

   /**
    * 下一块
    */
   drawNext() {
      var tetris = this.tetris;
      if (!tetris.nextShapes || tetris.nextShapes.length === 0) return;
      //this.ctx.clearRect(this.nextPos.x-1,this.nextPos.y-1,121,121);
      for (var i = 0; i < tetris.nextShapes.length; i++) {
         var shape = tetris.nextShapes[i];
         var color = tetris.game.state === 0 ? shadowColor : colors[shape.shapeId - 1];
         for (var j = 0; j < 4; j++) {
            var x = 1 + shape.shapeModel.cells[0][j * 2];
            var y = 1 + shape.shapeModel.cells[0][j * 2 + 1];
            this.drawNextBlock(i, shape.shapeId, x, 4 - y, color);
         }
      }
   }
   drawNextBlock(idx, shapeId, x, y, color) {
      var graphics = this.nextGraphic;
      var size = this.nextSize;
      // graphics.lineStyle(1, 0x111111, 1);
      graphics.beginFill(color);
      var offsetX = shapeId >= 3 ? size / 2 : 0;
      graphics.drawRect(offsetX + x * size, -30 + idx * (size * 3.5) + y * size, size, size);
      graphics.endFill();
   }

   /**
    * 暂存
    */
   drawHold() {
      var tetris = this.tetris;
      var shape = tetris.saveShape;
      if (!shape) return;
      var color = colors[shape.shapeId - 1];
      if (!tetris.playing)
         color = shadowColor;
      for (var i = 0; i < 4; i++) {
         var x = 1 + shape.shapeModel.cells[0][i * 2];
         var y = 1 + shape.shapeModel.cells[0][i * 2 + 1];
         this.drawHoldBlock(shape.shapeId, x, 4 - y, color);
      }
   }
   drawHoldBlock(shapeId, x, y, color) {
      var graphics = this.holdGraphic;
      var size = this.holdSize;
      // graphics.lineStyle(1, 0x111111, 1);
      graphics.beginFill(color);
      var offsetX = shapeId >= 3 ? size / 2 : 0;
      graphics.drawRect(offsetX + x * size, y * size, size, size);
      graphics.endFill();
   }

   dispose() {
      this.tetrisGraphic.destroy(true);
      this.nextGraphic.destroy(true);
   }
}