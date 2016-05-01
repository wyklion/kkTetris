/**
 * Created by kk on 2016/4/28.
 */

var colors = [
    'cyan', 'yellow', 'purple', 'orange', 'blue', 'red', 'green',
];

var Render = function(game){
    this.game = game;
    this.playData = this.game.playData;
    this.tetris = this.game.tetris;
    this.canvas = document.getElementsByTagName( 'canvas' )[ 0 ];
    this.ctx = this.canvas.getContext( '2d' );
    this.baseW = 30;
    this.baseH = 30;
    this.smallW = 20;
    this.smallH = 20;
    this.areaW = 300;
    this.areaH = 600;
    this.myPos = {
        x:520,y:20
    }
    this.nextPos = {
        x:830,y:20
    }
    this.holdPos = {
        x:830,y:150
    }
    this.anotherPos = {
        x:120,y:20
    }
    this.playDataPos = {
        x:470,y:20
    }
};

Render.prototype = {
    constructor: Render,
    drawBlock: function(pos, x, y, shadow){
        this.ctx.fillRect(pos.x+this.baseW * x, pos.y+this.baseH * y, this.baseW - 1 , this.baseH - 1 );
        if(!shadow)
            this.ctx.strokeRect(pos.x+this.baseW * x, pos.y+this.baseH * y, this.baseW - 1 , this.baseH - 1 );
    },
    drawAnotherArea: function(){
        //this.ctx.clearRect(this.anotherPos.x,this.anotherPos.y,this.areaW-1,this.areaH-1);
        this.ctx.strokeStyle = 'black';
        this.ctx.strokeRect(this.anotherPos.x,this.anotherPos.y,this.areaW-1,this.areaH-1);
        if(!this.game.otherTetris) return;
        var tetris = this.game.otherTetris;
        this.ctx.save();
        this.ctx.shadowOffsetX = 2;
        this.ctx.shadowOffsetY = 2;
        this.ctx.shadowColor = 'rgba(100,100,100,0.5)';
        this.ctx.shadowBlur = 5;
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

        this.ctx.strokeRect(this.myPos.x,this.myPos.y,this.areaW-1,this.areaH-1);

        this.ctx.save();
        this.ctx.shadowOffsetX = 2;
        this.ctx.shadowOffsetY = 2;
        this.ctx.shadowColor = 'rgba(100,100,100,0.5)';
        this.ctx.shadowBlur = 5;
        for(var i = 0; i < this.tetris.row; i++){
            for(var j = 0; j < this.tetris.col; j++) {
                if(this.tetris.board[i][j]>0) {
                    this.ctx.fillStyle = this.tetris.playing ? colors[this.tetris.board[i][j] - 1 ] : "rgba(0,0,0,0.2)";
                    this.drawBlock(this.myPos, j, this.tetris.row-1-i);
                }
            }
        }

        this.drawShape(this.myPos, this.tetris.shape);
        this.drawNextShape();
        this.drawHoldShape();
        this.ctx.restore();
    },
    drawNextShape: function(){
        if(!this.tetris.nextShape) return;
        //this.ctx.clearRect(this.nextPos.x-1,this.nextPos.y-1,121,121);
        var pos = {x:this.nextPos.x,y:this.nextPos.y};
        if(this.tetris.nextShape.shapeId>=3)
            pos.x += 15;
        this.ctx.fillStyle = colors[this.tetris.nextShape.shapeId-1];
        if(!this.tetris.playing)
            this.ctx.fillStyle = "rgba(0,0,0,0.2)";
        for(var i = 0; i < 4; i++){
            var x = 1+this.tetris.nextShape.shapeModel.cells[0][i*2];
            var y = 1+this.tetris.nextShape.shapeModel.cells[0][i*2+1];
            this.drawBlock(pos, x, 4-y);
        }
    },
    drawHoldShape: function(){
        this.ctx.strokeRect(this.holdPos.x,this.holdPos.y,120,120);
        if(!this.tetris.saveShape) return;
        var pos = {x:this.holdPos.x+20,y:this.holdPos.y+20};
        if(this.tetris.saveShape.shapeId>=3)
            pos.x += this.smallH/2;
        this.ctx.fillStyle = colors[this.tetris.saveShape.shapeId-1];
        if(!this.tetris.playing)
            this.ctx.fillStyle = "rgba(0,0,0,0.2)";
        for(var i = 0; i < 4; i++){
            var x = 1+this.tetris.saveShape.shapeModel.cells[0][i*2];
            var y = 1+this.tetris.saveShape.shapeModel.cells[0][i*2+1];
            this.ctx.fillRect(pos.x+this.smallW * x, pos.y+this.smallH *(4-y), this.smallW - 1 , this.smallH - 1 );
            this.ctx.strokeRect(pos.x+this.smallW * x, pos.y+this.smallH *(4-y), this.smallW - 1 , this.smallH - 1 );
        }
    },
    drawText: function(){
        this.ctx.save();
        this.ctx.font = "30px Arial";
        this.ctx.textBaseline = 'middle';
        var txt="Next:"
        var length = this.ctx.measureText(txt).width;
        this.ctx.fillText(txt, this.nextPos.x+60+-length/2, this.nextPos.y+30);
        txt="Hold:"
        length = this.ctx.measureText(txt).width;
        this.ctx.fillText(txt, this.holdPos.x+60+-length/2, this.holdPos.y+30);
        this.ctx.restore();
    },
    drawPlayData: function(){
        this.ctx.save();
        this.ctx.font = "25px Arial";
        this.ctx.textBaseline = 'middle';
        var length;
        var _this = this;
        var drawtext = function(txt, x, y){
            length = _this.ctx.measureText(txt).width;
            _this.ctx.fillText(txt, x-length/2, y+30);
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
        this.ctx.clearRect(0,0,960,640);
        this.drawMyArea();
        this.drawAnotherArea();
        this.drawText();
        this.drawPlayData();
    },
    clear: function(){
        this.ctx.clearRect(0,0,960,640);
    }
};