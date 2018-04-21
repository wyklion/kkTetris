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
      idx = idx || 0;
      if (this.idx === idx) {
         return;
      }
      this.idx = idx;
      this.load();
   }
   isGraphic() {
      return this.idx === 0;
   }
   load() {
      if (this.idx == 0) {
         gameManager.render.onChangeTexture();
         return;
      }
      var pubUrl = process.env.PUBLIC_URL;
      var url = pubUrl + '/cell' + this.idx + '.png';
      const loader = new PIXI.loaders.Loader();
      var cellId = 'cell' + this.idx
      loader.add(cellId, url);
      loader.load((loader, resources) => {
         this.setTexture(resources[cellId]);
      });

   }
   setTexture(resource) {
      var baseTexture = this.baseTexture = resource.texture.baseTexture;
      var colorTable = [8, 9, 6, 4, 2, 7, 1, 5, 3];
      for (var i = 0; i < 9; i++) {
         var rect = new PIXI.Rectangle(32 * i, 0, 32, 32);
         this.textures[colorTable[i]] = new PIXI.Texture(baseTexture, rect);
      }
      this.ready = true;
      gameManager.render.onChangeTexture();
   }
}