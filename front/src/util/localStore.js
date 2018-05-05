
var localStore = {
   get: function (key, v) {
      var value = localStorage.getItem(key, v);
      return value;
   },
   set: function (key, value) {
      localStorage.setItem(key, value);
   },
   remove: function (key) {
      localStorage.removeItem(key);
   },
   clear: function () {
      localStorage.clear();
   }
};

export default localStore;