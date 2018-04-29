/**
 * Created by kk on 2018/4/19.
 */

import * as PIXI from 'pixi.js'
import gameManager from '../game/GameManager';

export default class TextureRender {
   constructor(displayNext, baseSize) {
      this.textureManager = gameManager.textureManager;
      this.textures = this.textureManager.textures;
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
      this.tetrisContainer = new PIXI.Container();
      container.addChild(this.tetrisContainer);
      this.tetrisSprites = [];
      for (var i = 0; i < 20; i++) {
         for (var j = 0; j < 10; j++) {
            var sprite = this.tetrisSprites[i * 10 + j] = new PIXI.Sprite();
            sprite.x = j * this.baseSize;
            sprite.y = (19 - i) * this.baseSize;
            sprite.width = this.baseSize;
            sprite.height = this.baseSize;
            sprite.visible = false;
            this.tetrisContainer.addChild(sprite);
         }
      }
   }

   /**
    * 预览区
    */
   initNext(container) {
      this.nextContainer = new PIXI.Container();
      container.addChild(this.nextContainer);
   }

   /**
    * 暂存区
    */
   initHold(container) {
      this.holdContainer = new PIXI.Container();
      container.addChild(this.holdContainer);
   }

   reset() {
      for (var i = 0; i < 200; i++) {
         this.tetrisSprites[i].visible = false;
      }
      if (this.displayNext) {
         this.nextContainer.removeChildren();
         this.holdContainer.removeChildren();
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
            var sprite = this.tetrisSprites[i * 10 + j];
            if (tetris.board[i][j] > 0) {
               var idx = tetris.game.state === 0 ? 9 : tetris.board[i][j];
               sprite.texture = this.textures[idx];
               sprite.tint = 0xFFFFFF;
               sprite.visible = true;
            } else {
               sprite.visible = false;
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
    * 当前块
    */
   drawShape(shadow) {
      var tetris = this.tetris;
      var shape = tetris.shape;
      if (!shape) {
         return;
      }
      var px = shape.x;
      var py = shadow ? shape.shadowY : shape.y;
      var idx = tetris.playing ? shape.shapeId : 9;
      for (var i = 0; i < 4; i++) {
         var x = px + shape.shapeModel.cells[shape.rotation][i * 2];
         var y = py + shape.shapeModel.cells[shape.rotation][i * 2 + 1];
         if (x < 0 || x >= tetris.col || y < 0 || y >= tetris.row)
            continue;
         var sprite = this.tetrisSprites[y * 10 + x];
         sprite.visible = true;
         sprite.texture = this.textures[idx];
         sprite.tint = shadow ? 0x777777 : 0xFFFFFF;
      }
   }

   /**
    * 下一块
    */
   drawNext() {
      this.nextContainer.removeChildren();
      var tetris = this.tetris;
      if (!tetris.nextShapes || tetris.nextShapes.length === 0) return;
      //this.ctx.clearRect(this.nextPos.x-1,this.nextPos.y-1,121,121);
      for (var i = 0; i < tetris.nextShapes.length; i++) {
         var shape = tetris.nextShapes[i];
         var idx = tetris.game.state === 0 ? 9 : shape.shapeId;
         for (var j = 0; j < 4; j++) {
            var x = 1 + shape.shapeModel.cells[0][j * 2];
            var y = 1 + shape.shapeModel.cells[0][j * 2 + 1];
            this.drawNextSprite(i, shape.shapeId, x, 4 - y, idx);
         }
      }
   }
   drawNextSprite(i, shapeId, x, y, idx) {
      var sprite = new PIXI.Sprite(this.textures[idx]);
      var size = this.nextSize;
      var offsetX = shapeId >= 3 ? size / 2 : 0;
      sprite.x = offsetX + x * size;
      sprite.y = -30 + i * (size * 3.5) + y * size;
      sprite.width = size;
      sprite.height = size;
      this.nextContainer.addChild(sprite);
   }

   /**
    * 暂存
    */
   drawHold() {
      this.holdContainer.removeChildren();
      var tetris = this.tetris;
      var shape = tetris.saveShape;
      if (!shape) return;
      var idx = tetris.playing ? shape.shapeId : 9;
      for (var i = 0; i < 4; i++) {
         var x = 1 + shape.shapeModel.cells[0][i * 2];
         var y = 1 + shape.shapeModel.cells[0][i * 2 + 1];
         this.drawHoldSprit(shape.shapeId, x, 4 - y, idx);
      }
   }
   drawHoldSprit(shapeId, x, y, idx) {
      var sprite = new PIXI.Sprite(this.textures[idx]);
      var size = this.holdSize;
      var offsetX = shapeId >= 3 ? size / 2 : 0;
      sprite.x = offsetX + x * size;
      sprite.y = y * size;
      sprite.width = size;
      sprite.height = size;
      this.holdContainer.addChild(sprite);
   }

   dispose() {
      this.tetrisContainer.destroy();
      if (this.displayNext) {
         this.nextContainer.destroy();
         this.holdContainer.destroy();
      }
   }
}