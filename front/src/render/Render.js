import * as PIXI from 'pixi.js';
import TetrisRender from './TetrisRender';

export default class Render {
   constructor() {
      this.vertical = false;
      var app = this.app = new PIXI.Application({
         width: 800,         // default: 800
         height: 600,        // default: 600
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
      var scale = w / h > 4 / 3 ? h / 600 : w / 800;
      this.renderer.resize(800 * scale, 600 * scale);
      this.stage.scale.x = this.stage.scale.y = scale;
   }
   render() {
      this.renderer.render(this.stage);
   }
   setMain(tetris) {
      if (this.main) {
         this.main.dispose();
      }
      var container = new PIXI.Container();
      container.x = 400;
      container.y = 0;
      this.stage.addChild(container);
      this.main = new TetrisRender(container, tetris);
   }
}