import config from '../config';

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
   static getFitSize(w, h) {
      var width, height;
      var renderWidth, renderHeight, scale;
      // 横屏
      if (w > h) {
         // console.log(w, h);
         renderWidth = config.render.width;
         renderHeight = config.render.height;
         scale = h / w > renderHeight / renderWidth ? w / renderWidth : h / renderHeight;
         width = Math.round(renderWidth * scale);
         height = Math.round(renderHeight * scale);
      }
      // 竖屏
      else {
         renderWidth = config.renderSingle.width;
         renderHeight = config.renderSingle.height;
         scale = h / w > renderHeight / renderWidth ? w / renderWidth : h / renderHeight;
         width = Math.round(renderWidth * scale);
         height = Math.round(renderHeight * scale);
      }
      return { width, height };
   }
}