/**
 * Created by kk on 2018/4/19.
 */

import * as PIXI from 'pixi.js'
import gameManager from '../game/GameManager';

export default class TextureManager {
   constructor() {
      this.baseTexture = null
      this.textures = [];
      this.ready = false;
      this.idx = 0;
      this.baseSize = 0;
   }
   init(idx) {
      this.idx = idx;
      if (!idx) {
         return;
      }
      this.load();
   }
   isGraphic() {
      return this.idx === 0;
   }
   load() {
      var pubUrl = process.env.PUBLIC_URL;
      var url = pubUrl + '/cell.png';
      const loader = new PIXI.loaders.Loader();
      loader.add('cell', url);
      loader.load((loader, resources) => {
         this.setTexture(resources.cell);
      });

   }
   setTexture(resource) {
      var baseTexture = this.baseTexture = resource.texture.baseTexture;
      var colorTable = [0, 6, 4, 2, 7, 1, 5, 3];
      for (var i = 0; i < 8; i++) {
         var rect = new PIXI.Rectangle(32 * (i + 1), 0, 32, 32);
         this.textures[colorTable[i]] = new PIXI.Texture(baseTexture, rect);
      }
      this.ready = true;
      gameManager.render.onChangeTexture();
   }
}