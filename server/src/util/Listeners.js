class Listener {
   constructor(func, once) {
      this.func = func;
      this.once = once;
   }
}

class Listeners {
   constructor() {
      this.listeners = [];
   }
   find(func) {
      for (var i = 0; i < this.listeners.length; i++) {
         if (this.listeners[i].func === func) {
            return this.listeners[i];
         }
      }
   }
   add(func, once = false) {
      if (this.find(func)) {
         return;
      }
      var listener = new Listener(func, once);
      this.listeners.push(listener);
   }
   addOnce(func) {
      this.add(func, true);
   }
   remove(func) {
      for (var i = 0; i < this.listeners.length; i++) {
         if (this.listeners[i].func === func) {
            this.listeners.splice(i, 1);
            return;
         }
      }
   }
   execute(...args) {
      for (var i = 0; i < this.listeners.length; i++) {
         this.listeners[i].func.apply(null, args);
         if (this.listeners[i].once) {
            this.listeners.splice(i, 1);
            i--;
         }
      }
   }
   dispose() {
      this.listeners = null;
   }
}

module.exports = Listeners;