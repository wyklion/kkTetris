import * as PIXI from 'pixi.js';
import TetrisRender from './TetrisRender';
import BattleRender from './BattleRender';
import config from '../config';

export default class Render {
   constructor() {
      this._dirty = false;
      this.vertical = false;
      this.showOther = false;

      var app = this.app = new PIXI.Application({
         width: this.renderConfig.width,         // default: 800
         height: this.renderConfig.height,        // default: 600
         antialias: false,    // default: false
         transparent: false, // default: false
         resolution: 1       // default: 1
      });
      this.stage = app.stage;
      var renderer = this.renderer = app.renderer;
      renderer.view.style.top = '0';
      renderer.view.style.position = 'absolute';
      renderer.view.style.display = 'block';
      renderer.view.style.zIndex = -1;
      renderer.backgroundColor = 0x1E1E1E;
      this.initMainTetris();
      this.initOtherTetris();
      this.initBattle();
   }
   get renderConfig() {
      if (this.vertical) {
         return config.renderSingle;
      } else {
         return config.render;
      }
   }

   /**
    * 主方块区
    */
   initMainTetris() {
      var container = new PIXI.Container();
      container.x = this.renderConfig.width / 2;
      this.stage.addChild(container);
      this.main = new TetrisRender({
         render: this,
         container: container
      });
   }

   /**
    * 对战对手方块区
    */
   initOtherTetris() {
      var container = new PIXI.Container();
      container.x = 85;
      container.y = 5;
      container.scale.set(0.67, 0.67);
      container.visible = this.showOther;
      this.stage.addChild(container);
      this.other = new TetrisRender({
         render: this,
         container: container,
         displayNext: false,
      });
   }

   /**
    * 对战比分显示区
    */
   initBattle() {
      var container = new PIXI.Container();
      container.x = this.renderConfig.width / 2 + 32;
      container.y = 280;
      container.visible = this.showOther;
      this.stage.addChild(container);
      this.battle = new BattleRender({
         render: this,
         container: container,
      });
   }

   /**
    * 是否显示房间对手对战信息
    */
   showOtherTetris(show) {
      this.showOther = show;
      this.other.container.visible = this.showOther;
      this.battle.container.visible = this.showOther;
   }

   setVertical(vertical) {
      if (vertical !== this.vertical) {
         this.vertical = vertical;
         if (vertical) {
            this.main.container.x = 0;
            this.other.container.visible = false;
         } else {
            this.main.container.x = this.renderConfig.width / 2;
            this.other.container.visible = this.showOther;
         }
      }
   }
   attach(div) {
      this.div = div;
      div.appendChild(this.renderer.view);
   }
   detach() {
      this.renderer.view.parentNode.removeChild(this.renderer.view);
   }
   onResize = () => {
      var div = this.div;
      var w = div.clientWidth;
      var h = div.clientHeight;
      // console.log(w, h);
      this.renderer.resize(w, h);
      var scale = w / this.renderConfig.width;
      // var scale = w / h > 4 / 3 ? h / render.height : w / render.width;
      // this.renderer.resize(render.width * scale, render.height * scale);
      this.stage.scale.x = this.stage.scale.y = scale;
      this.main.onResize(scale);
      this.other.onResize(scale);
   }
   /**
    * 改语言
    */
   onChangeLang = () => {
      this.main.onChangeLang();
   }
   /**
    * 改贴图
    */
   onChangeTexture = () => {
      this.main.onChangeTexture();
      this.other.onChangeTexture();
   }
   render() {
      // this.renderer.render(this.stage);
      // if (this._dirty) {
      //    this._dirty = true;
      this.app.render();
      // }
   }
   dirty() {
      this._dirty = true;
   }
}