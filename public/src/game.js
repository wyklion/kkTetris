/**
 * Created by KK on 2016/4/24.
 */

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
    this.reset();
};
GameUI.prototype = {
    constructor: GameUI,
    reset: function(){
        if(this.game.watch){
            $('#playButton').hide();
        }
        else{
            if(!this.game.single){
                $('#playButton').html("<h1>Ready(F2)</h1>");
                $('#myStatus').empty();
                $('#otherStatus').text('Waiting...')
                $('#otherName').text(socket.getRoomOtherUser());
            }
            else{
                $('#playButton').html("<h1>Play(F2)</h1>");
                $('#myStatus').empty();
                $('#otherStatus').empty();
                $('#otherName').empty();
            }
            $('#playButton').show();
        }
    },
    someoneJoined: function(userId, watch){
        if(!watch){
            $('#otherName').text(userId);
            this.reset(false);
        }
        else{
        }
    },
    someoneLeft: function(userId, watch){
        if(!watch){
            $('#otherName').empty();
        }
        else{
            if(this.game.hostUser === userId)
                $('#hostName').empty();
            else
                $('#otherName').empty();
        }
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
    userReady: function(userId){
        if(userId === this.game.hostUser){
            $('#myStatus').text("I'm ready!");
        }
        else{
            $('#otherStatus').text("Is ready!");
        }
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
    this.setting = {
        attackMode: "0124",
        tspinMode: "3T",
        useBuffer: true,
    }
    this.interval = 0.5;
    this.time = 0;
    this.single = true;
    this.watch = false;
    this.playing = false;
    this.ready = false;

    this.isPaused = false;
    this.firstGame = true;
};
Game.prototype = {
    constructor: Game,
    init: function(){
        if(!this.watch){
            this.tetris = new Tetris(this, true);
        }
        else{
            this.hostUser = socket.data.room.playUsers[0];
            this.otherUser = socket.data.room.playUsers[1];
            this.tetris = new Tetris(this, false);
        }
        this.otherTetris = new Tetris(this, false);
        this.playData = new PlayData();
        this.renderer = new Render(this);
        this.mainLoop();

        this.ui = new GameUI(this);
        if(!this.watch)
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
            leftFunc:function(){_this.tetris.moveLeft();},
            leftEndFunc:function(){_this.tetris.moveLeftToEnd();},
            rightFunc:function(){_this.tetris.moveRight();},
            rightEndFunc:function(){_this.tetris.moveRightToEnd();},
            downFunc:function(){_this.tetris.moveDown();},
            downEndFunc:function(){_this.tetris.moveDownToEnd();},
            dropFunc:function(){_this.tetris.drop();},
            rotateFunc:function(){_this.tetris.rotate(true);},
            rotateRightFunc:function(){_this.tetris.rotate(false);},
            rotate180Func:function(){_this.tetris.rotate180();},
            holdFunc:function(){_this.tetris.holdShape();},
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
    //for watch
    userReady: function(userId){
        console.log(userId,"ready");
        this.ui.userReady(userId);
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
        if(this.single){
            this.reset();
        }
    },
    reset: function(){
        this.ui.reset();
        this.keyManager.stop();
        this.playing = false;
        this.tetris.playing = false;
        this.otherTetris.playing = false;
    },
    someoneJoined: function(userId, watch){
        console.log("someoneJoined, ", watch?"watch":"play");
        this.ui.someoneJoined(userId, watch);
        if(!watch && !this.watch){
            this.single = false;
            this.ready = false;
            this.playData.reset();
            this.tetris.init();
        }
    },
    someoneLeft: function(userId, watch){
        console.log("someoneLeft", watch?"watcher":"player");
        this.ui.someoneLeft(userId, watch);
        if(!watch && !this.watch){
            this.otherTetris.init();
            this.single = true;
            this.ready = false;
            if(this.playing){
                this.playing = false;
                this.tetris.gameOver();
            }
        }
    },
    trashPool: function(trash){
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
                    socket.single(this.playData.time);
                    return;
                }
            }
            while(this.time > this.interval){
                this.time -= this.interval;
                this.tetris.moveDownNature();
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
