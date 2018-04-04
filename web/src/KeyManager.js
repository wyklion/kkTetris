/**
 * Created by KK on 2016/4/24.
 */

var KeyState = function(manager, func, endFunc, isDown){
    this.manager = manager;
    this.func = func;
    this.endFunc = endFunc;
    this.isDown = isDown;
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
                if(_this.first && !_this.isDown){
                    if(_this.time >= _this.manager.dasDelay){
                        //console.log("first");
                        _this.first = false;
                        _this.func();
                        _this.time -= _this.manager.dasDelay;
                    }
                }
                else if(_this.manager.moveDelay === 0){
                    _this.endFunc();
                    cancelAnimationFrame(_this.handle);
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

var Keying = function(){
    this.keying = 0;
    this.keys = 0;
};
Keying.prototype = {
    constructor: Keying,
    changeKey: function(key, lock){
        if(lock)
            this.keys |= key;
        else
            this.keys &=(~key);
        this.keying = this.key === 0;
        console.log("keying:", this.keying);
    },
};
Keying.LEFT =           1 << 0;
Keying.RIGHT =          1 << 1;
Keying.DOWN =           1 << 2;
Keying.DROP =           1 << 3;
Keying.ROTATE =         1 << 4;
Keying.ROTATERIGHT =    1 << 5;
Keying.ROTATE180 =      1 << 6;
Keying.HOLD =           1 << 7;

var KeyManager = function(options){
    var _this = this;
    this.socket = options.socket;
    //this.keying = new Keying();

    var keyboard = options.keyboard;
    this.dasDelay = keyboard.dasDelay/1000;
    this.moveDelay = keyboard.moveDelay/1000;
    this.leftKey = keyboard.left;
    this.leftFunc = options.leftFunc;
    this.leftEndFunc = options.leftEndFunc;
    this.rightKey = keyboard.right;
    this.rightFunc = options.rightFunc;
    this.rightEndFunc = options.rightEndFunc;
    this.downKey = keyboard.down;
    this.downFunc = options.downFunc;
    this.downEndFunc = options.downEndFunc;
    this.dropKey = keyboard.drop;
    this.dropFunc = options.dropFunc;
    this.rotateKey = keyboard.rotate;
    this.rotateFunc = options.rotateFunc;
    this.rotateRightKey = keyboard.rotateRight;
    this.rotateRightFunc = options.rotateRightFunc
    this.rotate180Key = keyboard.rotate180;
    this.rotate180Func = options.rotate180Func;
    this.holdKey = keyboard.hold;
    this.holdFunc = options.holdFunc;

    this.left = new KeyState(this, this.leftFunc, this.leftEndFunc);
    this.right = new KeyState(this, this.rightFunc, this.rightEndFunc);
    this.down = new KeyState(this, this.downFunc, this.downEndFunc, true);
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
        else if(key === this.rotate180Key){
            this.rotate180Func();
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
        this.rotate180Key = keyboard.rotate180;
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
