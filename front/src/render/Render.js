import * as PIXI from 'pixi.js';
import TetrisRender from './TetrisRender';
import config from '../config';

export default class Render {
   constructor() {
      this.vertical = false;
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
   }
   get renderConfig() {
      if (this.vertical) {
         return config.renderSingle;
      } else {
         return config.render;
      }
   }

   initMainTetris() {
      var container = new PIXI.Container();
      container.x = this.renderConfig.width / 2;
      this.stage.addChild(container);
      this.main = new TetrisRender({
         render: this,
         container: container
      });
   }
   setVertical(vertical) {
      if (vertical != this.vertical) {
         this.vertical = vertical;
         if (vertical) {
            this.main.container.x = 0;
         } else {
            this.main.container.x = this.renderConfig.width / 2;
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
   }
   render() {
      // this.renderer.render(this.stage);
      this.app.render();
   }
}