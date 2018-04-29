
import config from '../config.js';

var http = {};
var server = 'http://' + config.server + '/';

http.quest = function (option, callback) {
   var url = server + option.url;
   var method = option.method;
   var data = option.data;
   var timeout = option.timeout || 0;

   var xhr = new XMLHttpRequest();
   (timeout > 0) && (xhr.timeout = timeout);
   xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
         if (xhr.status >= 200 && xhr.status < 400) {
            var result = xhr.responseText;
            try { result = JSON.parse(xhr.responseText); } catch (e) { }
            callback && callback(result.err, result.result);
         } else {
            callback && callback('status:' + xhr.status);
         }
      }
   };
   if (method === 'get') {
      if (typeof data === 'object') {
         var first = true;
         for (var k in data) {
            if (first) {
               url += '?' + k + '=' + data[k];
               first = false;
            } else {
               url += '&' + k + '=' + data[k];
            }
         }
      }
   }
   xhr.open(method, url, true);
   xhr.withCredentials = true;
   if (method === 'post') {
      if (typeof data === 'object') {
         xhr.setRequestHeader("Content-Type", "application/json;charset=utf-8");
         try {
            data = JSON.stringify(data);
         } catch (e) { }
      }
      xhr.send(data);
   } else {
      xhr.send();
   }
   xhr.ontimeout = function () {
      callback && callback('timeout');
      console.log('%c连%c接%c超%c时', 'color:red', 'color:orange', 'color:purple', 'color:green');
   };
};

http.get = function (url, callback) {
   var option = url.url ? url : { url: url };
   option.method = 'get';
   this.quest(option, callback);
};

http.post = function (option, callback) {
   option.method = 'post';
   this.quest(option, callback);
};

export default http;