class Tools {
   static getTime() {
      var date = new Date();
      return date.getTime();
   };

   static RandomGenerator() {
      var shapes = [];
      for (var i = 0; i < 100; i++) {
         var bag = [1, 2, 3, 4, 5, 6, 7];
         for (var j = 0; j < 7; j++) {
            var idx = Math.floor(Math.random() * bag.length);
            shapes.push(bag[idx])
            bag.splice(idx, 1);
         }
      }
      return shapes;
   };
}
module.exports = Tools;