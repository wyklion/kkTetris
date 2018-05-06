import * as PIXI from 'pixi.js'
import gameManager from "../game/GameManager";
import lang from '../util/lang';

export default class BattleRender {
   constructor(options) {
      this.render = options.render;
      this.container = options.container;

      this.init();

      gameManager.roomManager.newBattleListeners.add(this.onNewBattle);
   }
   init() {
      var da = this.container;
      var datasOptions = [
         {
            name: 'score',
            key: 'Score',
            label: lang.get('Score'),
            value: '0:0',
         },
         {
            name: 'lines',
            key: 'Lines',
            label: lang.get('Lines'),
            value: '0:0',
         },
         {
            name: 'attack',
            key: 'Attack',
            label: lang.get('Attack'),
            value: '0:0',
         },
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
         fontSize: 16 * 2,
         fontFamily: 'Arial',
         align: 'center',
         fill: '#DDDDDD',
      };
      this.dataLabels = {};
      this.dataTexts = {};
      for (var i = 0; i < datasOptions.length; i++) {
         var label = this.dataLabels[datasOptions[i].key] = new PIXI.Text(lang.get(datasOptions[i].key), labelStyle);
         label.y = i * 60;
         label.anchor.set(0.5, 0.5);
         label.scale.set(0.5, 0.5);
         da.addChild(label);
         var dataText = this.dataTexts[datasOptions[i].name] = new PIXI.Text(datasOptions[i].value, dataStyle);
         dataText.y = 23 + i * 60;
         dataText.anchor.set(0.5, 0.5);
         dataText.scale.set(0.6, 0.6);
         da.addChild(dataText);
      }
   }
   /**
    * 重置只清数据不清比分
    */
   reset() {
      var room = gameManager.roomManager.room;
      if (room) {
         this.setText('score', gameManager.roomManager.otherScore + ':' + gameManager.roomManager.hostScore);
      }
      this.setText('lines', '0:0');
      this.setText('attack', '0:0');
   }

   onNewBattle = () => {
      this.reset();
   }

   /**
    * 对战数据显示
    */
   renderBattle() {
      this.setText('score', gameManager.roomManager.otherScore + ':' + gameManager.roomManager.hostScore);
      var game = gameManager.game;
      if (!game)
         return;
      var hostData = game.tetris.playData;
      var otherData = game.otherTetris.playData;
      this.setText('lines', otherData.lines + ':' + hostData.lines);
      this.setText('attack', otherData.attack + ':' + hostData.attack);
   }
   setText(dataName, value) {
      var text = this.dataTexts[dataName];
      if (!text) {
         return;
      }
      text.text = value;
   }
}