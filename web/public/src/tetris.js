/**
 * Created by KK on 2016/4/24.
 */

var COL = 10;
var ROW = 20;
var SHAPES = {
    1: {
        id:1,
        name:"I",
        cells:[
            [-1,0,  0,0,    1,0,    2,0],
            [0,1,   0,0,    0,-1,   0,-2],
            [-1,-1, 0,-1,   1,-1,   2,-1],
            [1,1,   1,0,    1,-1,   1,-2],
        ],
    },
    2: {
        id:2,
        name:"O",
        cells:[
            [0,1,   1,1,    0,0,    1,0],
            [0,1,   1,1,    0,0,    1,0],
            [0,1,   1,1,    0,0,    1,0],
            [0,1,   1,1,    0,0,    1,0],
        ],
    },
    3: {
        id:3,
        name:"T",
        cells:[
            [0,1,   -1,0,   0,0,    1,0],
            [0,1,   -1,0,   0,0,    0,-1],
            [-1,0,  0,0,    1,0,    0,-1],
            [0,1,   0,0,    1,0,    0,-1],
        ],
    },
    4: {
        id:4,
        name:"L",
        cells:[
            [-1,0,  0,0,    1,0,    1,1],
            [-1,1,  0,1,    0,0,    0,-1],
            [-1,0,  0,0,    1,0,    -1,-1],
            [0,1,   0,0,    0,-1,   1,-1],
        ],
    },
    5: {
        id:5,
        name:"J",
        cells:[
            [-1,1,  -1,0,   0,0,    1,0],
            [0,1,   0,0,    0,-1,   -1,-1],
            [-1,0,  0,0,    1,0,    1,-1],
            [0,1,   1,1,    0,0,    0,-1],
        ],
    },
    6: {
        id:6,
        name:"Z",
        cells:[
            [-1,1,  0,1,    0,0,    1,0],
            [0,1,   0,0,    -1,0,   -1,-1],
            [-1,0,  0,0,    0,-1,   1,-1],
            [1,1,   1,0,    0,0,    0,-1],
        ],
    },
    7: {
        id:7,
        name:"S",
        cells:[
            [1,1,   0,1,    0,0,    -1,0],
            [-1,1,  -1,0,   0,0,    0,-1],
            [1,0,   0,0,    0,-1,   -1,-1],
            [0,1,   0,0,    1,0,    1,-1],
        ]
    },
}

var JLSTZ_KICK = [
    [
        [-1,0,  -1,-1,  0,2,    -1,2],  //L->0 1->0
        [1,0,   1,-1,   0,2,    1,2],   //R->0 3->0
    ],
    [
        [1,0,   1,1,    0,-2,   1,-2],  //0->L 0->1
        [1,0,   1,1,    0,-2,   1,-2],  //2->L 2->1
    ],
    [
        [1,0,   1,-1,   0,2,    1,2],   //R->2 3->2
        [-1,0,  -1,-1,  0,+2,   -1,2],  //L->2 1->2
    ],
    [
        [-1,0,  -1,1,   0,-2,   -1,-2], //2->R 2->3
        [-1,0,  -1,1,   0,-2,   -1,-2], //0->R 0->3
    ],
];
var I_KICK = [
    [
        [1,0,   -2,0,   1,-2,   -2,+1], //L->0 1->0
        [2,0,   -1,0,   2,1,    -1,-2], //R->0 3->0
    ],
    [
        [-1,0,  2,0,    -1,2,   2,-1],  //0->L 0->1
        [2,0,   -1,0,   2,1,    -1,-2], //2->L 2->1
    ],
    [
        [-1,0,  2,0,    -1,2,   2,-1],  //R->2 3->2
        [-2,0,  1,0,    -2,-1,  1,2],   //L->2 1->2
    ],
    [
        [1,0,   -2,0,   1,-2,   -2,1],  //2->R 2->3
        [-2,0,  1,0,    -2,-1,  1,2],   //0->R 0->3
    ],
]

