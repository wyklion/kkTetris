
export default class KeyState {
   constructor(manager, func, endFunc, isDown) {
      this.manager = manager;
      this.func = func;
      this.endFunc = endFunc;
      this.isDown = isDown;
      this.press = false;
      var dasHandle = null;
      var moveHandle = null;
   }
   keyDown() {
      if (!this.press) {
         this.press = true;
         this.lastTime = Date.now();
         this.time = 0;
         //console.log("press");
         this.func();
         if (!this.isDown) {
            this.dasHandle = setTimeout(this.dasCall, this.manager.dasDelay);
         }
      }
   }
   dasCall = () => {
      var moveDelay = this.manager.moveDelay;
      if (moveDelay === 0) {
         this.endFunc();
      } else {
         this.func();
         this.moveHandle = setInterval(this.func, moveDelay);
      }
   }
   keyUp() {
      this.press = false;
      this.stop();
   }
   stop() {
      if (this.dasHandle) {
         clearTimeout(this.dasHandle);
         this.dasHandle = null;
      }
      if (this.moveHandle) {
         clearTimeout(this.moveHandle);
         this.moveHandle = null;
      }
   }
};