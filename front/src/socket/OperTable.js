
var OPERTABLE = {
   ready: 0,
   dead: 1,

   left: 10,
   right: 11,
   down: 12,
   drop: 13,
   rotateL: 14,
   rotateR: 15,
   rotate180: 16,
   hold: 17,

   downNature: 18,
   leftEnd: 19,
   rightEnd: 20,
   downEnd: 21,

   attack: 30,
   trash: 31,
   hurt: 32,

   start: 100,
   gameover: 200,
};

var MSG_TYPE = {
   lobby: 0,
   room: 1,
};

export { OPERTABLE, MSG_TYPE };