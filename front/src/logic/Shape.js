
var SHAPES = {
   1: {
      id: 1,
      name: "I",
      cells: [
         [-1, 0, 0, 0, 1, 0, 2, 0],
         [0, 1, 0, 0, 0, -1, 0, -2],
         [-1, -1, 0, -1, 1, -1, 2, -1],
         [1, 1, 1, 0, 1, -1, 1, -2],
      ],
   },
   2: {
      id: 2,
      name: "O",
      cells: [
         [0, 1, 1, 1, 0, 0, 1, 0],
         [0, 1, 1, 1, 0, 0, 1, 0],
         [0, 1, 1, 1, 0, 0, 1, 0],
         [0, 1, 1, 1, 0, 0, 1, 0],
      ],
   },
   3: {
      id: 3,
      name: "T",
      cells: [
         [0, 1, -1, 0, 0, 0, 1, 0],
         [0, 1, -1, 0, 0, 0, 0, -1],
         [-1, 0, 0, 0, 1, 0, 0, -1],
         [0, 1, 0, 0, 1, 0, 0, -1],
      ],
   },
   4: {
      id: 4,
      name: "L",
      cells: [
         [-1, 0, 0, 0, 1, 0, 1, 1],
         [-1, 1, 0, 1, 0, 0, 0, -1],
         [-1, 0, 0, 0, 1, 0, -1, -1],
         [0, 1, 0, 0, 0, -1, 1, -1],
      ],
   },
   5: {
      id: 5,
      name: "J",
      cells: [
         [-1, 1, -1, 0, 0, 0, 1, 0],
         [0, 1, 0, 0, 0, -1, -1, -1],
         [-1, 0, 0, 0, 1, 0, 1, -1],
         [0, 1, 1, 1, 0, 0, 0, -1],
      ],
   },
   6: {
      id: 6,
      name: "Z",
      cells: [
         [-1, 1, 0, 1, 0, 0, 1, 0],
         [0, 1, 0, 0, -1, 0, -1, -1],
         [-1, 0, 0, 0, 0, -1, 1, -1],
         [1, 1, 1, 0, 0, 0, 0, -1],
      ],
   },
   7: {
      id: 7,
      name: "S",
      cells: [
         [1, 1, 0, 1, 0, 0, -1, 0],
         [-1, 1, -1, 0, 0, 0, 0, -1],
         [1, 0, 0, 0, 0, -1, -1, -1],
         [0, 1, 0, 0, 1, 0, 1, -1],
      ]
   },
}

var JLSTZ_KICK = [
   [
      [-1, 0, -1, -1, 0, 2, -1, 2],  //L->0 1->0
      [1, 0, 1, -1, 0, 2, 1, 2],   //R->0 3->0
   ],
   [
      [1, 0, 1, 1, 0, -2, 1, -2],  //0->L 0->1
      [1, 0, 1, 1, 0, -2, 1, -2],  //2->L 2->1
   ],
   [
      [1, 0, 1, -1, 0, 2, 1, 2],   //R->2 3->2
      [-1, 0, -1, -1, 0, +2, -1, 2],  //L->2 1->2
   ],
   [
      [-1, 0, -1, 1, 0, -2, -1, -2], //2->R 2->3
      [-1, 0, -1, 1, 0, -2, -1, -2], //0->R 0->3
   ],
];
var I_KICK = [
   [
      [1, 0, -2, 0, 1, -2, -2, +1], //L->0 1->0
      [2, 0, -1, 0, 2, 1, -1, -2], //R->0 3->0
   ],
   [
      [-1, 0, 2, 0, -1, 2, 2, -1],  //0->L 0->1
      [2, 0, -1, 0, 2, 1, -1, -2], //2->L 2->1
   ],
   [
      [-1, 0, 2, 0, -1, 2, 2, -1],  //R->2 3->2
      [-2, 0, 1, 0, -2, -1, 1, 2],   //L->2 1->2
   ],
   [
      [1, 0, -2, 0, 1, -2, -2, 1],  //2->R 2->3
      [-2, 0, 1, 0, -2, -1, 1, 2],   //0->R 0->3
   ],
]

