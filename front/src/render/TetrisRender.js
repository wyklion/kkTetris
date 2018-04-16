/**
 * Created by kk on 2018/4/9.
 */

import * as PIXI from 'pixi.js'
import config from '../config';

var layout = {
   tetris: {
      x: 79,
      y: 10,
   },
   next: {
      x: 382,
      y: 10,
   },
   hold: {
      x: 2,
      y: 10,
   },
   data: {
      x: 385,
      y: 280,
   }
}

var bgColor = 0x111111;
var bgBorderColor = 0x555555;
var bgLineColor = 0x333333;
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
];
var colors2 = [
   0x074D6B, // I
   0x714F01, // O
   0x4E1445, // T
   0x712D01, // L
   0x102063, // J
   0x6B071B, // Z
   0x2C5800, // S
];


export default class TetrisRender {
   constructor(options) {
      this.scale = 1;
      this.render = options.render;
      this.container = options.container;
      this.setTetris(options.tetris);
      this.baseSize = options.baseSize || 30;
      this.nextSize = this.baseSize * 0.8;
      this.holdSize = this.baseSize * 0.6;
      this.displayNext = options.displayNext == null ? true : options.displayNext;

      this.init();
      //makeSprite(this.baseSize);
      //this.drawData = {
      //    colorBlock: [],
      //};
      //for(var i = 0; i < 7; i++){
      //    this.drawData.colorBlock[i] = [];
      //}
   }
   setTetris(tetris) {
      this.tetris = tetris;
      if (tetris) {
         this.tetris.renderer = this;
      }
   }
   init() {
      // 方块区
      this.initTetris();

      // 下一块区域
      if (this.displayNext) {
         this.initNext();
         this.initHold();
         this.initData();
      }
   }

   onResize(scale) {
      this.scale = scale;
      this.drawTetrisBg();
   }

   drawTetrisBg() {
      var bgGraphics = this.bgGraphics;
      bgGraphics.beginFill(bgColor);
      bgGraphics.drawRect(0, 0, 300, 600);
      bgGraphics.endFill();
      bgGraphics.lineStyle(1 / this.scale, bgLineColor, 1);
      var i;
      for (i = 1; i <= 9; i++) {
         var x = i * this.baseSize;
         bgGraphics.moveTo(x, 0);
         bgGraphics.lineTo(x, 600);
      }
      for (i = 1; i <= 19; i++) {
         var y = i * this.baseSize;
         bgGraphics.moveTo(0, y);
         bgGraphics.lineTo(300, y);
      }
      var bgCover = this.bgCoverGraphics;
      bgCover.clear();
      bgCover.lineStyle(2 / this.scale, bgBorderColor, 1);
      bgCover.drawRect(0, 0, this.baseSize * 10, this.baseSize * 20);
   }
   initTetris() {
      var tetris = this.tetris;
      var ta = this.tetrisArea = new PIXI.Container();
      ta.width = this.baseSize * 10;
      ta.height = this.baseSize * 20;
      ta.x = layout.tetris.x;
      ta.y = layout.tetris.y;
      this.container.addChild(ta);
      // 背景线
      var bgGraphics = this.bgGraphics = new PIXI.Graphics();
      ta.addChild(bgGraphics);
      // 方块区
      var graphics = this.tetrisGraphic = new PIXI.Graphics();
      ta.addChild(graphics);
      // 背景框
      var bgCoverGraphics = this.bgCoverGraphics = new PIXI.Graphics();
      ta.addChild(bgCoverGraphics);
      this.drawTetrisBg();
   }

   initNext() {
      var na = this.nextArea = new PIXI.Container();
      na.x = layout.next.x;
      na.y = layout.next.y;
      this.container.addChild(na);
      var graphics = this.nextGraphic = new PIXI.Graphics();
      na.addChild(graphics);

      // 下一块文本
      var nextText = this.nextText = new PIXI.Text('Next:', {
         fontWeight: 'bold',
         fontSize: 15 * 2,
         fontFamily: 'Arial',
         fill: '#f4511e',
         align: 'center',
         stroke: '#FFFFFF',
         strokeThickness: 6
      });
      nextText.x = 20;
      nextText.scale.set(0.5, 0.5);
      na.addChild(nextText);
      this.nextText.visible = false;
   }

