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
    hold:       16,

    start:      100,
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

var Game = function(){
    this.interval = 0.5;
    this.time = 0;
};
Game.prototype = {
    constructor: Game,
    init: function(){
        this.single = true;
        this.playing = false;
        this.ready = false;

        this.isPaused = false;
        this.firstGame = true;
        this.tetris = new Tetris(this, true);
        this.otherTetris = new Tetris(this, false);
        this.playData = new PlayData();
        this.renderer = new Render(this);
        this.mainLoop();
        this.input();
        this.initUI();
    },
    initUI: function(){
        this.wholeDiv = document.getElementById("wholeDiv");
        this.gameDiv = document.createElement("gameDiv");
        this.wholeDiv.appendChild(this.gameDiv);
        this.exitButton = new UIElement({
            e:'input',
            x:200,y:-50,
            w:100,h:50,
        }, this.gameDiv);
        this.exitButton.element.type = "button";
        this.exitButton.element.value = "Exit";
        this.exitButton.element.name = "Exit";
        this.exitButton.element.onclick= function(){
            socket.exitRoom();
        }
    },
    input: function(){
        var _this = this;
        this.keyManager = new KeyManager({
            socket: socket,
            left:{
                key:37,
                func:function(){_this.tetris.move(-1,0);}
            },
            right:{
                key:39,
                func:function(){_this.tetris.move(1,0);}
            },
            down:{
                key:70,
                func:function(){return _this.tetris.move(0,-1);}
            },
            drop:{
                key:40,
                func:function(){return _this.tetris.drop();}
            },
            rotate:{
                key:82,
                func:function(){_this.tetris.rotate(true);}
            },
            rotateRight:{
                key:69,
                func:function(){_this.tetris.rotate(false);}
            },
            hold:{
                key:84,
                func:function(){_this.tetris.holdShape();}
            },
        });

        document.body.onkeydown = function( e ) {
            if(e.keyCode === 113){ // F2
                _this.readyOrPlay();
            }
            else if(e.keyCode === 80) // P
                _this.pause();
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
                this.ready = true;
                this.playData.reset();
                this.tetris.init();
                socket.operate(OPERTABLE.ready);
            }
        }
    },
    otherReady: function(){
        console.log("other is ready...");
        this.otherTetris.init();
    },
    startVS: function(shapes){
        console.log("start vs...");
        this.playing = true;
        this.ready = false;
        this.otherTetris.restart(shapes);
        this.tetris.restart(shapes);
    },
    win: function(){
        this.keyManager.stop();
        this.playing = false;
        this.tetris.playing = false;
        this.otherTetris.playing = false;
    },
    lose: function(){
        this.keyManager.stop();
        if(!this.single){
            this.playing = false;
            socket.operate(OPERTABLE.dead);
            this.otherTetris.playing = false;
        }
    },
    someoneJoined: function(){
        console.log("someoneJoined");
        this.single = false;
        this.playData.reset();
        this.tetris.init();
    },
    someoneLeft: function(){
        console.log("someoneLeft");
        this.otherTetris.init();
        this.single = true;
        this.ready = false;
        if(this.playing){
            this.playing = false;
            this.tetris.gameOver();
        }
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
    update: function(dt){
        if(this.isPaused) return;
        if(this.tetris.playing){
            this.playData.time += dt;
            if(this.single && this.playData.time >= 60)
                this.tetris.gameOver();
            this.time += dt;
            while(this.time > this.interval){
                this.time -= this.interval;
                var attack = this.tetris.move(0,-1);
                socket.operate(OPERTABLE.down, attack);
            }
        }
        this.renderer.render();
    },
    pause: function(){
        this.isPaused = !this.isPaused;
    },
    dispose: function(){
        this.wholeDiv.removeChild(this.gameDiv);
        cancelAnimationFrame(this.aniHandle);
        this.renderer.clear();
        delete this;
    },
}