export default class Shape {
   constructor(tetris, shapeId) {
      this.tetris = tetris;
      this.init(shapeId);
   }
   init(shapeId) {
      this.shapeId = shapeId;
      this.shapeName = SHAPES[this.shapeId].name;
      this.shapeModel = SHAPES[this.shapeId];
      this.x = 4;
      this.y = 19;
      this.rotation = 0;
   }
   setId(id) {
      this.shapeId = id;
      this.shapeName = SHAPES[this.shapeId].name;
      this.shapeModel = SHAPES[this.shapeId];
      this.rotation = 0;
   }
   checkSelf() {
      var ok = this.check(this.x, this.y, this.rotation);
      if (ok)
         this.makeShadow();
      return ok;
   }
   checkDown() {
      return this.check(this.x, this.y - 1, this.rotation);
   }
   check(px, py, r) {
      var board = this.tetris.board;
      for (var i = 0; i < 4; i++) {
         var x = px + this.shapeModel.cells[r][i * 2];
         var y = py + this.shapeModel.cells[r][i * 2 + 1];
         if (x < 0 || x >= this.tetris.col || y < 0 || y > this.tetris.row)
            return false;
         if (board[y][x] > 0)
            return false;
      }
      return true;
   }
   checkJLSTZ(r, antiClock) {
      var tests = JLSTZ_KICK[r][antiClock ? 1 : 0];
      for (var i = 0; i < 4; i++) {
         var x = tests[i * 2];
         var y = tests[i * 2 + 1];
         if (this.check(this.x + x, this.y + y, r)) {
            this.x += x;
            this.y += y;
            return true;
         }
      }
      return false;
   }
   checkI(r, antiClock) {
      var tests = I_KICK[r][antiClock ? 1 : 0];
      for (var i = 0; i < 4; i++) {
         var x = tests[i * 2];
         var y = tests[i * 2 + 1];
         if (this.check(this.x + x, this.y + y, r)) {
            this.x += x;
            this.y += y;
            return true;
         }
      }
      return false;
   }
   rotateCheck(r, rType) {
      if (this.check(this.x, this.y, r))
         return true;
      if (rType === "180") {
         return false;
      }
      else {
         var antiClock = rType === "left";
         if (this.shapeId === 1 && this.checkI(r, antiClock))
            return true;
         else if (this.shapeId >= 2 && this.checkJLSTZ(r, antiClock))//JLSTZ
            return true;
         return false;
      }
   }
   makeShadow() {
      this.shadowY = this.y;
      var offY = 0;
      while (this.check(this.x, this.y - offY - 1, this.rotation)) {
         offY++;
      }
      this.shadowY = this.y - offY;
   }
   freeze() {
      for (var i = 0; i < 4; i++) {
         var x = this.x + this.shapeModel.cells[this.rotation][i * 2];
         var y = this.y + this.shapeModel.cells[this.rotation][i * 2 + 1];
         this.tetris.board[y][x] = this.shapeId;
      }
   }
   rotate(antiClock) {
      var r, rType;
      if (antiClock) {
         rType = "left";
         r = this.rotation + 1;
         if (r > 3) r = 0;
      }
      else {
         rType = "right";
         r = this.rotation - 1;
         if (r < 0) r = 3;
      }
      if (this.rotateCheck(r, rType)) {
         this.rotation = r;
         this.makeShadow();
         return true;
      }
      return false;
   }
   rotate180() {
      var r = this.rotation + 2;
      if (r > 3) r -= 4;
      if (this.rotateCheck(r, "180")) {
         this.rotation = r;
         this.makeShadow();
         return true;
      }
      return false;
   }
   move(offX, offY) {
      if (this.check(this.x + offX, this.y + offY, this.rotation)) {
         this.x += offX;
         this.y += offY;
         if (offX !== 0) {
            this.makeShadow();
         }
         return true;
      }
      if (offY === -1) {
         this.tetris.freeze();
      }
      return false;
   }
   drop() {
      var offY = -1;
      var ok = this.check(this.x, this.y + offY, this.rotation);
      while (ok) {
         offY--;
         ok = this.check(this.x, this.y + offY, this.rotation);
      }
      this.y = this.y + offY + 1;
      this.tetris.freeze();
   }
};
