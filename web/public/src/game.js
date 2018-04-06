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
    if(!this.game.watch){
        $('#playButton').on("click", function(){
            $(this).hide();
            _this.game.readyOrPlay();
        });
    }
    this.reset();
};
GameUI.prototype = {
    constructor: GameUI,
    reset: function(){
        if(this.game.watch){
            $('#playButton').hide();
            var _this = this;
            function checkUser(user, nameId, statId){
                if(user){
                    $(nameId).text(user);
                    if(_this.game.playing){
                        $(statId).css("color", "red");
                        $(statId).text("Is playing...");
                    }
                    else if(socket.data.room.ready[user]){
                        $(statId).css("color", "orange");
                        $(statId).text("I'm ready!");
                    }
                    else{
                        $(statId).css("color", "blue");
                        $(statId).text("Waiting...");
                    }
                }
                else{
                    $(nameId).empty();
                    $(statId).empty();
                }
            }
            checkUser(this.game.hostUser, '#hostName', '#hostStatus');
            checkUser(this.game.otherUser, '#otherName', '#otherStatus');
        }
        else{
            if(!this.game.single){
                $('#playButton').html("<h1>Ready(F2)</h1>");
                $('#hostStatus').empty();
                $('#otherStatus').css("color", "blue");
                $('#otherStatus').text('Waiting...')
                $('#hostName').text(this.game.hostUser);
                $('#otherName').text(this.game.otherUser);
            }
            else{
                $('#playButton').html("<h1>Play(F2)</h1>");
                $('#hostStatus').empty();
                $('#otherStatus').empty();
                $('#hostName').text(this.game.hostUser);
                $('#otherName').empty();
            }
            $('#playButton').show();
        }
    },
    someoneJoined: function(userId, watch){
        if(!watch){
            $('#otherName').text(userId);
            this.reset();
        }
        else{
        }
    },
    someoneLeft: function(userId, watch){
        if(!watch){
            $('#otherName').empty();
            this.reset();
        }
        else{
            //if(this.game.hostUser === userId)
            //    $('#hostName').empty();
            //else
            //    $('#otherName').empty();
        }
    },
    readyOrPlay: function(){
        if(this.game.single){
            $('#playButton').hide();
            $('#hostStatus').empty();
        }
        else{
            $('#playButton').hide();
            $('#hostStatus').css("color", "orange");
            $('#hostStatus').text("I'm ready!");
        }
    },
    userReady: function(userId){
        if(userId === this.game.hostUser){
            $('#hostStatus').css("color", "orange");
            $('#hostStatus').text("I'm ready!");
        }
        else{
            $('#otherStatus').css("color", "orange");
            $('#otherStatus').text("Is ready!");
        }
    },
    startVS: function(){
        $('#hostStatus').empty();
        $('#otherStatus').empty();
    },
    gameOver: function(winUser){
        if(this.game.hostUser === winUser){
            $('#hostStatus').css("color", "green");
            $('#hostStatus').text("Win!");
            $('#otherStatus').css("color", "purple");
            $('#otherStatus').text("Lose!");
        }
        else{
            $('#hostStatus').css("color", "purple");
            $('#hostStatus').text("Lose!");
            $('#otherStatus').css("color", "green");
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
    this.playTime = 0;
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
            this.hostUser = socket.data.user.id;
            if(!this.single)
                this.otherUser = socket.data.room.playUsers[0] === this.hostUser ? socket.data.room.playUsers[1] : socket.data.room.playUsers[0];
        }
        else{
            this.hostUser = socket.data.room.playUsers[0];
            this.otherUser = socket.data.room.playUsers[1];
            this.tetris = new Tetris(this, false);
            this.playing = socket.data.room.playing;
        }
        this.otherTetris = new Tetris(this, false);
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

        this.onKeyDown = function( e ) {
            if(e.keyCode === 113){ // F2
                _this.readyOrPlay();
            }
            //else if(e.keyCode === 80) // P
            //    _this.pause();
            if(!_this.isPaused && _this.tetris.playing){
                _this.keyManager.onKeyDown(e.keyCode);
            }
            if(e.keyCode === 38 || e.keyCode === 40 || e.keyCode === 32)
                e.preventDefault();
        }
        this.onKeyUp = function( e ) {
            _this.keyManager.onKeyUp(e.keyCode);
        }

        document.body.addEventListener("keydown", this.onKeyDown, false);
        document.body.addEventListener("keyup", this.onKeyUp, false);
    },
    readyOrPlay: function(){
        if(this.single){
            this.ui.readyOrPlay();
            this.playTime = 0;
            this.tetris.playData.reset();
            if(this.firstGame){
                this.firstGame = false;
                this.tetris.start();
            }
            else{
                this.tetris.restart();
            }
        }
        else{
            if(!this.playing && !this.ready){
                console.log("ready...");
                this.ui.readyOrPlay();
                this.ready = true;
                this.tetris.init();
                socket.operate(OPERTABLE.ready);
            }
        }
    },
    //for watch
    userReady: function(userId){
        console.log(userId,"ready");
        if(this.hostUser === userId)
            this.tetris.init();
        else if(this.otherUser === userId)
            this.otherTetris.init();
        this.ui.userReady(userId);
    },
    startVS: function(shapes){
        console.log("start vs...");
        this.ui.startVS();
        this.playing = true;
        this.ready = false;
        this.playTime = 0;
        this.tetris.playData.reset();
        this.otherTetris.playData.reset();
        this.tetris.restart(shapes);
        this.otherTetris.restart(shapes);
    },
    gameOver: function(result){
        console.log(result);
        this.reset();
        this.ui.gameOver(result.win);
    },
    lose: function(){
        if(this.single){
            this.reset();
        }
    },
    reset: function(){
        this.ui.reset();
        if(!this.watch)
            this.keyManager.stop();
        this.playing = false;
        this.tetris.playing = false;
        this.otherTetris.playing = false;
    },
    someoneJoined: function(userId, watch){
        console.log(userId+" joined to ", watch?"watch":"play");
        if(this.hostUser)
            this.otherUser = userId;
        else
            this.hostUser = userId;
        if(!watch){
            this.single = false;
            this.ready = false;
            this.tetris.init();
            this.otherTetris.init();
            this.playTime = 0;
            this.tetris.playData.reset();
            this.otherTetris.playData.reset();
        }
        this.ui.someoneJoined(userId, watch);
    },
    someoneLeft: function(userId, watch){
        console.log(watch?"watcher ":"player "+userId+" left");
        if(!watch){
            this.single = true;
            this.ready = false;
            if(!this.watch || userId === this.otherUser){
                this.otherUser = null;
                this.otherTetris.playData.reset();
                this.otherTetris.init();
                if(this.playing){
                    this.playing = false;
                    this.tetris.gameOver();
                }
            }
            else{
                this.hostUser = null;
                this.tetris.playData.reset();
                this.tetris.init();
                if(this.playing){
                    this.playing = false;
                    this.otherTetris.gameOver();
                }
            }
        }
        this.ui.someoneLeft(userId, watch);
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
            this.playTime += dt;
            //this.tetris.playData.time += dt;
            this.time += dt;
            if(this.single){
                if(this.tetris.playData.lines >= 40){
                    this.tetris.gameOver();
                    //socket.single(this.tetris.playData.time);
                    socket.single(this.playTime);
                    return;
                }
            }
            if(!this.watch){
                while(this.time > this.interval){
                    this.time -= this.interval;
                    this.tetris.moveDownNature();
                }
            }
        }
        this.renderer.render();
    },
    pause: function(){
        this.isPaused = !this.isPaused;
    },
    dispose: function(){
        document.body.removeEventListener("keydown", this.onKeyDown, false);
        document.body.removeEventListener("keyup", this.onKeyUp, false);
        cancelAnimationFrame(this.aniHandle);
        this.renderer.clear();
        delete this;
    },
}
