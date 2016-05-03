/**
 * Created by KK on 2016/4/24.
 */

var KeyState = function(func){
    this.func = func;
    this.press = false;
    this.first = true;
    this.time = 0;
    this.firstInterval = 0.12;
    this.interval = 0.03;
    this.handle = null;
};
KeyState.prototype = {
    constructor: KeyState,
    keyDown: function(){
        if(!this.press){
            this.press = true;
            this.first = true;
            this.lastTime = Date.now();
            this.time = 0;
            //console.log("press");
            this.func();
            this.update();
        }
    },
    keyUp: function(){
        this.press = false;
        cancelAnimationFrame(this.handle);
        this.handle = null;
    },
    update: function(){
        var _this = this;
        var callback = function(){
            if(_this.press){
                var now = Date.now();
                var deltaTime = (now - _this.lastTime) / 1000;
                _this.lastTime = now;
                _this.time += deltaTime;
                if(_this.first){
                    if(_this.time >= _this.firstInterval){
                        //console.log("first");
                        _this.first = false;
                        _this.func();
                        _this.time -= _this.firstInterval;
                    }
                }
                else if(_this.time >= _this.interval){
                    //console.log("fast");
                    _this.func();
                    _this.time -= _this.interval;
                }
                _this.handle = requestAnimationFrame(callback);
            }
        }
        callback();
    },
    stop: function(){
        if(this.handle)
            cancelAnimationFrame(this.handle);
    }
};

var KeyManager = function(options){
    var _this = this;
    this.socket = options.socket;
    this.leftKey = options.left.key;
    this.leftFunc = function(){
        _this.socket.operate(OPERTABLE.left);
        options.left.func();
    }
    this.rightKey = options.right.key;
    this.rightFunc = function(){
        _this.socket.operate(OPERTABLE.right);
        options.right.func();
    }
    this.downKey = options.down.key;
    this.downFunc = function(){
        var attack = options.down.func();
        _this.socket.operate(OPERTABLE.down, attack);
    }
    this.dropKey = options.drop.key;
    this.dropFunc = function(){
        var attack = options.drop.func();
        _this.socket.operate(OPERTABLE.drop, attack);
    }
    this.rotateKey = options.rotate.key;
    this.rotateFunc = function(){
        _this.socket.operate(OPERTABLE.rotateL);
        options.rotate.func();
    }
    this.rotateRightKey = options.rotateRight.key;
    this.rotateRightFunc = function(){
        _this.socket.operate(OPERTABLE.rotateR);
        options.rotateRight.func();
    }
    this.holdKey = options.hold.key;
    this.holdFunc = function(){
        _this.socket.operate(OPERTABLE.hold);
        options.hold.func();
    }

    this.left = new KeyState(this.leftFunc);
    this.right = new KeyState(this.rightFunc);
    this.down = new KeyState(this.downFunc);
};
KeyManager.prototype = {
    constructor: KeyManager,
    onKeyDown: function(key){
        if(key === this.leftKey){
            this.left.keyDown();
            this.right.keyUp();
        }
        else if(key === this.rightKey){
            this.right.keyDown();
            this.left.keyUp();
        }
        else if(key === this.downKey){
            this.down.keyDown();
        }
        else if(key === this.dropKey){
            this.dropFunc();
        }
        else if(key === this.rotateKey){
            this.rotateFunc();
        }
        else if(key === this.rotateRightKey){
            this.rotateRightFunc();
        }
        else if(key === this.holdKey){
            this.holdFunc();
        }
    },
    onKeyUp: function(key){
        if(key === this.leftKey){
            this.left.keyUp();
        }
        else if(key === this.rightKey){
            this.right.keyUp();
        }
        else if(key === this.downKey){
            this.down.keyUp();
        }
    },
    updateInput: function(){
        var keyboard = socket.data.user.keyboard;
        if (!keyboard) return;
        this.leftKey = keyboard.left;
        this.rightKey = keyboard.right;
        this.downKey = keyboard.down;
        this.dropKey = keyboard.drop;
        this.rotateKey = keyboard.rotate;
        this.rotateRightKey = keyboard.rotateRight;
        this.holdKey = keyboard.hold;
    },
    stop: function(){
        this.left.stop();
        this.right.stop();
        this.down.stop();
    }
};
