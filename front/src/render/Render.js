import * as PIXI from 'pixi.js';
import TetrisRender from './TetrisRender';
import config from '../config';

var render = config.render;

export default class Render {
   constructor() {
      this.vertical = false;
      var app = this.app = new PIXI.Application({
         width: render.width,         // default: 800
         height: render.height,        // default: 600
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
      renderer.backgroundColor = 0x333333;
      this.initMainTetris();
   }
   initMainTetris() {
      var container = new PIXI.Container();
      container.x = render.width / 2;
      container.y = 0;
      this.stage.addChild(container);
      this.main = new TetrisRender({
         container: container
      });
   }
   attach(div) {
      this.div = div;
      window.addEventListener('resize', this.onResize);
      this.onResize();
      div.appendChild(this.renderer.view);
   }
   onResize = () => {
      var div = this.div;
      var w = div.clientWidth;
      var h = div.clientHeight;
      // console.log(w, h);
      var scale = w / h > 4 / 3 ? h / render.height : w / render.width;
      this.renderer.resize(render.width * scale, render.height * scale);
      this.stage.scale.x = this.stage.scale.y = scale;
   }
   render() {
      this.renderer.render(this.stage);
   }
}