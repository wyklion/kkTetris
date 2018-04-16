
export default class KeyState {
   constructor(manager, func, endFunc, isDown, noDas) {
      this.manager = manager;
      this.func = func;
      this.endFunc = endFunc;
      this.noDas = noDas;
      this.isDown = isDown;
      this.press = false;
      this.das = false;
      var dasHandle = null;
      var moveHandle = null;
   }
   keyDown() {
      if (!this.press) {
         this.press = true;
         //console.log("press");
         this.func();
         if (this.noDas) {
            return;
         }
         if (this.isDown) {
            this.moveCall(this.manager.downDelay)
         } else {
            this.dasHandle = setTimeout(this.dasCall, this.manager.dasDelay);
         }
      }
   }
   dasCall = () => {
      this.das = true;
      this.moveCall(this.manager.moveDelay);
   }
   moveCall(delay) {
      if (delay === 0) {
         this.endFunc();
      } else {
         this.func();
         this.moveHandle = setInterval(this.func, delay);
      }
   }
   keepDown() {
      if (this.das && this.manager.moveDelay === 0) {
         this.endFunc();
      }
   }
   keyUp() {
      this.press = false;
      if (!this.noDas) {
         this.das = false;
         this.stop();
      }
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