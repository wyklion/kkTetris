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
    this.tetris = this.game.tetris;
    this.canvas = $('#gameCanvas')[0];
    this.ctx = this.canvas.getContext( '2d' );
    this.baseSize = 30;
    this.middleSize = 25;
    this.smallSize = 20;
    this.areaW = this.baseSize * 10;
    this.areaH = this.baseSize * 20;
    this.myPos = {
        x:560,y:20
    }
    this.anotherPos = {
        x:100,y:20
    }
    this.playDataPos = {
        x:480,y:120
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
    drawBlock: function(pos, x, y, size, shadow){
        this.baseFillRect(pos.x+size*x, pos.y+size*y, size-1 , size-1);
        if(!shadow)
            this.baseStrokeRect(pos.x+size*x, pos.y+size*y, size-1 , size-1);
    },
    drawShape: function(pos, shape){
        if(!shape) return;
        var _this = this;
        var tetris = shape.tetris;
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
            _this.ctx.fillStyle = tetris.playing ? color : "rgba(0,0,0,1)";
            for(var i = 0; i < 4; i++){
                var x = px + shape.shapeModel.cells[shape.rotation][i*2];
                var y = py + shape.shapeModel.cells[shape.rotation][i*2+1];
                if(x<0||x>=tetris.col||y<0||y>=_this.tetris.row)
                    continue;
                _this.drawBlock(pos, x, tetris.row-1-y, _this.baseSize, shadow);
            }
        }
        if(tetris.playing){
            //shape shadow
            drawFourBlocks(true);
        }
        //current shape
        drawFourBlocks(false);
    },
    drawNextShape: function(pos, tetris, host){
        var nextPos;
        if(host)
            nextPos = {x:pos.x+300,y:pos.y};
        else
            nextPos = {x:pos.x-100,y:pos.y};
        if(!tetris.nextShapes || tetris.nextShapes.length === 0) return;
        //this.ctx.clearRect(this.nextPos.x-1,this.nextPos.y-1,121,121);
        for(var i = 0; i < tetris.nextShapes.length; i++){
            var shape = tetris.nextShapes[i];
            var newPos = {x:nextPos.x,y:nextPos.y+i*120};
            if(shape.shapeId>=3)
                newPos.x += 15;
            this.ctx.fillStyle = colors[shape.shapeId-1];
            if(!tetris.playing)
                this.ctx.fillStyle = "rgba(0,0,0,0.2)";
            for(var j = 0; j < 4; j++){
                var x = 1+shape.shapeModel.cells[0][j*2];
                var y = 1+shape.shapeModel.cells[0][j*2+1];
                this.drawBlock(newPos, x, 4-y, this.middleSize);
            }
        }
    },
    drawHoldShape: function(pos, tetris, host){
        if(!host) return;
        var holdPos = {x:pos.x-130,y:pos.y};
        //this.baseStrokeRect(holdPos.x+20,holdPos.y+10,80,100);
        if(!tetris.saveShape) return;
        var newPos = {x:holdPos.x+20,y:holdPos.y+20};
        if(tetris.saveShape.shapeId>=3)
            newPos.x += this.smallSize/2;
        this.ctx.fillStyle = colors[tetris.saveShape.shapeId-1];
        if(!tetris.playing)
            this.ctx.fillStyle = "rgba(0,0,0,0.2)";
        for(var i = 0; i < 4; i++){
            var x = 1+tetris.saveShape.shapeModel.cells[0][i*2];
            var y = 1+tetris.saveShape.shapeModel.cells[0][i*2+1];
            this.baseFillRect(newPos.x+this.smallSize * x, newPos.y+this.smallSize *(4-y), this.smallSize - 1 , this.smallSize - 1 );
            this.baseStrokeRect(newPos.x+this.smallSize * x, newPos.y+this.smallSize *(4-y), this.smallSize - 1 , this.smallSize - 1 );
        }
    },
    drawBufferBar: function(pos, tetris, host){
        var bufferPos = host ? {x:pos.x-11, y:pos.y} :{x:pos.x+tetris.col*this.baseSize, y:pos.y};
        if(this.game.setting.useBuffer){
            this.baseStrokeRect(bufferPos.x,bufferPos.y,10,this.areaH-1);
            var trashLine = tetris.trashes.length;
            if(trashLine > 0){
                if(!this.game.playing)
                    this.ctx.fillStyle = "rgba(0,0,0,1)";
                else
                    this.ctx.fillStyle = "rgba(255,0,0,1)";
                this.baseFillRect(bufferPos.x,bufferPos.y+30*(20-trashLine),10,30*trashLine-1);
            }
        }
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
        var hostData = this.game.tetris.playData;
        var txtTime = this.game.playTime.toFixed(1);
        var txtCount = hostData.count;
        var txtSpeed = this.game.playTime == 0 ? "0.0" : (hostData.count/this.game.playTime).toFixed(1);
        var txtLine = hostData.lines;
        var txtAttack = hostData.attack;
        if(!this.game.single){
            var otherData = this.game.otherTetris.playData;
            txtCount = otherData.count + " : " + txtCount;
            var otherSpeed = this.game.playTime == 0 ? "0.0" : (otherData.count/this.game.playTime).toFixed(1);
            txtSpeed = otherSpeed + " : " + txtSpeed;
            txtLine = otherData.lines + " : " + txtLine;
            txtAttack = otherData.attack + " : " + txtAttack;
        }
        drawtext(txtTime, x, y+40);
        drawtext(txtCount, x, y+140);
        drawtext(txtSpeed, x, y+240);
        drawtext(txtLine, x, y+340);
        drawtext(txtAttack, x, y+440);
        this.ctx.restore();
    },
    drawTetrisArea: function(pos, tetris, host){
        this.ctx.strokeStyle = 'black';
        this.baseStrokeRect(pos.x,pos.y,this.areaW-1,this.areaH-1);

        //this.ctx.save();
        for(var i = 0; i < tetris.row; i++){
            for(var j = 0; j < tetris.col; j++) {
                if(tetris.board[i][j]>0) {
                    //this.drawTextureBlock(pos, j, tetris.row-1-i, tetris.board[i][j]-1, this.baseSize);
                    this.ctx.fillStyle = tetris.playing ? colors[tetris.board[i][j] - 1 ] : "rgba(0,0,0,0.2)";
                    this.drawBlock(pos, j, tetris.row-1-i, this.baseSize);
                    //this.drawData.colorBlock[tetris.board[i][j]-1].push({
                    //    x:pos.x+this.baseSize * j,
                    //    y: pos.y+this.baseSize * (tetris.row-1-i),
                    //    size: this.baseSize
                    //});
                }
            }
        }

        this.drawShape(pos, tetris.shape);
        this.drawNextShape(pos, tetris, host);
        this.drawHoldShape(pos, tetris, host);
        this.drawBufferBar(pos, tetris, host);
        //this.ctx.restore();
    },
    drawTetrisText: function(pos, host){
        this.ctx.save();
        this.ctx.fillStyle = "rgba(0,0,0,1)";
        this.ctx.font = "30px Arial";
        this.ctx.textBaseline = 'middle';
        var txt="Next:"
        var length = this.ctx.measureText(txt).width;
        if(host){
            this.baseFillText(txt, pos.x+350-length/2, pos.y+30);
            txt="Hold:"
            length = this.ctx.measureText(txt).width;
            this.baseFillText(txt, pos.x-80-length/2, pos.y+30);
        }
        else
            this.baseFillText(txt, pos.x-50-length/2, pos.y+30);
        this.ctx.restore();
    },
    render: function(){
        //this.clearDrawData();
        //this.ctx.fillStyle = Theme[socket.data.user.setting.theme||0].bg;
        //this.ctx.fillRect(0,0,960,640);
        this.ctx.clearRect(0,0,960,640);
        this.drawTetrisArea(this.myPos, this.tetris, true);
        this.drawTetrisArea(this.anotherPos, this.game.otherTetris, false);
        this.drawTetrisText(this.myPos, true);
        this.drawTetrisText(this.anotherPos, false);

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