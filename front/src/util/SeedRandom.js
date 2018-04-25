export default class SeedRandom {
   constructor(seed) {
      this.seed = seed || 0;
   }
   get(min, max) {
      min = min || 0;
      this.seed = (this.seed * 9301 + 49297) % 233280;
      var rnd = this.seed / 233280.0;
      return min + Math.floor(rnd * (max + 1 - min));
   };
}