var Shape = function(tetris, shapeId){
    this.tetris = tetris;
    this.init(shapeId);
};
Shape.prototype = {
    constructor: Shape,
    init: function(shapeId){
        this.shapeId = shapeId;
        this.shapeName = SHAPES[this.shapeId].name;
        this.shapeModel = SHAPES[this.shapeId];
        this.x = 4;
        this.y = 19;
        this.rotation = 0;
    },
    setId: function(id){
        this.shapeId = id;
        this.shapeName = SHAPES[this.shapeId].name;
        this.shapeModel = SHAPES[this.shapeId];
        this.rotation = 0;
    },
    checkSelf: function(){
        var ok = this.check(this.x, this.y, this.rotation);
        if(ok)
            this.makeShadow();
        return ok;
    },
    checkDown: function(){
        return this.check(this.x, this.y-1, this.rotation);
    },
    check: function(px,py,r){
        var board = this.tetris.board;
        for(var i = 0; i < 4; i++){
            var x = px+this.shapeModel.cells[r][i*2];
            var y = py+this.shapeModel.cells[r][i*2+1];
            if(x<0||x>=this.tetris.col||y<0||y>this.tetris.row)
                return false;
            if(board[y][x] > 0)
                return false;
        }
        return true;
    },
    checkJLSTZ: function(r, antiClock){
        var tests = JLSTZ_KICK[r][antiClock?1:0];
        for(var i = 0; i < 4; i++){
            var x = tests[i*2];
            var y = tests[i*2+1];
            if(this.check(this.x+x, this.y+y, r)){
                this.x += x;
                this.y += y;
                return true;
            }
        }
        return false;
    },
    checkI: function(r, antiClock){
        var tests = I_KICK[r][antiClock?1:0];
        for(var i = 0; i < 4; i++){
            var x = tests[i*2];
            var y = tests[i*2+1];
            if(this.check(this.x+x, this.y+y, r)){
                this.x += x;
                this.y += y;
                return true;
            }
        }
        return false;
    },
    rotateCheck: function(r, rType){
        if(this.check(this.x, this.y, r))
            return true;
        if(rType === "180"){
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
    },
    makeShadow: function(){
        this.shadowY = this.y;
        var offY = 0;
        while(this.check(this.x, this.y-offY-1, this.rotation)){
            offY++;
        }
        this.shadowY = this.y-offY;
    },
    freeze: function(){
        for(var i = 0; i < 4; i++){
            var x = this.x + this.shapeModel.cells[this.rotation][i*2];
            var y = this.y + this.shapeModel.cells[this.rotation][i*2+1];
            this.tetris.board[y][x] = this.shapeId;
        }
    },
    rotate: function(antiClock){
        var r,rType;
        if(antiClock){
            rType = "left";
            r = this.rotation+1;
            if(r>3) r = 0;
        }
        else{
            rType = "right";
            r = this.rotation-1;
            if(r<0) r = 3;
        }
        if(this.rotateCheck(r, rType)){
            this.rotation = r;
            this.makeShadow();
            return true;
        }
        return false;
    },
    rotate180: function(){
        var r = this.rotation+2;
        if(r>3) r -= 4;
        if(this.rotateCheck(r, "180")){
            this.rotation = r;
            this.makeShadow();
            return true;
        }
        return false;
    },
    move: function(offX,offY){
        if(this.check(this.x+offX, this.y+offY, this.rotation)){
            this.x += offX;
            this.y += offY;
            if(offX != 0){
                this.makeShadow();
            }
            return true;
        }
        if(offY == -1){
            this.tetris.freeze();
        }
        return false;
    },
    drop: function(){
        var offY = -1;
        var ok = this.check(this.x, this.y+offY, this.rotation);
        while(ok){
            offY--;
            ok = this.check(this.x, this.y+offY, this.rotation);
        }
        this.y = this.y + offY+1;
        this.tetris.freeze();
    },
};

var RandomGenerator = function(){
    var shapes = [];
    for(var i = 0; i < 100; i++){
        var bag = [1,2,3,4,5,6,7];
        for(var j = 0; j < 7; j++){
            var idx = Math.floor(Math.random()*bag.length);
            shapes.push(bag[idx])
            bag.splice(idx, 1);
        }
    }
    return shapes;
};

var Combo = [0,0,0,1,1,2,2,3,3,4,4,4,5];

var Tetris = function(game, me){
    this.game = game;
    this.me = me;
    this.row = ROW;
    this.col = COL;
    this.playData = new PlayData();
    this.init();
};

Tetris.prototype = {
    constructor: Tetris,
    init: function(){
        this.board = [];
        for(var i = 0; i < this.row+1; i++){
            this.board[i] = [];
            for(var j = 0; j < this.col; j++){
                this.board[i][j] = 0;
            }
        }
        this.shapes = [];
        this.shape = null;
        this.nextShapes = [];
        this.saveShape = null;
        this.playing = false;

        this.lastClear = false;
        this.lastRotate = false;
        this.combo = 0;

        //when setting.buffer == ture;
        this.trashes = [];
    },
    start: function(shapes){
        if(shapes){
            for(var i = 0; i < shapes.length; i++)
                this.shapes.push(shapes[i]);
        }
        else
            this.shapes = RandomGenerator();
        for(var i = 0; i < 3; i++){
            var shapeId = this.shapes.shift();
            this.nextShapes[i] = new Shape(this, shapeId);
        }

        this.newShape();
        this.playing = true;
    },
    newShape: function(){
        this.holded = false;
        this.shape = this.nextShapes.shift();
        //var shapeId = Math.ceil(Math.random()*7);
        var shapeId = this.shapes.shift();
        if(!shapeId){
            this.gameOver();
            return;
        }
        this.nextShapes.push(new Shape(this, shapeId));
        if(!this.shape.checkSelf())
            this.gameOver();
    },
    freeze: function(){
        this.playData.count++;
        this.attackLines = 0;
        this.shape.freeze();
        this.clearLines();
        if(!this.game.single)
            this.checkAttack();
        this.newShape();
    },
    checkOver: function(){
        for(var i = 0; i < this.col; i++){
            if(this.board[this.row][i] > 0){
                this.gameOver();
                return true;
            }
        }
        return false;
    },
    gameOver: function(){
        this.playing = false;
        if(this.me){
            this.operate(OPERTABLE.dead);
            this.game.lose();
        }
    },
    restart: function(shapes){
        this.init();
        this.start(shapes);
    },
    clearLines: function(){
        var lines = [];
        for(var y = 0; y < this.row; y++) {
            var full = true;
            for (var x = 0; x < this.col; x++) {
                if(this.board[y][x] == 0 ){
                    full = false;
                    break;
                }
            }
            if(full)
                lines.push(y);
        }
        this.clearRowCount = lines.length;
        if(this.clearRowCount === 0){
            this.combo = 0;
            return;
        }

        var attackLine = this.checkClear(this.clearRowCount);

        var line = lines.shift();
        var moveTable = [];
        for(var i = 0; i < this.row; i++){
            if(line == undefined || i < line){
                moveTable.push(i);
                continue;
            }
            else if(i == line){
                line = lines.shift();
                continue;
            }
        }
        //console.log(moveTable);
        for(var i = 0; i < moveTable.length; i++){
            for(var x = 0; x < this.col; x++)
                this.board[i][x] = this.board[moveTable[i]][x];
        }
        for(var i = moveTable.length; i < this.row; i++){
            for(var x = 0; x < this.col; x++)
                this.board[i][x] = 0;
        }

        //check all clear
        var allclear = true;
        for(var i = 0; i < COL; i++){
            if(this.board[0][i] > 0){
                allclear = false;
                break;
            }
        }

        //data...
        if(allclear)
            this.attackLines = attackLine + 6;
        else
            this.attackLines = attackLine;

        this.playData.attack += this.attackLines;
    },
    //both ...
    checkClear: function(lines){
        this.combo++;
        this.playData.lines += lines;
        var attackLine;
        if(this.checkTspin()){
            if(this.lastClear)
                attackLine = lines === 3 ? 8 : lines * 2 + 1;
            else
                attackLine = lines * 2;
            this.lastClear = true;
        }
        else if(this.game.setting.attackMode === "0124") {
            if (lines >= 2) {
                if (lines === 4) {
                    if(this.lastClear)
                        attackLine = 5;
                    else
                        attackLine = 4;
                    this.lastClear = true;
                }
                else {
                    attackLine = lines - 1;
                    this.lastClear = false;
                }
            }
            else
                attackLine = 0;
        }
        attackLine += this.combo >= 11 ? 5 : Combo[this.combo];
        return attackLine;
    },
    checkTspin: function(){
        if(this.game.setting.tspinMode === "3T"){
            if(!this.lastRotate || this.shape.shapeId !== 3) return false;
            var x = this.shape.x, y = this.shape.y;
            if(y===0){
                if(this.board[y+1][x-1]>0||this.board[y+1][x+1]>0)
                    return true;
            }
            else if(x===0){
                if(this.board[y+1][x+1]>0||this.board[y-1][x+1]>0)
                    return true;
            }
            else if(x===COL-1){
                if(this.board[y+1][x-1]>0||this.board[y-1][x-1]>0)
                    return true;
            }
            else{
                var t = 0;
                if(this.board[y+1][x-1]>0) t++;
                if(this.board[y+1][x+1]>0) t++;
                if(this.board[y-1][x-1]>0) t++;
                if(this.board[y-1][x+1]>0) t++;
                if(t>=3) return true;
            }
        }
        return false;
    },
    holdShape: function(){
        if(this.holded) return;
        if(this.saveShape){
            if(!this.saveShape.check(4, 19, 0))
                return;
            var shapeId = this.shape.shapeId;
            this.shape.init(this.saveShape.shapeId);
            this.shape.makeShadow();
            this.saveShape.setId(shapeId);
        }
        else{
            this.saveShape = this.shape;
            this.newShape();
        }
        this.holded = true;
        this.operate(OPERTABLE.hold);
    },
    rotate: function(anti){
        var ok = this.shape.rotate(anti);
        if(ok){
            if(anti)
                this.operate(OPERTABLE.rotateL);
            else
                this.operate(OPERTABLE.rotateR);
            this.lastRotate = true;
            this.checkFloor();
        }
    },
    rotate180: function(){
        var ok = this.shape.rotate180();
        if(ok){
            this.operate(OPERTABLE.rotate180);
            this.lastRotate = true;
            this.checkFloor();
        }
    },
    move: function(offX, offY){
        return this.shape.move(offX, offY);
    },
    moveLeft: function(){
        var ok = this.move(-1, 0);
        if(ok){
            this.lastRotate = false;
            this.checkFloor();
            this.operate(OPERTABLE.left);
        }
        return ok;
    },
    moveLeftToEnd: function(){
        this.operate(OPERTABLE.leftEnd);
        while(this.move(-1,0)){
            this.lastRotate = false;
            this.checkFloor();
        }
    },
    moveRight: function(){
        var ok = this.move(1, 0);
        if(ok){
            this.lastRotate = false;
            this.checkFloor();
            this.operate(OPERTABLE.right);
        }
        return ok;
    },
    moveRightToEnd: function(){
        this.operate(OPERTABLE.rightEnd);
        while(this.move(1,0)){
            this.lastRotate = false;
            this.checkFloor();
        }
    },
    moveDown: function(){
        if(!this.shape.checkDown())
            return;
        this.operate(OPERTABLE.down);
        this.move(0, -1);
        this.lastRotate = false;
        this.checkFloor();
    },
    moveDownToEnd: function(){
        this.operate(OPERTABLE.downEnd);
        while(this.shape.checkDown()){
            this.move(0, -1);
            this.lastRotate = false;
            this.checkFloor();
        }
    },
    moveDownNature: function(){
        this.operate(OPERTABLE.downNature);
        this.move(0, -1);
    },
    drop: function(){
        this.attackLines = 0;
        this.operate(OPERTABLE.drop);
        this.shape.drop();
    },
    checkFloor: function(){
        if(this.shape.floor){
            if(this.shape.floorCount<15){
                this.shape.floorCount++;
                this.game.clearFloorTime();
            }
        }
        else if(!this.shape.checkDown()){
            this.shape.floor = true;
            this.shape.floorCount = 0;
            this.game.clearFloorTime();
        }
    },
    //=============== for vs game =================
    //only me
    operate: function(oper, data){
        if(!this.me) return;
        if(!this.game.single)
            socket.operate(oper, data);
    },
    //both, but only me send operate
    checkAttack: function(){
        if(this.game.setting.useBuffer){
            if(this.clearRowCount === 0){
                if(this.trashes.length > 0){
                    this.riseRow(this.trashes);
                    //console.log("tell other i got trash...");
                    this.trashes = [];
                }
            }
            else if(this.trashes.length >= this.attackLines){
                this.trashes.splice(0, this.attackLines);
            }
            else{
                this.attack(this.attackLines-this.trashes.length);
                this.trashes = [];
            }
        }
        else{
            this.attack(this.attackLines);
        }
        //if(!this.me)
        //    console.log("other trash:", this.trashes);
    },
    //only me...
    attack: function(lines){
        if(!this.me) return;
        var trash = [];
        var hole = Math.floor(Math.random()*COL);
        for(var i = 0; i < lines; i++)
            trash.push(hole);
        this.operate(OPERTABLE.attack, trash);
    },
    //both...
    hurt: function(trash) {
        if (this.game.setting.useBuffer) {
            this.trashes = this.trashes.concat(trash);
            this.operate(OPERTABLE.hurt, trash);
            //if(!this.me)
            //    console.log("other trash:", this.trashes);
        }
        else {
            if(this.me)
                this.realHurt(trash);
        }
    },
    //only me... useBuffer = false
    realHurt: function(trash){
        var dead = this.riseRow(trash);

        var ok = this.shape.check(this.shape.x,this.shape.y,this.shape.rotation);
        var offY = 0;
        while(!ok && this.shape.y<19){
            offY++;
            this.shape.y++;
            ok = this.shape.check(this.shape.x,this.shape.y,this.shape.rotation);
        }

        this.shape.makeShadow();

        //console.log("tell other i got trash...");
        this.operate(OPERTABLE.trash, {trash:trash,offY:offY});

        if(!ok)
            dead = true;
        if(dead){
            this.gameOver();
        }
    },
    //both use...
    riseRow: function(trash){
        var dead = false;
        var trashLengh = trash.length;
        for(var y = this.row; y >=trashLengh; y--){
            for(var x = 0; x < this.col; x++){
                if(y >= this.row - trashLengh && this.board[y][x] > 0)
                    dead = true;
                this.board[y][x] = this.board[y - trashLengh][x];
            }
        }
        for(var i = 0; i < trashLengh; i++){
            var blank = trash[i];
            var id = 1+Math.floor(Math.random()*7);
            for(var col = 0; col < COL; col++){
                if(col === blank){
                    this.board[trashLengh-1-i][col] = 0;
                }
                else
                    this.board[trashLengh-1-i][col] = id;
            }
        }
        return dead;
    },
    //only other... useBuffer = false
    trash: function(data){
        //console.log("other get trash:", data.trash, data.offY);
        this.riseRow(data.trash);
        this.shape.y += data.offY;
        this.shape.makeShadow();
    },
    print: function(){
        console.log(this.board);
    }
};