   initHold() {
      var ha = this.holdArea = new PIXI.Container();
      ha.x = layout.hold.x;
      ha.y = layout.hold.y;
      this.container.addChild(ha);
      var graphics = this.holdGraphic = new PIXI.Graphics();
      ha.addChild(graphics);

      // 暂存文本
      var holdText = this.holdText = new PIXI.Text('Hold:', {
         fontWeight: 'bold',
         fontSize: 15 * 2,
         fontFamily: 'Arial',
         fill: '#f4511e',
         align: 'center',
         stroke: '#FFFFFF',
         strokeThickness: 6
      });
      holdText.x = 10;
      holdText.scale.set(0.5, 0.5);
      ha.addChild(holdText);
      this.holdText.visible = false;
   }

   initData() {
      var da = this.dataArea = new PIXI.Container();;
      da.x = layout.data.x;
      da.y = layout.data.y;
      da.visible = false;
      this.container.addChild(da);

      var datasOptions = [
         {
            name: 'time',
            label: '时间',
            value: '0.0',
         },
         {
            name: 'piece',
            label: '块数',
            value: '0',
         },
         {
            name: 'speed',
            label: '速度',
            value: '0.0',
         },
         {
            name: 'lines',
            label: '行数',
            value: '0',
         }
      ]
      var labelStyle = {
         fontWeight: 'bold',
         fontSize: 15 * 2,
         fontFamily: 'Arial',
         align: 'center',
         fill: '#777777',
      };
      var dataStyle = {
         fontWeight: 'bold',
         fontSize: 18 * 2,
         fontFamily: 'Arial',
         align: 'center',
         fill: '#DDDDDD',
      };
      this.dataTexts = {};
      for (var i = 0; i < datasOptions.length; i++) {
         var label = new PIXI.Text(datasOptions[i].label, labelStyle);
         label.x = 5;
         label.y = 30 + i * 40;
         label.scale.set(0.5, 0.5);
         da.addChild(label);
         var dataText = this.dataTexts[datasOptions[i].name] = new PIXI.Text(datasOptions[i].value, dataStyle);
         dataText.x = 44;
         dataText.y = 30 + i * 40 - 3;
         dataText.scale.set(0.6, 0.6);
         da.addChild(dataText);
      }
   }

   /**
    * 清空并隐藏状态
    */
   clear() {
      this.reset();
      if (this.displayNext) {
         this.nextText.visible = false;
         this.holdText.visible = false;
         this.dataArea.visible = false;
      }
   }

   /**
    * 清空
    */
   reset() {
      var graphics = this.tetrisGraphic;
      graphics.clear();
      if (this.displayNext) {
         this.nextGraphic.clear();
         this.holdGraphic.clear();
      }
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
    * 刷新
    */
   renderAll() {
      this.reset();
      this.nextText.visible = true;
      this.holdText.visible = true;
      this.renderTetris();
      if (this.displayNext) {
         this.renderNext();
         this.renderHold();
      }
      if (!config.fps60) {
         this.render.render();
      }
   }

   /**
    * 主方块区
    */
   renderTetris() {
      var tetris = this.tetris;
      for (var i = 0; i < tetris.row; i++) {
         for (var j = 0; j < tetris.col; j++) {
            if (tetris.board[i][j] > 0) {
               var color = tetris.playing ? colors[tetris.board[i][j] - 1] : deadColor;
               this.drawTetrisBlock(j, tetris.row - 1 - i, color);
            }
         }
      }

      // 操作的方块影子
      if (tetris.playing) {
         this.renderShape(true);
      }
      // 操作的方块
      this.renderShape();
   }
   /**
    * 当前块
    */
   renderShape(shadow) {
      var tetris = this.tetris;
      var shape = tetris.shape;
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
   renderNext() {
      var tetris = this.tetris;
      if (!tetris.nextShapes || tetris.nextShapes.length === 0) return;
      //this.ctx.clearRect(this.nextPos.x-1,this.nextPos.y-1,121,121);
      for (var i = 0; i < tetris.nextShapes.length; i++) {
         var shape = tetris.nextShapes[i];
         var color = colors[shape.shapeId - 1];
         if (!tetris.playing)
            color = shadowColor;
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
      graphics.drawRect(offsetX + x * size, -10 + idx * (size * 3.5) + y * size, size, size);
      graphics.endFill();
   }

   /**
    * 暂存
    */
   renderHold() {
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

   /**
    * 数据
    */
   renderData() {
      this.dataArea.visible = true;
      var tetris = this.tetris;
      var hostData = tetris.playData;
      this.setText('time', hostData.time.toFixed(1));
      this.setText('piece', hostData.count);
      this.setText('speed', hostData.time == 0 ? "0.00" : (hostData.count / hostData.time).toFixed(2));
      this.setText('lines', hostData.lines);
      if (!config.fps60) {
         this.render.render();
      }
   }
   setText(dataName, value) {
      var text = this.dataTexts[dataName];
      if (!text) {
         return;
      }
      text.text = value;
   }
};