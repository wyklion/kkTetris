/**
 * Created by kk on 2018/4/9.
 */

import * as PIXI from 'pixi.js'
import config from '../config';
import lang from '../util/lang';
import gameManager from '../game/GameManager';
import GraphicRender from './GraphicRender';
import TextureRender from './TextureRender';

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
      this.textureManager = gameManager.textureManager;
      this.scale = 1;
      this.render = options.render;
      this.container = options.container;
      this.setTetris(options.tetris);
      this.baseSize = options.baseSize || 30;
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
         if (this.cellRender) {
            this.cellRender.setTetris(tetris);
         }
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

   /**
    * 改大小
    */
   onResize(scale) {
      this.scale = scale;
      this.drawTetrisBg();
   }

   /**
    * 改语言
    */
   onChangeLang() {
      if (this.dataLabels) {
         for (var k in this.dataLabels) {
            this.dataLabels[k].text = lang.get(k);
         }
      }
   }

   /**
    * 改贴图
    */
   onChangeTexture() {
      if (this.cellRender.idx === gameManager.textureManager.idx) {
         return;
      }
      this.cellRender.dispose();
      this.init();
      // 新创建要重设tetris
      this.cellRender.setTetris(this.tetris);
      this.renderAll();
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
      if (this.tetrisArea) {
         this.tetrisArea.destroy({ children: true });
      }
      this.cellRender = this.textureManager.isGraphic()
         ? new GraphicRender(this.displayNext, this.baseSize)
         : new TextureRender(this.displayNext, this.baseSize);
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
      this.cellRender.initTetris(ta);
      // 背景框
      var bgCoverGraphics = this.bgCoverGraphics = new PIXI.Graphics();
      ta.addChild(bgCoverGraphics);
      this.drawTetrisBg();
   }

   initNext() {
      if (this.nextArea) {
         this.nextArea.destroy({ children: true });
      }
      var na = this.nextArea = new PIXI.Container();
      na.x = layout.next.x;
      na.y = layout.next.y;
      this.container.addChild(na);
      this.cellRender.initNext(na);

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
      if (this.holdArea) {
         this.holdArea.destroy({ children: true });
      }
      var ha = this.holdArea = new PIXI.Container();
      ha.x = layout.hold.x;
      ha.y = layout.hold.y;
      this.container.addChild(ha);
      this.cellRender.initHold(ha);

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
      if (this.dataArea) {
         this.dataArea.destroy({ children: true });
      }
      var da = this.dataArea = new PIXI.Container();;
      da.x = layout.data.x;
      da.y = layout.data.y;
      da.visible = false;
      this.container.addChild(da);

      var datasOptions = [
         {
            name: 'time',
            key: 'Time',
            label: lang.get('Time'),
            value: '0.0',
         },
         {
            name: 'piece',
            key: 'Pieces',
            label: lang.get('Pieces'),
            value: '0',
         },
         {
            name: 'speed',
            key: 'Speed',
            label: lang.get('Speed'),
            value: '0.0',
         },
         {
            name: 'lines',
            key: 'Lines',
            label: lang.get('Lines'),
            value: '0',
         }
      ]
      var labelStyle = {
         fontWeight: 'bold',
         fontSize: 12 * 2,
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
      this.dataLabels = {};
      this.dataTexts = {};
      for (var i = 0; i < datasOptions.length; i++) {
         var label = this.dataLabels[datasOptions[i].key] = new PIXI.Text(lang.get(datasOptions[i].key), labelStyle);
         label.x = 3;
         label.y = 30 + i * 40;
         label.scale.set(0.5, 0.5);
         da.addChild(label);
         var dataText = this.dataTexts[datasOptions[i].name] = new PIXI.Text(datasOptions[i].value, dataStyle);
         dataText.x = 44;
         dataText.y = 30 + i * 40 - 4;
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
      this.cellRender.reset();
   }

   /**
    * 刷新
    */
   renderAll() {
      this.reset();
      this.nextText.visible = true;
      this.holdText.visible = true;
      this.cellRender.draw();
      if (!config.fps60) {
         this.render.render();
      }
   }

   /**
    * 数据
    */
   renderData() {
      this.dataArea.visible = true;
      var tetris = this.tetris;
      var hostData = tetris.playData;
      var time = hostData.time;
      if (time > 100) {
         this.smallTimeText();
      }
      this.setText('time', time.toFixed(1));
      this.setText('piece', hostData.count);
      this.setText('speed', time == 0 ? "0.00" : (hostData.count / time).toFixed(2));
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
   smallTimeText() {
      this.dataTexts['time'].scale.set(0.5, 0.5);
   }
};