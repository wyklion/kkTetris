/**
 * Created by KK on 2016/4/24.
 */

var KeyState = function(manager, func){
    this.manager = manager;
    this.func = func;
    this.press = false;
    this.first = true;
    this.time = 0;
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
                    if(_this.time >= _this.manager.dasDelay){
                        //console.log("first");
                        _this.first = false;
                        _this.func();
                        _this.time -= _this.manager.dasDelay;
                    }
                }
                else if(_this.time >= _this.manager.moveDelay){
                    //console.log("fast");
                    _this.func();
                    _this.time -= _this.manager.moveDelay;
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
    var keyboard = options.keyboard;
    this.dasDelay = keyboard.dasDelay/1000;
    this.moveDelay = keyboard.moveDelay/1000;
    this.leftKey = keyboard.left;
    this.leftFunc = function(){
        _this.socket.operate(OPERTABLE.left);
        options.left.func();
    }
    this.rightKey = keyboard.right;
    this.rightFunc = function(){
        _this.socket.operate(OPERTABLE.right);
        options.right.func();
    }
    this.downKey = keyboard.down;
    this.downFunc = function(){
        var attack = options.down.func();
        _this.socket.operate(OPERTABLE.down, attack);
    }
    this.dropKey = keyboard.drop;
    this.dropFunc = function(){
        var attack = options.drop.func();
        _this.socket.operate(OPERTABLE.drop, attack);
    }
    this.rotateKey = keyboard.rotate;
    this.rotateFunc = function(){
        _this.socket.operate(OPERTABLE.rotateL);
        options.rotate.func();
    }
    this.rotateRightKey = keyboard.rotateRight;
    this.rotateRightFunc = function(){
        _this.socket.operate(OPERTABLE.rotateR);
        options.rotateRight.func();
    }
    this.holdKey = keyboard.hold;
    this.holdFunc = function(){
        _this.socket.operate(OPERTABLE.hold);
        options.hold.func();
    }

    this.left = new KeyState(this, this.leftFunc);
    this.right = new KeyState(this, this.rightFunc);
    this.down = new KeyState(this, this.downFunc);
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

        this.dasDelay = keyboard.dasDelay/1000;
        this.moveDelay = keyboard.moveDelay/1000;
    },
    stop: function(){
        this.left.stop();
        this.right.stop();
        this.down.stop();
    }
};
