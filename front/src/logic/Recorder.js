
var encodeTwoNumber = (op1, op2) => {
   op2 = op2 || 0;
   var code = (op1 << 4) + op2;
   return String.fromCharCode(code);
}

export default class Recorder {
   constructor() {
      this.operations = [];
      this.times = [];
   }
   add(operation, time) {
      this.operations.push(operation);
      this.times.push(time);
   }
   encode() {
      var strs = '';
      var gameType = 1;
      strs += String.fromCharCode(gameType);
      var len = this.operations.length;
      var l1 = len >> 8;
      var l2 = len & 0xff;
      strs += String.fromCharCode(l1);
      strs += String.fromCharCode(l2);
      strs += '34567';
      var i;
      for (i = 0; i < len; i += 2) {
         var op1 = this.operations[i];
         var op2 = this.operations[i + 1];
         strs += encodeTwoNumber(op1, op2);
         // console.log(op1, op2, strs);
      }
      for (i = 0; i < len; i++) {
         var t = this.times[i];
         if (t >= 1) t = 0.99;
         var op1 = t * 10 >> 0;
         var op2 = (t * 100 - op1 * 10) >> 0;
         strs += encodeTwoNumber(op1, op2);
      }
      return strs;
   }
   decode(strs) {
      var hl = 8;
      if (strs.length < hl) {
         return;
      }
      this.gameType = strs.charCodeAt(0);
      var l1 = strs.charCodeAt(1);
      var l2 = strs.charCodeAt(2);
      var len = (l1 << 8) + l2;
      // console.log('len:', len);
      var opLen = len % 2 === 1 ? (len + 1) / 2 : len / 2;
      if (strs.length < hl + opLen + len) {
         return;
      }
      var ops = this.operations = [];
      for (var i = 0; i < opLen; i++) {
         var code = strs.charCodeAt(hl + i);
         var op1 = code >> 4;
         var op2 = code & 0xf;
         ops.push(op1);
         if (op2 !== 0) {
            ops.push(op2);
         }
      }
      var opsTime = this.times = [];
      for (var i = 0; i < len; i++) {
         var code = strs.charCodeAt(hl + opLen + i);
         var op1 = code >> 4;
         var op2 = code & 0xf;
         var t = op1 / 10 + op2 / 100;
         opsTime.push(t);
      }
   }
   print() {
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
   var strs = r.encode();
   r.print();
   console.log('encode to:', strs, strs.length);
   var r2 = new Recorder();
   r2.decode(strs);
   console.log('decode:');
   r2.print();
}