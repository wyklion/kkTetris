/**
 * Created by KK on 2018/4/21.
 */


var COL = 10;
var ROW = 20;

export default class TrashManager {
   constructor(tetris) {
      this.tetris = tetris;
      this.reset();
   }
   reset() {
      this.lastHole = -1;
      this.holePool = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
   }
   getRandomHole() {
      var holeIdx = this.tetris.rand.get(0, this.holePool.length - 1);
      // console.log(this.tetris.rand, holeIdx);
      var hole = this.holePool[holeIdx];
      this.holePool.splice(holeIdx, 1);
      if (this.lastHole > -1) {
         this.holePool.push(this.lastHole);
      }
      this.lastHole = hole;
      // console.log('hole', hole);
      return hole;
   }
   makeTrash(lines) {
      var len = this.holePool.length;
      var trashDatas = [];
      for (var i = 0; i < lines; i++) {
         var hole = this.getRandomHole();
         trashDatas.push(hole);
      }
      return trashDatas;
   }
}