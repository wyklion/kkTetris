
export default class Tools {
   static cloneObject(object) {
      var newObject = {};
      for (var k in object) {
         newObject[k] = object[k];
      }
      return newObject;
   }
   static formatTime(timestamp, fmt) {
      var date = new Date(timestamp);
      var o = {
         "M+": date.getMonth() + 1,               //月份 
         "d+": date.getDate(),                    //日 
         "h+": date.getHours(),                   //小时 
         "m+": date.getMinutes(),                 //分 
         "s+": date.getSeconds(),                 //秒 
      };
      if (/(y+)/.test(fmt)) {
         fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
      }
      for (var k in o) {
         if (new RegExp("(" + k + ")").test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
         }
      }
      return fmt;
   }
}