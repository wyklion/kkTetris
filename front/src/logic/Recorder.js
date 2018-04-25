import GameTypeEnum from "../enum/GameTypeEnum";

export default class Recorder {
   constructor(game) {
      this.game = game;
      this.operations = [];
      this.times = [];
   }
   init(game) {
      this.reset();
      if (game.gameType === 'speed') {
         if (game.lineCount === 40) {
            this.gameType = GameTypeEnum.speed40;
         }
      } else if (game.gameType === 'dig') {
         if (game.lineCount === 18) {
            this.gameType = GameTypeEnum.dig18;
         }
      }
      this.seed = game.tetris.seed;
   }
   reset() {
      this.gameType = 0;
      this.seed = 0;
      this.operations.length = 0;
      this.times.length = 0;
      this.timeAll = 0;
      this.playIdx = 0;
   }
   play(t) {
      var start = this.playIdx;
      for (var i = start; i < this.times.length; i++) {
         if (this.times[i] <= t) {
            this.game.operate(this.operations[i]);
            this.playIdx = i + 1;
         } else {
            break;
         }
      }
   }
   getTime(t) {
      t = ((t * 100) >> 0) / 100;
      if (t >= 1) {
         t = 0.99;
      }
      return t;
   }
   /**
    * 记录操作和时间，时间不大于1秒
    */
   add(operation, time) {
      this.operations.push(operation);
      var len = this.times.length;
      if (len == 0) {
         this.timeAll += this.getTime(time);
         this.times.push(this.timeAll);
      } else {
         var last = this.times[len - 1];
         var t = time - this.timeAll;
         this.timeAll += this.getTime(t);
         this.times.push(this.timeAll);
      }
   }
   /**
    * 一个数压到两字节
    */
   encode1to2(num) {
      var n1 = num >> 8;
      var n2 = num & 0xff;
      return String.fromCharCode(n1) + String.fromCharCode(n2);
   }
   /**
    * 两个数压到一个字节
    */
   encode2to1 = (op1, op2) => {
      op2 = op2 || 0;
      var code = (op1 << 4) + op2;
      return String.fromCharCode(code);
   }
   /**
    * 编码
    */
   encode() {
      var str = '';
      // 第1位游戏类型
      str += String.fromCharCode(this.gameType);
      // 第2、3位随机种子;
      str += this.encode1to2(this.seed);
      // 第4、5位操作长度
      var len = this.operations.length;
      str += this.encode1to2(len);
      // 第6-8位留空
      str += '678';
      // 操作数2压1
      var i;
      for (i = 0; i < len; i += 2) {
         var op1 = this.operations[i];
         // 0是最后补位的无效操作
         var op2 = this.operations[i + 1] || 0;
         str += this.encode2to1(op1, op2);
      }
      // 一个时间拆成两个数压到一个字节
      for (i = 0; i < len; i++) {
         var t = i === 0 ? this.times[i] : this.times[i] - this.times[i - 1];
         var op1 = t * 10 >> 0;
         var op2 = (t * 100 - op1 * 10) >> 0;
         str += this.encode2to1(op1, op2);
      }
      return str;
   }
   /**
    * 两个字节解成一个数
    */
   decode2to1 = (n1, n2) => {
      return (n1 << 8) + n2;
   }
   /**
    * 解码
    */
   decode(str) {
      this.reset();
      // 头信息8位
      var hl = 8;
      if (!str || str.length < hl) {
         return;
      }
      // 第1位游戏类型
      this.gameType = str.charCodeAt(0);
      // 第2、3位随机种子;
      this.seed = this.decode2to1(str.charCodeAt(1), str.charCodeAt(2));
      // 第4、5位操作长度
      var len = this.decode2to1(str.charCodeAt(3), str.charCodeAt(4));
      // console.log('len:', len);
      // 操作数除以2补整，是操作位数
      var opLen = len % 2 === 1 ? (len + 1) / 2 : len / 2;
      // 总长度可计算出
      var total = hl + opLen + len;
      if (str.length !== total) {
         return;
      }
      // 解码操作数
      var ops = this.operations;
      for (var i = 0; i < opLen; i++) {
         var code = str.charCodeAt(hl + i);
         var n1 = code >> 4;
         var n2 = code & 0xf;
         ops.push(n1);
         // 0是最后补位的无效操作
         if (n2 !== 0) {
            ops.push(n2);
         }
      }
      // 解码时间
      var times = this.times;
      for (var i = 0; i < len; i++) {
         var code = str.charCodeAt(hl + opLen + i);
         var n1 = code >> 4;
         var n2 = code & 0xf;
         var t = n1 / 10 + n2 / 100;
         times.push(t);
         this.timeAll += t;
      }
   }
   print() {
      console.log('print recorder:', this.gameType, this.seed, this.operations.length, this.timeAll);
      console.log("ops:", this.operations.join(','));
      console.log("times:", this.times.join(','));
   }
}

Recorder.test = function () {
   var r = new Recorder();
   r.add(2, 0.15);
   r.add(3, 0.43);
   r.add(4, 0.39);
   r.add(8, 0.85);
   r.add(1, 0.99);
   r.add(13, 1);
   var str = r.encode();
   r.print();
   console.log('encode to:', str, str.length);
   var r2 = new Recorder();
   r2.decode(str);
   console.log('decode:');
   r2.print();
}