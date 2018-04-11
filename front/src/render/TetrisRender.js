/**
 * Created by kk on 2018/4/9.
 */

import * as PIXI from 'pixi.js'
import config from '../config';

var bgColor = 0xAAAAAA;
var shadowColor = 0x7777777;
var deadColor = 0x777777;
var colors = [
   0x00FFFF, // 'cyan'
   0xFFFF00, // 'yellow'
   0xA020F0, // 'purple'
   0xFFA500, // 'orange'
   0x0000FF, // 'blue'
   0xFF0000, // 'red'
   0x00FF00,// 'green'
];

export default class TetrisRender {
   constructor(options) {
      this.container = options.container;
      this.setTetris(options.tetris);
      this.baseSize = options.baseSize || 30;
      this.smallSize = this.baseSize * 0.6;
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

   initTetris() {
      var tetris = this.tetris;
      var ta = this.tetrisArea = new PIXI.Container();
      ta.width = this.baseSize * 10;
      ta.height = this.baseSize * 20;
      ta.x = 0;
      ta.y = config.render.top;
      this.container.addChild(ta);
      var graphics = this.tetrisGraphic = new PIXI.Graphics();
      graphics.beginFill(bgColor);
      graphics.drawRect(0, 0, 300, 600);
      graphics.endFill();
      ta.addChild(graphics);
   }

   initNext() {
      var na = this.nextArea = new PIXI.Container();
      na.x = this.baseSize * 10 + 10;
      na.y = config.render.top;
      this.container.addChild(na);
      var graphics = this.nextGraphic = new PIXI.Graphics();
      na.addChild(graphics);

      // 下一块文本
      var nextText = this.nextText = new PIXI.Text('Next:', {
         fontWeight: 'bold',
         fontSize: 15,
         fontFamily: 'Arial',
         fill: '#cc00ff',
         align: 'center',
         stroke: '#FFFFFF',
         strokeThickness: 3
      });
      nextText.x = 10;
      na.addChild(nextText);
      this.nextText.visible = false;
   }

   initHold() {
      var ha = this.holdArea = new PIXI.Container();
      ha.x = this.baseSize * 10 + 100;
      ha.y = config.render.top;
      this.container.addChild(ha);
      var graphics = this.holdGraphic = new PIXI.Graphics();
      ha.addChild(graphics);

      // 暂存文本
      var holdText = this.holdText = new PIXI.Text('Hold:', {
         fontWeight: 'bold',
         fontSize: 15,
         fontFamily: 'Arial',
         fill: '#cc00ff',
         align: 'center',
         stroke: '#FFFFFF',
         strokeThickness: 3
      });
      holdText.x = 10;
      ha.addChild(holdText);
      this.holdText.visible = false;
   }

   initData() {
      var da = this.dataArea = new PIXI.Container();
      da.x = this.baseSize * 10;
      da.y = config.render.top + 240;
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
         fontSize: 15,
         fontFamily: 'Arial',
         align: 'center',
         fill: '#111111',
      };
      var dataStyle = {
         fontWeight: 'bold',
         fontSize: 20,
         fontFamily: 'Arial',
         align: 'center',
         fill: '#DDDDDD',
      };
      this.dataTexts = {};
      for (var i = 0; i < datasOptions.length; i++) {
         var label = new PIXI.Text(datasOptions[i].label, labelStyle);
         label.x = 10;
         label.y = i * 50;
         da.addChild(label);
         var dataText = this.dataTexts[datasOptions[i].name] = new PIXI.Text(datasOptions[i].value, dataStyle);
         dataText.x = 60;
         dataText.y = i * 50 - 5;
         da.addChild(dataText);
      }
      // 时间
      var timeLabel = new PIXI.Text('时间:', labelStyle);
      timeLabel.x = 10;
      da.addChild(timeLabel);
      var pieceLabel = new PIXI.Text('块数:', labelStyle);
      pieceLabel.x = 10;
      pieceLabel.y = 50;
      da.addChild(pieceLabel);
      var speedLabel = new PIXI.Text('速度:', labelStyle);
      speedLabel.x = 10;
      speedLabel.y = 100;
      da.addChild(speedLabel);
      var lineLabel = new PIXI.Text('行数:', labelStyle);
      lineLabel.x = 10;
      lineLabel.y = 150;
      da.addChild(lineLabel);
   }

   clear() {
      this.reset();
      if (this.displayNext) {
         this.nextText.visible = false;
         this.holdText.visible = false;
         this.dataArea.visible = false;
      }
   }

   reset() {
      var graphics = this.tetrisGraphic;
      graphics.clear();
      graphics.beginFill(bgColor);
      graphics.drawRect(0, 0, 300, 600);
      graphics.endFill();
      if (this.displayNext) {
         this.nextGraphic.clear();
         this.holdGraphic.clear();
      }
   }

   drawTetrisBlock(x, y, color, noLine) {
      var graphics = this.tetrisGraphic;
      if (noLine) {
         graphics.lineStyle(0);
      } else {
         graphics.lineStyle(1, 0x111111, 1);
      }
      graphics.beginFill(color);
      graphics.drawRect(x * this.baseSize, y * this.baseSize, this.baseSize, this.baseSize);
      graphics.endFill();
   }

   renderAll() {
      this.reset();
      this.nextText.visible = true;
      this.holdText.visible = true;
      this.renderTetris();
      if (this.displayNext) {
         this.renderNext();
         this.renderHold();
      }
   }

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

   renderShape(shadow) {
      var tetris = this.tetris;
      var shape = tetris.shape;
      var px = shape.x;
      var py;
      var color;
      if (shadow) {
         color = shadowColor;
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
         this.drawTetrisBlock(x, tetris.row - 1 - y, color, shadow);
      }
   }

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
      var size = this.smallSize;
      graphics.lineStyle(1, 0x111111, 1);
      graphics.beginFill(color);
      var offsetX = shapeId >= 3 ? size / 2 : 0;
      graphics.drawRect(offsetX + x * size, idx * (size * 4) + y * size, size, size);
      graphics.endFill();
   }

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
      var size = this.smallSize;
      graphics.lineStyle(1, 0x111111, 1);
      graphics.beginFill(color);
      var offsetX = shapeId >= 3 ? size / 2 : 0;
      graphics.drawRect(offsetX + x * size, y * size, size, size);
      graphics.endFill();
   }


   renderData() {
      this.dataArea.visible = true;
      var tetris = this.tetris;
      var game = tetris.game;
      var hostData = tetris.playData;
      this.setText('time', game.playTime.toFixed(1));
      this.setText('piece', hostData.count);
      this.setText('speed', game.playTime == 0 ? "0.0" : (hostData.count / game.playTime).toFixed(1));
      this.setText('lines', hostData.lines);
   }

   setText(dataName, value) {
      var text = this.dataTexts[dataName];
      if (!text) {
         return;
      }
      text.text = value;
   }
};