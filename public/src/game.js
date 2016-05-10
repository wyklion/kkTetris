/**
 * Created by KK on 2016/4/24.
 */

var OPERTABLE = {
    ready:      0,
    dead:       1,

    left:       10,
    right:      11,
    down:       12,
    drop:       13,
    rotateL:    14,
    rotateR:    15,
    rotate180:  16,
    hold:       17,

    attack:     20,
    trash:      21,

    start:      100,
    gameover:   200,
};

var PlayData = function(){
    this.reset();
};
PlayData.prototype = {
    constructor: PlayData,
    reset: function(){
        this.time = 0;
        this.count = 0;
        this.score = 0;
        this.lines = 0;
        this.attack = 0;
    },
};

var GameUI = function(game){
    this.game = game;
    var _this = this;
    $('#playButton').on("click", function(){
        $(this).hide();
        _this.game.readyOrPlay();
    });
};
GameUI.prototype = {
    constructor: GameUI,
    reset: function(single){
        if(!single){
            $('#playButton').html("<h1>Ready(F2)</h1>");
            $('#myStatus').empty();
            $('#otherStatus').text('Waiting...')
            $('#otherName').text(socket.getRoomOtherUser());
        }
        else{
            $('#playButton').html("<h1>Play(F2)</h1>");
            $('#myStatus').empty();
            $('#otherStatus').empty();
        }
        $('#playButton').show();
    },
    someoneJoined: function(){
        $('#otherName').text(socket.getRoomOtherUser());
        this.reset(false);
    },
    someoneLeft: function(){
        $('#otherName').empty();
        this.reset(true);
    },
    readyOrPlay: function(){
        if(this.game.single){
            $('#playButton').hide();
            $('#myStatus').empty();
        }
        else{
            $('#playButton').hide();
            $('#myStatus').text("I'm ready!");
        }
    },
    otherReady: function(){
        $('#otherStatus').text("Is ready!");
    },
    startVS: function(){
        $('#myStatus').empty();
        $('#otherStatus').empty();
    },
    gameOver: function(win){
        if(win){
            $('#myStatus').text("Win!");
            $('#otherStatus').text("Lose!");
        }
        else{
            $('#myStatus').text("Lose!");
            $('#otherStatus').text("Win!");
        }
    },
};

var Game = function(){
    this.interval = 1;
    this.time = 0;
};
Game.prototype = {
    constructor: Game,
    init: function(){
        this.single = true;
        this.playing = false;
        this.ready = false;

        this.setting = {
            attackMode: "0124",
            tspinMode: "3T",
        }

        this.isPaused = false;
        this.firstGame = true;

        this.trashes = [];

        this.tetris = new Tetris(this, true);
        this.otherTetris = new Tetris(this, false);
        this.playData = new PlayData();
        this.renderer = new Render(this);
        this.mainLoop();

        this.ui = new GameUI(this);
        this.input();
    },
    updateInput: function() {
        this.keyManager.updateInput();
    },
    input: function(){
        var keyboard = socket.data.user.keyboard;
        if(!keyboard){
            keyboard = {left:37,right:39,down:70,drop:40,rotate:82,rotateRight:69,rotate180:87,hold:84,dasDelay:150,moveDelay:30};
        }
        var _this = this;
        this.keyManager = new KeyManager({
            socket: socket,
            keyboard:keyboard,
            left:{
                func:function(){return _this.tetris.moveLeft();}
            },
            right:{
                func:function(){return _this.tetris.moveRight();}
            },
            down:{
                func:function(){return _this.tetris.moveDown(true);}
            },
            drop:{
                func:function(){return _this.tetris.drop();}
            },
            rotate:{
                func:function(){_this.tetris.rotate(true);}
            },
            rotateRight:{
                func:function(){_this.tetris.rotate(false);}
            },
            rotate180:{
                func:function(){_this.tetris.rotate180();}
            },
            hold:{
                func:function(){_this.tetris.holdShape();}
            },
        });

        document.body.onkeydown = function( e ) {
            if(e.keyCode === 113){ // F2
                _this.readyOrPlay();
            }
            //else if(e.keyCode === 80) // P
            //    _this.pause();
            if(!_this.isPaused && _this.tetris.playing){
                _this.keyManager.onKeyDown(e.keyCode);
            }
        }
        document.body.onkeyup = function( e ) {
            _this.keyManager.onKeyUp(e.keyCode);
        }
    },
    readyOrPlay: function(){
        if(this.single){
            this.ui.readyOrPlay();
            if(this.firstGame){
                this.firstGame = false;
                this.tetris.start();
            }
            else{
                this.playData.reset();
                this.tetris.restart();
            }
        }
        else{
            if(!this.playing && !this.ready){
                console.log("ready...");
                this.ui.readyOrPlay();
                this.ready = true;
                this.playData.reset();
                this.tetris.init();
                socket.operate(OPERTABLE.ready);
            }
        }
    },
    otherReady: function(){
        console.log("other is ready...");
        this.ui.otherReady();
        this.otherTetris.init();
    },
    startVS: function(shapes){
        console.log("start vs...");
        this.ui.startVS();
        this.playing = true;
        this.ready = false;
        this.otherTetris.restart(shapes);
        this.tetris.restart(shapes);
    },
    gameOver: function(result){
        console.log(result);
        this.reset();
        if(result.win === socket.data.user.id)
            this.ui.gameOver(true);
        else
            this.ui.gameOver(false);
    },
    lose: function(){
        if(!this.single){
            socket.operate(OPERTABLE.dead);
        }
        else{
            this.reset();
        }
    },
    reset: function(){
        this.ui.reset(this.single);
        this.keyManager.stop();
        this.playing = false;
        this.tetris.playing = false;
        this.otherTetris.playing = false;
        this.trashes = [];
    },
    someoneJoined: function(){
        console.log("someoneJoined");
        this.ui.someoneJoined();
        this.single = false;
        this.playData.reset();
        this.tetris.init();
    },
    someoneLeft: function(){
        console.log("someoneLeft");
        this.ui.someoneLeft();
        this.otherTetris.init();
        this.single = true;
        this.ready = false;
        if(this.playing){
            this.playing = false;
            this.tetris.gameOver();
        }
    },
    trashPool: function(trash){
        //this.trashes.push(trash);
        this.tetris.hurt(trash);
    },
    calculateDeltaTime: function () {
        var now = Date.now();
        this._deltaTime = (now - this._lastUpdate) / 1000;
        this._lastUpdate = now;
    },
    mainLoop: function(){
        var _this = this;
        this._lastUpdate = Date.now();
        var callback = function () {
            _this.calculateDeltaTime();
            _this.update(_this._deltaTime);
            _this.aniHandle = requestAnimationFrame(callback);
        };
        callback();
    },
    clearFloorTime: function(){
        this.time = 0;
    },
    update: function(dt){
        if(this.isPaused) return;
        if(this.tetris.playing){
            this.playData.time += dt;
            this.time += dt;
            if(this.single){
                if(this.playData.lines >= 40){
                    this.tetris.gameOver();
                    return;
                }
            }
            while(this.time > this.interval){
                this.time -= this.interval;
                var result = this.tetris.moveDown();
                if(!this.single){
                    if(result.ok){
                        socket.operate(OPERTABLE.down, result.attack);
                    }
                }
            }
        }
        this.renderer.render();
    },
    pause: function(){
        this.isPaused = !this.isPaused;
    },
    dispose: function(){
        cancelAnimationFrame(this.aniHandle);
        this.renderer.clear();
        delete this;
    },
}
