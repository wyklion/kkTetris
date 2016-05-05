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

var Tetris = function(game, me){
    this.game = game;
    this.me = me;
    this.row = ROW;
    this.col = COL;
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
    holdShape: function(){
        if(this.holded) return;
        if(this.saveShape){
            if(!this.saveShape.check(this.shape.x, this.shape.y, 0))
                return;
            var shapeId = this.shape.shapeId;
            this.shape.setId(this.saveShape.shapeId);
            this.saveShape.setId(shapeId);
        }
        else{
            this.saveShape = this.shape;
            this.newShape();
        }
        this.holded = true;
    },
    freeze: function(){
        if(this.me)
            this.game.playData.count++;
        this.shape.freeze();
        this.clearLines();
        if(!this.checkOver())
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
        if(this.me){
            this.playing = false;
            this.game.lose();
        }
        //this.restart();
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
        var rowCount = lines.length;
        if(rowCount === 0)
            return;

        // play data
        this.game.playData.lines += rowCount;
        if(this.game.attackMode === "0124"){
            if(rowCount >= 2){
                this.attackLines = rowCount === 4 ? rowCount : rowCount - 1;
                this.game.playData.attack += this.attackLines;
            }
        }

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
    },
    rotate: function(anti){
        this.shape.rotate(anti);
    },
    rotate180: function(){
        this.shape.rotate180();
    },
    move: function(offX, offY){
        this.shape.move(offX, offY);
    },
    moveLeft: function(){
        var x = this.shape.x;
        this.move(-1, 0);
        return x != this.shape.x;
    },
    moveRight: function(){
        var x = this.shape.x;
        this.move(1, 0);
        return x != this.shape.x;
    },
    moveDown: function(){
        var x = this.shape.x;
        this.attackLines = 0;
        this.move(0, -1);
        return {ok: y != this.shape.y, attack: this.attackLines};
    },
    drop: function(){
        this.attackLines = 0;
        this.shape.drop();
        return this.attackLines;
    },
    trash: function(lines){
        console.log("get trash:", lines);
        //var idx = Math.floor(Math.random()*COL);
        //for(var )
    },
    print: function(){
        console.log(this.board);
    }
};
