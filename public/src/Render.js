/**
 * Created by kk on 2016/4/28.
 */

var settings = {
    Block:3,
}
var spriteCanvas = document.createElement('canvas');
function makeSprite(cellSize) {
    var spriteCtx = spriteCanvas.getContext('2d');
    var shaded = [
        // 0         +10        -10        -20
        ['#c1c1c1', '#dddddd', '#a6a6a6', '#8b8b8b'],
        ['#25bb9b', '#4cd7b6', '#009f81', '#008568'],
        ['#3397d9', '#57b1f6', '#007dbd', '#0064a2'],
        ['#e67e23', '#ff993f', '#c86400', '#a94b00'],
        ['#efc30f', '#ffdf3a', '#d1a800', '#b38e00'],
        ['#9ccd38', '#b9e955', '#81b214', '#659700'],
        ['#9c5ab8', '#b873d4', '#81409d', '#672782'],
        ['#e64b3c', '#ff6853', '#c62c25', '#a70010'],
        ['#898989', '#a3a3a3', '#6f6f6f', '#575757']
    ];
    var glossy = [
        //25         37         52         -21        -45
        ['#ffffff', '#ffffff', '#ffffff', '#888888', '#4d4d4d'],
        ['#7bffdf', '#9fffff', '#ccffff', '#008165', '#00442e'],
        ['#6cdcff', '#93feff', '#c2ffff', '#00629f', '#002c60'],
        ['#ffc166', '#ffe386', '#ffffb0', '#aa4800', '#650500'],
        ['#ffff6a', '#ffff8c', '#ffffb8', '#b68a00', '#714f00'],
        ['#efff81', '#ffffa2', '#ffffcd', '#6b9200', '#2c5600'],
        ['#dc9dfe', '#ffbeff', '#ffe9ff', '#5d287e', '#210043'],
        ['#ff9277', '#ffb497', '#ffe0bf', '#a7000a', '#600000'],
        ['#cbcbcb', '#ededed', '#ffffff', '#545454', '#1f1f1f']
    ];
    var tgm = [
        ['#7b7b7b', '#303030', '#6b6b6b', '#363636'],
        ['#f08000', '#a00000', '#e86008', '#b00000'],
        ['#00a8f8', '#0000b0', '#0090e8', '#0020c0'],
        ['#f8a800', '#b84000', '#e89800', '#c85800'],
        ['#e8e000', '#886800', '#d8c800', '#907800'],
        ['#f828f8', '#780078', '#e020e0', '#880088'],
        ['#00e8f0', '#0070a0', '#00d0e0', '#0080a8'],
        ['#78f800', '#007800', '#58e000', '#008800'],
        ['#7b7b7b', '#303030', '#6b6b6b', '#363636']
    ];
    var world = [];
    world[0] = tgm[0];
    world[1] = tgm[6];
    world[2] = tgm[2];
    world[3] = tgm[3];
    world[4] = tgm[4];
    world[5] = tgm[7];
    world[6] = tgm[5];
    world[7] = tgm[1];
    world[8] = tgm[8];

    spriteCanvas.width = cellSize * 9;
    spriteCanvas.height = cellSize;
    for (var i = 0; i < 9; i++) {
        var x = i * cellSize;
        if (settings.Block === 0) {
            // Shaded
            spriteCtx.fillStyle = shaded[i][1];
            spriteCtx.fillRect(x, 0, cellSize, cellSize);

            spriteCtx.fillStyle = shaded[i][3];
            spriteCtx.fillRect(x, cellSize / 2, cellSize, cellSize / 2);

            spriteCtx.fillStyle = shaded[i][0];
            spriteCtx.beginPath();
            spriteCtx.moveTo(x, 0);
            spriteCtx.lineTo(x + cellSize / 2, cellSize / 2);
            spriteCtx.lineTo(x, cellSize);
            spriteCtx.fill();

            spriteCtx.fillStyle = shaded[i][2];
            spriteCtx.beginPath();
            spriteCtx.moveTo(x + cellSize, 0);
            spriteCtx.lineTo(x + cellSize / 2, cellSize / 2);
            spriteCtx.lineTo(x + cellSize, cellSize);
            spriteCtx.fill();
        } else if (settings.Block === 1) {
            // Flat
            spriteCtx.fillStyle = shaded[i][0];
            spriteCtx.fillRect(x, 0, cellSize, cellSize);
        } else if (settings.Block === 2) {
            // Glossy
            var k = Math.max(~~(cellSize * 0.1), 1);

            var grad = spriteCtx.createLinearGradient(x, 0, x + cellSize, cellSize);
            grad.addColorStop(0.5, glossy[i][3]);
            grad.addColorStop(1, glossy[i][4]);
            spriteCtx.fillStyle = grad;
            spriteCtx.fillRect(x, 0, cellSize, cellSize);

            var grad = spriteCtx.createLinearGradient(x, 0, x + cellSize, cellSize);
            grad.addColorStop(0, glossy[i][2]);
            grad.addColorStop(0.5, glossy[i][1]);
            spriteCtx.fillStyle = grad;
            spriteCtx.fillRect(x, 0, cellSize - k, cellSize - k);

            var grad = spriteCtx.createLinearGradient(x + k, k, x + cellSize - k, cellSize - k);
            grad.addColorStop(0, shaded[i][0]);
            grad.addColorStop(0.5, glossy[i][0]);
            grad.addColorStop(0.5, shaded[i][0]);
            grad.addColorStop(1, glossy[i][0]);
            spriteCtx.fillStyle = grad;
            spriteCtx.fillRect(x + k, k, cellSize - k * 2, cellSize - k * 2);

        } else if (settings.Block === 3 || settings.Block === 4) {
            // Arika
            if (settings.Block === 4) tgm = world;
            var k = Math.max(~~(cellSize * 0.125), 1);

            spriteCtx.fillStyle = tgm[i][1];
            spriteCtx.fillRect(x, 0, cellSize, cellSize);
            spriteCtx.fillStyle = tgm[i][0];
            spriteCtx.fillRect(x, 0, cellSize, ~~(cellSize / 2));

            var grad = spriteCtx.createLinearGradient(x, k, x, cellSize - k);
            grad.addColorStop(0, tgm[i][2]);
            grad.addColorStop(1, tgm[i][3]);
            spriteCtx.fillStyle = grad;
            spriteCtx.fillRect(x + k, k, cellSize - k*2, cellSize - k*2);

            var grad = spriteCtx.createLinearGradient(x, k, x, cellSize);
            grad.addColorStop(0, tgm[i][0]);
            grad.addColorStop(1, tgm[i][3]);
            spriteCtx.fillStyle = grad;
            spriteCtx.fillRect(x, k, k, cellSize - k);

            var grad = spriteCtx.createLinearGradient(x, 0, x, cellSize - k);
            grad.addColorStop(0, tgm[i][2]);
            grad.addColorStop(1, tgm[i][1]);
            spriteCtx.fillStyle = grad;
            spriteCtx.fillRect(x + cellSize - k, 0, k, cellSize - k);
        }
    }
}

