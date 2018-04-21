import SoundManager from './SoundManager';

export default class TetrisSound {
   constructor() {
      this.soundManager = new SoundManager();
      this.idx = 0;
      this.soundOn = false;
      this.soundTable = {};
   }
   init(idx) {
      idx = idx == null ? 1 : idx;
      if (this.idx === idx) {
         return;
      }
      this.soundOn = idx > 0;
      if (idx === 0) {
         return;
      }
      this.idx = idx;
      var files = [];
      var soundNames = ['move', 'lock', 'linefall'];
      var pubUrl = process.env.PUBLIC_URL;
      for (var i = 0; i < soundNames.length; i++) {
         var url = pubUrl + '/sound/' + soundNames[i] + idx + '.wav';
         var id = soundNames[i] + idx;
         if (!this.soundTable[id]) {
            files.push(url);
            this.soundTable[id] = url;
         }
      }
      if (files.length > 0) {
         // this.soundManager.loadWebaudios(files);
         this.soundManager.loadAudios(files);
      }
   }
   play(name) {
      if (!this.soundOn) {
         return;
      }
      var url = this.soundTable[name + this.idx];
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