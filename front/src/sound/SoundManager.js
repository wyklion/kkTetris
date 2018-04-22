
class OneAudio {
   constructor(url) {
      this.url = url;
      this.ready = false;
      var audio = this.audio = document.createElement("audio");
      audio.src = url;
      audio.addEventListener("canplaythrough", () => {
         this.ready = true;
      }, false);
   }
   play() {
      if (!this.ready) return;
      this.audio.currentTime = 0;
      this.audio.play();
   }
   pause() {
      if (!this.ready) return;
      this.audio.pause();
   }
   stop() {
      if (!this.ready) return;
      this.audio.currentTime = 0;
      this.audio.pause();
   }
}

class AudioLoader {
   constructor(context, url, cb) {
      this.context = context;
      this.url = url;
      this.cb = cb;
   }
   makeSound(buffer) {
      var source = this.context.createBufferSource();
      source.buffer = buffer;
      this.cb(this.url, source);
   }
   decodeBuffer(arrayBuffer) {
      this.context.decodeAudioData(arrayBuffer, (buffer) => { //解码成功时的回调函数  
         this.makeSound(buffer);
      }, function (e) { //解码出错时的回调函数
         console.log('Error decoding file', e);
      });
   }
   load() {
      var url = this.url;
      var xhr = new XMLHttpRequest(); //通过XHR下载音频文件  
      xhr.open('GET', url, true);
      xhr.responseType = 'arraybuffer';
      xhr.onload = (e) => { //下载完成  
         this.decodeBuffer(xhr.response);
      };
      xhr.send();
   }
}

export default class SoundManager {
   constructor() {
      window.AudioContext = window.AudioContext || window.webkitAudioContext;
      // this.context = new window.AudioContext();
      this.isReady = true;
      this.sounds = {};
   }

   loadAudios(urls) {
      this.sounds = {};
      for (var i = 0; i < urls.length; i++) {
         this.sounds[urls[i]] = new OneAudio(urls[i]);
      }
   }
   loadWebaudios(urls) {
      this.sounds = {};
      this.isReady = false;
      this.loadCount = urls.length;
      for (var i = 0; i < urls.length; i++) {
         var loader = new AudioLoader(this.context, urls[i], this.onLoadFile);
         loader.load();
      }
   }
   onLoadFile = (url, sound) => {
      this.sounds[url] = sound;
      this.loadCout--;
      if (this.loadCount === 0) {
         this.isReady = true;
      }
   }
   play(url, loop = false) {
      if (!this.isReady) {
         return;
      }
      var sound = this.sounds[url];
      if (!sound) {
         return;
      }
      sound.play();
      // sound.loop = loop;
      // sound.connect(this.context.destination);
      // sound.noteOn(0);
   }
}

