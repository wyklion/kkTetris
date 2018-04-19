import SoundManager from './SoundManager';

export default class TetrisSound {
   constructor() {
      this.soundManager = new SoundManager();
      this.idx = 1;
      this.soundTable = {};
      this.init();
      this.soundOn = true;
   }
   init(idx) {
      idx = this.idx = idx == null ? 1 : idx;
      var files = [];
      var soundNames = ['move', 'lock', 'linefall'];
      var pubUrl = process.env.PUBLIC_URL;
      this.soundTable = {};
      for (var i = 0; i < soundNames.length; i++) {
         var url = pubUrl + '/sound/' + soundNames[i] + idx + '.wav';
         files.push(url);
         this.soundTable[soundNames[i]] = url;
      }
      // this.soundManager.loadWebaudios(files);
      this.soundManager.loadAudios(files);
   }
   play(name) {
      if (!this.soundOn) {
         return;
      }
      var url = this.soundTable[name];
      this.soundManager.play(url);
   }
   move() {
      this.play('move');
   }
   lock() {
      this.play('lock');
   }
   linefall() {
      this.play('linefall');
   }
}