
export default class Tools {
   static cloneObject(object) {
      var newObject = {};
      for (var k in object) {
         newObject[k] = object[k];
      }
      return newObject;
   }
}