var colors = [
    //'cyan', 'yellow', 'purple', 'orange', 'blue', 'red', 'green',
    'rgb(30,144,255)', 'yellow', 'purple', 'orange', 'blue', 'red', 'green',
];

var Theme = [
    //white
    {
        bg:'rgb(225,225,225)',
    },
    //black
    {
        bg:'rgb(20,20,20)',
    },
]

var Render = function(game){
    this.scale = 1;

    this.game = game;
    this.playData = this.game.playData;
    this.tetris = this.game.tetris;
    this.canvas = $('#gameCanvas')[0];
    this.ctx = this.canvas.getContext( '2d' );
    this.baseSize = 30;
    this.smallSize = 20;
    this.areaW = 300;
    this.areaH = 600;
    this.myPos = {
        x:520,y:20
    }
    this.nextPos = {
        x:830,y:20
    }
    this.holdPos = {
        x:390,y:20
    }
    this.anotherPos = {
        x:100,y:20
    }
    this.playDataPos = {
        x:450,y:120
    }
    //makeSprite(this.baseSize);
    //this.drawData = {
    //    colorBlock: [],
    //};
    //for(var i = 0; i < 7; i++){
    //    this.drawData.colorBlock[i] = [];
    //}
};

Render.prototype = {
    constructor: Render,
    drawCell:function(x, y, idx, size, darkness) {
        this.ctx.drawImage(spriteCanvas, idx * this.baseSize, 0, this.baseSize, this.baseSize, x, y, size, size);
        if (darkness !== void 0) {
            //ctx.globalCompositeOperation = 'source-atop';
            this.ctx.fillStyle = 'rgba(0,0,0,' + darkness + ')';
            this.ctx.fillRect(x, y, size, size);
            //ctx.globalCompositeOperation = 'source-over';
        }
    },
    drawTextureBlock: function(pos, x, y, idx, size){
        this.drawCell(pos.x+this.baseSize * x, pos.y+this.baseSize * y, idx, size);
    },
    baseFillRect: function(x,y,w,h){
        this.ctx.fillRect(x*this.scale,y*this.scale,w*this.scale,h*this.scale);
    },
    baseStrokeRect: function(x,y,w,h){
        this.ctx.strokeRect(x*this.scale,y*this.scale,w*this.scale,h*this.scale);
    },
    baseFillText: function(txt, x, y){
        this.ctx.fillText(txt, x*this.scale, y*this.scale);
    },
    drawBlock: function(pos, x, y, shadow){
        this.baseFillRect(pos.x+this.baseSize * x, pos.y+this.baseSize * y, this.baseSize - 1 , this.baseSize - 1);
        if(!shadow)
            this.baseStrokeRect(pos.x+this.baseSize * x, pos.y+this.baseSize * y, this.baseSize - 1 , this.baseSize - 1 );
    },
    drawAnotherArea: function(){
        //this.ctx.clearRect(this.anotherPos.x,this.anotherPos.y,this.areaW-1,this.areaH-1);
        this.ctx.strokeStyle = 'black';
        this.baseStrokeRect(this.anotherPos.x,this.anotherPos.y,this.areaW-1,this.areaH-1);
        if(!this.game.otherTetris) return;
        var tetris = this.game.otherTetris;
        this.ctx.save();
        //this.ctx.shadowOffsetX = 2;
        //this.ctx.shadowOffsetY = 2;
        //this.ctx.shadowColor = 'rgba(100,100,100,0.5)';
        //this.ctx.shadowBlur = 5;
        for(var i = 0; i < tetris.row; i++){
            for(var j = 0; j < tetris.col; j++) {
                if(tetris.board[i][j]>0) {
                    this.ctx.fillStyle = tetris.playing ? colors[tetris.board[i][j] - 1 ] : "rgba(0,0,0,0.2)";
                    this.drawBlock(this.anotherPos, j, tetris.row-1-i);
                }
            }
        }

        this.drawShape(this.anotherPos, tetris.shape);
        this.ctx.restore();
    },
    drawShape: function(pos, shape){
        if(!shape) return;
        var _this = this;
        function drawFourBlocks(shadow){
            var px = shape.x;
            var py;
            var color;
            if(shadow){
                color = "rgba(0,0,0,0.2)";
                py = shape.shadowY;
            }
            else{
                color = colors[shape.shapeId-1];
                py = shape.y;
            }
            _this.ctx.fillStyle = _this.tetris.playing ? color : "rgba(0,0,0,1)";
            for(var i = 0; i < 4; i++){
                var x = px + shape.shapeModel.cells[shape.rotation][i*2];
                var y = py + shape.shapeModel.cells[shape.rotation][i*2+1];
                if(x<0||x>=_this.tetris.col||y<0||y>=_this.tetris.row)
                    continue;
                _this.drawBlock(pos, x, _this.tetris.row-1-y, shadow);
            }
        }
        if(_this.tetris.playing){
        //shape shadow
        drawFourBlocks(true);
        }
        //current shape
        drawFourBlocks(false);
    },
    drawMyArea: function(){
        //this.ctx.clearRect(this.myPos.x,this.myPos.y,this.areaW-1,this.areaH-1);
        this.ctx.strokeStyle = 'black';

        this.baseStrokeRect(this.myPos.x,this.myPos.y,this.areaW-1,this.areaH-1);

        this.ctx.save();
        //this.ctx.shadowOffsetX = 2;
        //this.ctx.shadowOffsetY = 2;
        //this.ctx.shadowColor = 'rgba(100,100,100,0.5)';
        //this.ctx.shadowBlur = 5;
        for(var i = 0; i < this.tetris.row; i++){
            for(var j = 0; j < this.tetris.col; j++) {
                if(this.tetris.board[i][j]>0) {
                    //this.drawTextureBlock(this.myPos, j, this.tetris.row-1-i, this.tetris.board[i][j]-1, this.baseSize);
                    this.ctx.fillStyle = this.tetris.playing ? colors[this.tetris.board[i][j] - 1 ] : "rgba(0,0,0,0.2)";
                    this.drawBlock(this.myPos, j, this.tetris.row-1-i);
                    //this.drawData.colorBlock[this.tetris.board[i][j]-1].push({
                    //    x:this.myPos.x+this.baseSize * j,
                    //    y: this.myPos.y+this.baseSize * (this.tetris.row-1-i),
                    //    size: this.baseSize
                    //});
                }
            }
        }

        this.drawShape(this.myPos, this.tetris.shape);
        this.drawNextShape();
        this.drawHoldShape();
        this.drawBufferBar();
        this.ctx.restore();
    },
    drawNextShape: function(){
        if(!this.tetris.nextShapes || this.tetris.nextShapes.length === 0) return;
        //this.ctx.clearRect(this.nextPos.x-1,this.nextPos.y-1,121,121);
        for(var i = 0; i < this.tetris.nextShapes.length; i++){
            var shape = this.tetris.nextShapes[i];
            var pos = {x:this.nextPos.x,y:this.nextPos.y+i*120};
            if(shape.shapeId>=3)
                pos.x += 15;
            this.ctx.fillStyle = colors[shape.shapeId-1];
            if(!this.tetris.playing)
                this.ctx.fillStyle = "rgba(0,0,0,0.2)";
            for(var j = 0; j < 4; j++){
                var x = 1+shape.shapeModel.cells[0][j*2];
                var y = 1+shape.shapeModel.cells[0][j*2+1];
                this.drawBlock(pos, x, 4-y);
            }
        }
    },
    drawHoldShape: function(){
        this.baseStrokeRect(this.holdPos.x+20,this.holdPos.y+10,80,100);
        if(!this.tetris.saveShape) return;
        var pos = {x:this.holdPos.x+20,y:this.holdPos.y+20};
        if(this.tetris.saveShape.shapeId>=3)
            pos.x += this.smallSize/2;
        this.ctx.fillStyle = colors[this.tetris.saveShape.shapeId-1];
        if(!this.tetris.playing)
            this.ctx.fillStyle = "rgba(0,0,0,0.2)";
        for(var i = 0; i < 4; i++){
            var x = 1+this.tetris.saveShape.shapeModel.cells[0][i*2];
            var y = 1+this.tetris.saveShape.shapeModel.cells[0][i*2+1];
            this.baseFillRect(pos.x+this.smallSize * x, pos.y+this.smallSize *(4-y), this.smallSize - 1 , this.smallSize - 1 );
            this.baseStrokeRect(pos.x+this.smallSize * x, pos.y+this.smallSize *(4-y), this.smallSize - 1 , this.smallSize - 1 );
        }
    },
    drawBufferBar: function(){
        if(this.game.setting.useBuffer){
            this.baseStrokeRect(this.myPos.x-11,this.myPos.y,10,this.areaH-1);
            var trashLine = this.tetris.trashes.length;
            if(trashLine > 0){
                this.ctx.fillStyle = "rgba(255,0,0,1)";
                this.baseFillRect(this.myPos.x-11,this.myPos.y+30*(20-trashLine),10,30*trashLine-1);
            }
        }
    },
    drawText: function(){
        this.ctx.save();
        this.ctx.font = "30px Arial";
        this.ctx.textBaseline = 'middle';
        var txt="Next:"
        var length = this.ctx.measureText(txt).width;
        this.baseFillText(txt, this.nextPos.x+60-length/2, this.nextPos.y+30);
        txt="Hold:"
        length = this.ctx.measureText(txt).width;
        this.baseFillText(txt, this.holdPos.x+60-length/2, this.nextPos.y+30);
        this.ctx.restore();
    },
    drawPlayData: function(){
        this.ctx.save();
        this.ctx.fillStyle = "rgba(0,0,0,1)";
        this.ctx.font = "25px Arial";
        this.ctx.textBaseline = 'middle';
        var length;
        var _this = this;
        var drawtext = function(txt, x, y){
            length = _this.ctx.measureText(txt).width;
            _this.baseFillText(txt, x-length/2, y+30);
        }
        var x = this.playDataPos.x, y = this.playDataPos.y;
        drawtext("time", x, y);
        drawtext("count", x, y+100);
        drawtext("speed", x, y+200);
        drawtext("lines", x, y+300);
        drawtext("attack", x, y+400);
        this.ctx.font = "20px Arial";
        drawtext(this.playData.time.toFixed(1), x, y+40);
        drawtext(this.playData.count, x, y+140);
        var speed = this.playData.time == 0 ? 0 : (this.playData.count/this.playData.time).toFixed(1);
        drawtext(speed, x, y+240);
        drawtext(this.playData.lines, x, y+340);
        drawtext(this.playData.attack, x, y+440);
        this.ctx.restore();
    },
    render: function(){
        //this.clearDrawData();
        //this.ctx.fillStyle = Theme[socket.data.user.setting.theme||0].bg;
        //this.ctx.fillRect(0,0,960,640);
        this.ctx.clearRect(0,0,960,640);
        this.drawMyArea();
        this.drawAnotherArea();
        this.drawText();
        this.drawPlayData();

        //this.draw();
    },
    //clearDrawData: function(){
    //    for(var i = 0; i < 7; i++){
    //        this.drawData.colorBlock[i] = [];
    //    }
    //},
    //draw: function(){
    //    this.ctx.strokeStyle = 'black';
    //    for(var i = 0; i < this.drawData.colorBlock.length; i++){
    //        var blocks = this.drawData.colorBlock[i];
    //        this.ctx.fillStyle = colors[i];
    //        for(var j = 0; j < blocks.length; j++){
    //            this.baseFillRect(blocks[j].x,blocks[j].y,blocks[j].size,blocks[j].size);
    //        }
    //    }
    //
    //},
    clear: function(){
        this.ctx.clearRect(0,0,960,640);
    }
};