/**
 * Created by kk on 2016/1/1.
 */

var Anchor = {
    leftTop:{x:0,y:0},
    centerTop:{x:0.5,y:0},
    rightTop:{x:1,y:0},
    leftCenter:{x:0,y:0.5},
    centerCenter:{x:0.5,y:0.5},
    rightCenter:{x:1,y:0.5},
    leftBottom:{x:0,y:1},
    centerBottom:{x:0.5,y:1},
    rightBottom:{x:1,y:1},
};
var UIElement = function(options, parent){
    var scope = this;
    this.parent = parent;
    this.isVisible = true;
    if (!options || !options.e) return;
    var e = options.e;
    this.element = document.createElement(e);
    if(options.id) this.element.id = options.id;
    if(options.class) this.element.className = options.class;
    this.zIndex = options.zIndex || 0;
    this.element.style.zIndex = isNaN(this.zIndex) ? this.zIndex : this.zIndex + "";
    //this.element.src = options.src;
    if(this.parent)
        this.parent.appendChild(this.element);

    this.x = options.x || 0;
    this.y = options.y || 0;

    this.element.style.position = "absolute";
    this.element.style.display = "none";
    this.updatePosition();

    //other style options
    for(var item in options){
        if(!UIElement.isInnerOption(item)){
            this.element.style[item] = options[item];
        }
    }

    if(options.e === "img" && options.src && this.element.width === 0){
        this.element.onload = function(){
            scope._initElement(options);
            if(options.onload)
                options.onload();
            scope.element.onload = void 0;
        }
    }
    else{
        this._initElement(options);
        if(options.onload)
            options.onload();
    }
};
UIElement.prototype = {
    constructor: UIElement,
    _initElement: function(options){
        this.w = options.w || this.element.width;
        this.h = options.h || this.element.height;
        this.anchor = options.anchor || Anchor.centerCenter;
        this.ox = options.ox || 0;
        this.oy = options.oy || 0;
        this.updateWidthAndHeight();
        this.element.style.display = "block";
    },
    attachButtonControl: function(button, keepButtonEvent){
        var eventPrefix = "mouse";
        this.element.addEventListener(eventPrefix + "down", button._onPointerDown, false);
        this.element.addEventListener(eventPrefix + "up", button._onPointerUp, false);
        this.element.addEventListener(eventPrefix + "out", button._onPointerOut, false);
        if(button._onPointerOver){
            this.element.addEventListener(eventPrefix + "over", button._onPointerOver, false);
        }
        if(!keepButtonEvent)
            button.removeEventListeners();
    },
    setVisible: function(visible){
        var display;
        if(visible == true) {
            display = "block";
            this.isVisible = true;
        } else {
            display = "none";
            this.isVisible = false;
        }
        this.element.style.display = display;
    },
    setPosition: function(x,y){
        if(x) this.x = x;
        if(y) this.y = y;
        this.updatePosition();
    },
    setWidthAndHeight: function(w,h){
        if(w) this.w = w;
        if(h) this.h = h;
        this.updateWidthAndHeight();
    },
    updatePosition: function(){
        this.element.style.left = isNaN(this.x) ? this.x : Math.round(this.x)+"px";
        this.element.style.top = isNaN(this.y) ? this.y : Math.round(this.y)+"px";
    },
    updateWidthAndHeight: function(){
        if(this.w){
            if(isNaN(this.w))
                this.element.style.width = this.w;
            else{
                this.element.style.width = Math.round(this.w)+"px";
                this.element.style.marginLeft = Math.round(-this.w*this.anchor.x+this.ox)+"px";
            }
        }
        if(this.h){
            if(isNaN(this.h))
                this.element.style.height = this.h;
            else{
                this.element.style.height = Math.round(this.h) + "px";
                this.element.style.marginTop = Math.round(-this.h * this.anchor.y + this.oy) + "px";
            }
        }
    },
    onResize: function(){
        this.updatePosition();
        this.updateWidthAndHeight();
    },
    dispose: function(){
        this.element.parentNode.removeChild(this.element);
    },
};
UIElement.innerOptions = ["e","id","class","value","x","y","w","h",
    "anchor","ox","oy",
    "src","srcDown","srcOver","onclick","onload",
    "bgWidth", "bgHeight", "bgPosX", "bgPosY"];
UIElement.isInnerOption = function(option){
    for(var i = 0; i < UIElement.innerOptions.length; i++){
        if(option === UIElement.innerOptions[i]){
            return true;
        }
    }
    return false;
}

var UITextElement = function(options, parent){
    if(!UITextElement._canvas){
        UITextElement._canvas = document.createElement("canvas");
        UITextElement._context = UITextElement._canvas.getContext("2d");
    }
    options.e = "div";
    UIElement.call(this, options, parent);
    if(options.textAlign === void 0)
        this.element.style.textAlign = "center";

    if(options.font)
        this.element.style.fontFamily = options.font;
    this.size = options.size;
    this.updateFontSize();
    this.setValue(options.value)
};
UITextElement.prototype = Object.create(UIElement.prototype);
UITextElement.constructor = UITextElement;
UITextElement.prototype.setValue = function(value){
    this.value = value;
    this.element.innerHTML = value;
};
UITextElement.prototype.updateFontSize = function(){
    if(this.size){
        this.element.style.fontSize = this.size + "px";
    }
};


var UIButtonElement = function(options, parent){
    options.e = "input";
    UIElement.call(this, options, parent);
    this.element.type = "button";
    this.element.value = options.value;
    this.element.onclick = options.onclick;
};
UIButtonElement.prototype = Object.create(UIElement.prototype);
UIButtonElement.constructor = UIButtonElement;

/*
drogon.UIDivButtonElement = drogon.UIElement.extend({
    ctor: function(options, parent){
        this._super(options, parent);

        this.eventPrefix = BABYLON.Tools.GetPointerPrefix();
        this.isEnabled = true;
        this.setEvent(options);
    },
    _setEvent: function(){
        if(this.onDown)
            this.element.addEventListener(this.eventPrefix + "down", this.onDown, false);
        if(this.onUp)
            this.element.addEventListener(this.eventPrefix + "up", this.onUp, false);
        if(this.onOut)
            this.element.addEventListener(this.eventPrefix + "out", this.onOut, false);
        if(this.onOver)
            this.element.addEventListener(this.eventPrefix + "over", this.onOver, false);
    },
    setEvent: function(options){
        this.onDown = options.onDown;
        this.onUp = options.onUp;
        this.onOut = options.onOut;
        this.onOver = options.onOver;
        this._setEvent();
    },
    setEnabled: function(enable){
        if(this.isEnabled && !enable){
            this.isEnabled = false;
            if(this.onDown)
                this.element.removeEventListener(this.eventPrefix + "down", this.onDown, false);
            if(this.onUp)
                this.element.removeEventListener(this.eventPrefix + "up", this.onUp, false);
            if(this.onOut)
                this.element.removeEventListener(this.eventPrefix + "out", this.onOut, false);
            if(this.onOver)
                this.element.removeEventListener(this.eventPrefix + "over", this.onOver, false);
        }
        else if(!this.isEnabled && enable){
            this.isEnabled = true;
            this._setEvent();
        }
    }
});

drogon.UIButtonElement = drogon.UIElement.extend({
    ctor:function(options,parent){
        this._super(options, parent);

        this.eventPrefix = BABYLON.Tools.GetPointerPrefix();

        this.src = options.src;
        this.srcDown = options.srcDown;
        this.srcOver = options.srcOver;
        this.onclick = options.onclick;

        this.isEnabled = true;
        this.selected = false;

        this.init();
    },
    init: function(){
        var self = this;
        this._onPointerDown = function(){
            if(!self.isVisible || !self.isEnabled) return;
            self.selected = true;
            if(self.srcDown)
                self.element.src = self.srcDown;
        }
        this.element.addEventListener(this.eventPrefix + "down", this._onPointerDown, false);
        this._onPointerUp = function(){
            if(!self.isVisible || !self.isEnabled) return;
            if(self.selected) {
                if(self.srcDown || self.srcOver)
                    self.element.src = self.src;
                if(self.onclick)
                    self.onclick();
            }
        }
        this.element.addEventListener(this.eventPrefix + "up", this._onPointerUp, false);
        this._onPointerOut = function(){
            if(!self.isVisible || !self.isEnabled) return;
            self.selected = false;
            if(self.srcDown || self.srcOver)
                self.element.src = self.src;
        }
        this.element.addEventListener(this.eventPrefix + "out", this._onPointerOut, false);
        if(this.srcOver){
            this._onPointerOver = function(){
                if(!self.isVisible || !self.isEnabled) return;
                self.element.src = self.srcOver;
            }
            this.element.addEventListener(this.eventPrefix + "over", this._onPointerOver, false);
        }
    },
    removeEventListeners: function(){
        this.element.removeEventListener(this.eventPrefix + "down", this._onPointerDown);
        this.element.removeEventListener(this.eventPrefix + "up", this._onPointerUp);
        this.element.removeEventListener(this.eventPrefix + "out", this._onPointerUp);
        if(this.srcOver)
            this.element.removeEventListener(this.eventPrefix + "over", this._onPointerOver);
    },
    setEnabled: function(enable){
        this.isEnabled = enable;
    },
    dispose: function(){
        this.removeEventListeners();
        this._super();
    },
});

drogon.UIProcessElement = drogon.UIElement.extend({
    ctor:function(options,parent){
        options.e = "div";
        this.src = options.src;
        options.src = void 0;
        this._super(options, parent);

        this._content = new drogon.UIClipImgElement({
            x:0,
            y:0,
            anchor:drogon.Anchor.leftTop,
            w:this.w,
            h:this.h,
            bgWidth: this.w,
            bgHeight: this.h,
            bgPosX:0,
            bgPosY:0,
            backgroundImage:"url("+this.src+")",
        }, this.element);
    },
    setPercent: function(percent){
        this._content.w = this.w*percent;
        this._content.onResize();
    },
    onResize: function(){
        this._super();
        this._content.onResize();
    },
    dispose: function(){
        this._content.dispose();
        this._super();
    },
});

drogon.UIClipImgElement = drogon.UIElement.extend({
    ctor:function(options,parent){
        options.e = "div";
        this._super(options, parent);

        this.originW = this.w;
        this.originH = this.h;
        this.originBgWidth = options.bgWidth;
        this.originBgHeight = options.bgHeight;
        this.originPosX = options.bgPosX || 0;
        this.originPosY = options.bgPosY || 0;
        this.size = options.size || 1;
        this._setForSize();

        //this.element.style.backgroundColor = "transparent";
        //overflow:"hidden", //重要样式
        //this.element.style.backgroundRepeat = "no-repeat";

        this.onResize();
    },
    setClip: function(posX, posY, w, h){
        this.originW = w;
        this.originH = h;
        this.originPosX = posX;
        this.originPosY = posY;
        this._setForSize();
        this.onResize();
    },
    _setForSize: function(){
        this.w = this.originW * this.size;
        this.h = this.originH * this.size;
        this.bgWidth = this.originBgWidth * this.size;
        this.bgHeight = this.originBgHeight * this.size;
        this.bgPosX = this.originPosX * this.size;
        this.bgPosY = this.originPosY * this.size;
    },
    setSize: function(size){
        this.size = size;
        this._setForSize();
        this.onResize();
    },
    onClipResize: function(){
        this.element.style.width = Math.floor(this.w*drogon.sizeScale)+"px";
        this.element.style.height = Math.floor(this.h*drogon.sizeScale)+"px";
        this.element.style.backgroundPosition = Math.round(this.bgPosX*drogon.sizeScale)+"px " +
            Math.round(this.bgPosY*drogon.sizeScale)+"px";
        this.element.style.backgroundSize = Math.round(this.bgWidth*drogon.sizeScale)+"px " +
            Math.round(this.bgHeight*drogon.sizeScale)+"px";
    },
    onResize: function(){
        this._super();
        this.onClipResize();
    },
});

drogon.UIBMFontElement = drogon.UIElement.extend({
    ctor:function(options,parent){
        options.e = "div";
        this._super(options, parent);

        this.font = options.font;
        //drogon.log("font:",drogon.loader.cache[this.font]);
        this.fontConfig = drogon.loader.cache[options.font];
        this.fontSrc = this.fontConfig.atlasName;
        this.img = new Image();
        this.img.src = this.fontSrc;

        this.value = options.value || "";
        this.chars = [];

        var _this = this;
        if(this.img.width === 0){
            this.img.onload = function(){
                _this.init();
            }
        }
        else{
            _this.init();
        }
    },
    init: function(){
        this.fontTextureWidth = this.img.width;
        this.fontTextureHeight = this.img.height;
        this.setValue(this.value);
    },
    setValue: function(value){
        this.clearValue();
        this.value = value;

        if(this.value && this.value !== "")
            this.show();
    },
    clearValue: function(){
        for(var i = 0; i < this.chars.length; i++){
            this.chars[i].dispose();
            this.chars[i] = null;
        }
        this.chars = [];
    },
    show: function(){
        var locCfg = this.fontConfig, locKerningDict = locCfg.kerningDict,
            locCommonH = locCfg.commonHeight, locFontDict = locCfg.fontDefDictionary;
        var prev = -1;
        var nextFontPositionX = 0;
        var height = locCommonH;
        var idx = 0;
        for(var i = 0; i < this.value.length; i++){
            var key = this.value.charCodeAt(i);
            if (key === 0) continue;

            var kerningAmount = locKerningDict[(prev << 16) | (key & 0xffff)] || 0;
            var fontDef = locFontDict[key];
            if (!fontDef) {
                drogon.log("DrogonJs: LabelBMFont: character not found " + this.value[i]);
                continue;
            }

            //var rect = cc.rect(fontDef.rect.x, fontDef.rect.y, fontDef.rect.width, fontDef.rect.height);
            //rect = cc.rectPixelsToPoints(rect);
            //rect.x += self._imageOffset.x;
            //rect.y += self._imageOffset.y;

            if(fontDef.rect.height > height)
                height = fontDef.rect.height;
            this.chars[idx] = this.createForChar(fontDef, nextFontPositionX);
            idx++;

            //var yOffset = locCfg.commonHeight - fontDef.yOffset;
            //var fontPos = cc.p(nextFontPositionX + fontDef.xOffset + fontDef.rect.width * 0.5 + kerningAmount,
            //    nextFontPositionY + yOffset - rect.height * 0.5 * cc.contentScaleFactor());
            //fontChar.setPosition(cc.pointPixelsToPoints(fontPos));
            //
            //// update kerning
            nextFontPositionX += fontDef.xAdvance + kerningAmount;
            prev = key;
        }
        this.w = nextFontPositionX;
        this.h = height;
        this.element.style.width = nextFontPositionX*drogon.sizeScale+"px";
        this.element.style.height = height*drogon.sizeScale+"px";
        this.element.style.marginLeft = (-this.w*this.anchor.x+this.ox)*drogon.sizeScale+"px";
        this.element.style.marginTop = (-this.h*this.anchor.y+this.oy)*drogon.sizeScale+"px";
    },
    createForChar: function(def, posX){
        var char = new drogon.UIClipImgElement({
            x:posX,
            y:def.rect.height,
            anchor:drogon.Anchor.leftBottom,
            w:def.rect.width,
            h:def.rect.height,
            bgWidth: this.fontTextureWidth,
            bgHeight: this.fontTextureHeight,
            bgPosX:-def.rect.x,
            bgPosY:-def.rect.y,
            backgroundImage:"url("+this.fontSrc+")",
        }, this.element);
        return char;
    },
    onResize: function(){
        this._super();
        for(var i = 0; i < this.chars.length; i++){
            this.chars[i].onResize();
        }
    },
    dispose: function(){
        this.clearValue();
        this._super();
    },
});

drogon.UISpriteElement = drogon.UIElement.extend({
    ctor: function(options, parent){
        options.e = "div";
        this._super(options, parent);

        this.size = options.size;
        this.plist = options.plist;
        this.frameConfig = drogon.loader.cache[options.plist];
        this.texturePath = drogon.path.changeBasename(this.plist, this.frameConfig.image || ".png");
        this.textureSize = this.frameConfig.meta.size;
        if(options.sprite)
            this.setSpriteFrame(options.sprite);
    },
    setSpriteFrame: function(spriteName){
        var frame = this.frameConfig.frames[spriteName];
        if(!frame){
            drogon.log("can't find frame named:",spriteName);
            return;
        }
        if(!this.sprite){
            this.sprite = new drogon.UIClipImgElement({
                size: this.size,
                w:frame.rect.w,
                h:frame.rect.h,
                bgWidth: this.textureSize.w,
                bgHeight: this.textureSize.h,
                bgPosX:-frame.rect.x,
                bgPosY:-frame.rect.y,
                backgroundImage:"url("+this.texturePath+")",
            }, this.element);
        }
        else{
            this.sprite.setClip(-frame.rect.x, -frame.rect.y, frame.rect.w, frame.rect.h);
        }
    },
    setSize: function(size){
        this.size = size;
        if(this.sprite)
            this.sprite.setSize(size);
    },
    runAnimationFrames:function(frameList, interval, loop, callback){
        this.animationIdx = -1;
        this.animationLengh = frameList.length;
        this.loop = loop;
        var scope = this;
        var step = function(){
            scope.animationIdx++;
            if(scope.animationIdx >= scope.animationLengh){
                if(!scope.loop){
                    scope.sprite.dispose();
                    scope.sprite = null;
                    if(callback)
                        callback();
                    return;
                }
                else
                    scope.animationIdx = 0;
            }
            scope.setSpriteFrame(frameList[scope.animationIdx]);
            setTimeout(step, interval);
        }
        step();
    },
    runAnimation:function(preName, start, end, extName, interval, loop, callback){
        var frameList = [];
        for(var i = start; i <= end; i++){
            frameList.push(preName+i+extName);
        }
        this.runAnimationFrames(frameList, interval, loop, callback);
    }
});

drogon.DivTransition = drogon.Node.extend({
    ctor: function(options){
        this._super();

        this.body = options.parent || drogon._gameDiv || document.body || document.getElementsByTagName('body')[0];
        this.time = options.time || 1;
        this.callback = options.callback;
        this.div = new drogon.UIElement({
            e:"div",
            anchor:drogon.Anchor.leftTop,
            x:0,y:0,
            w:"100%",
            h:"100%",
            zIndex:999,
            backgroundColor:"#000",
            opacity:0,
        }, this.body);
        this.transTime = 0;
        this.toBlack = true;
        this.scheduleUpdate();
    },
    update: function(dt){
        this.transTime += dt;
        if(this.toBlack){
            this.div.element.style.opacity = this.transTime/this.time*2;
            if(this.transTime >= this.time/2){
                this.toBlack = false;
                if(this.callback)
                    this.callback();
            }
        }
        else{
            this.div.element.style.opacity = (this.time - this.transTime)/this.time*2;
            if(this.transTime >= this.time){
                this.endTransition();
            }
        }
    },
    endTransition: function(){
        this.unscheduleUpdate();
        this.div.dispose();
    },
});

drogon.UIType = {
    ELEMENT: 0,
    TEXT_ELEMENT: 1,
    IMG_ELEMENT: 2,
    IMG_BUTTON_ELEMENT: 3,
    PROCESS_ELEMENT: 4,
    CLIP_IMG_ELEMENT: 5,
    BMFONT_ELEMENT: 6,
    SPRITE_ELEMENT: 7,
    DIV_BUTTON_ELEMENT: 8,
    CreateFunc: [
        drogon.UIElement,
        drogon.UITextElement,
        drogon.UIElement,
        drogon.UIButtonElement,
        drogon.UIProcessElement,
        drogon.UIClipImgElement,
        drogon.UIBMFontElement,
        drogon.UISpriteElement,
        drogon.UIDivButtonElement,
    ]
}

drogon.UIManager = drogon.Class.extend({
    ctor: function(canvas, useSelfBody){
        var _this = this;
        this.canvas = canvas;
        this.elements = new Array();
        this.fragmentParent = [];
        this.fragmentElements = [];

        this.useGameDiv = true;
        if(drogon._gameDiv && !useSelfBody)
            this.body = drogon._gameDiv;
        else{
            this.useGameDiv = false;
            this.htmlBody = drogon._gameDiv || document.body || document.getElementsByTagName('body')[0];
            this.body = document.createElement("div");
            this.target = drogon._gameDiv ? drogon._gameDiv : canvas;
            this.body.style.position = this.target.style.position;
            this.body.style.left = this.target.style.left;
            this.body.style.top = this.target.style.top;
            this.body.style.width = this.target.style.width;
            this.body.style.height = this.target.style.height;
            this.body.style.marginLeft = this.target.style.marginLeft;
            this.body.style.marginTop = this.target.style.marginTop;
            this.htmlBody.appendChild(this.body);
            this.onBodyResize = function(){
                _this.body.style.width = _this.target.style.width;
                _this.body.style.height = _this.target.style.height;
                _this.body.style.marginLeft = _this.target.style.marginLeft;
                _this.body.style.marginTop = _this.target.style.marginTop;
            }
        }

        var scope = this;
        window.addEventListener("resize", function () {
            scope.onResize();
        });
    },

    _pushElement: function(ele){
        this.elements.push(ele);
        ele.manager = this;
    },

    addFragment: function(ele, parent){
        var parentFragmentIdx = this.fragmentParent.indexOf(parent);
        if(parentFragmentIdx === -1){
            parentFragmentIdx = this.fragmentParent.push(parent) - 1;
        }
        this.fragmentElements[parentFragmentIdx] = this.fragmentElements[parentFragmentIdx] || [];
        this.fragmentElements[parentFragmentIdx].push(ele);
    },
    appendFragment: function(){
        for(var i = 0; i < this.fragmentParent.length; i++){
            var parent = this.fragmentParent[i];
            var frag = document.createDocumentFragment();
            for(var j = 0; j < this.fragmentElements[i].length; j++){
                frag.appendChild(this.fragmentElements[i][j].element);
                this._pushElement(this.fragmentElements[i][j]);
            }
            parent.appendChild(frag);
        }
        this.fragmentParent = [];
        this.fragmentElements = [];
    },

    _createElement: function(eleType, options, parent){
        var parent = parent || this.body;
        var ele;
        if(options.fragment){
            ele = new drogon.UIType.CreateFunc[eleType](options);
            this.addFragment(ele, parent);
        }
        else{
            ele = new drogon.UIType.CreateFunc[eleType](options, parent);
            this._pushElement(ele);
        }
        return ele;
    },

    //options:e,x,y,w,h...
    createElement: function(options, parent){
        return this._createElement(drogon.UIType.ELEMENT, options, parent);
    },

    //options:font,value,size,x,y,w,h...
    createTextElement: function(options, parent){
        return this._createElement(drogon.UIType.TEXT_ELEMENT, options, parent);
    },

    //options:e,x,y,w,h,src,onload...
    createImgElement: function(options, parent){
        if(!options || !options.src) return;
        options.e = "img";
        return this._createElement(drogon.UIType.IMG_ELEMENT, options, parent);
    },

    //options:src,srcDown,srcOver,onclick...
    createImgButtonElement:function(options, parent){
        if(!options || !options.src) return;
        options.e = "img";
        return this._createElement(drogon.UIType.IMG_BUTTON_ELEMENT, options, parent);
    },

    //options:x,y,w,h,onDown,onUp,onOut,onOver...
    createDivButtonElement:function(options, parent){
        if(!options) return;
        options.e = "div";
        return this._createElement(drogon.UIType.DIV_BUTTON_ELEMENT, options, parent);
    },

    //options:src...
    createProcessElement:function(options, parent){
        if(!options || !options.src) return;
        return this._createElement(drogon.UIType.PROCESS_ELEMENT, options, parent);
    },

    //options:backgroundImage,bgWidth,bgHeight,bgPosX,bgPosY...
    createClipImgElement:function(options, parent){
        if(!options || !options.backgroundImage) return;
        return this._createElement(drogon.UIType.CLIP_IMG_ELEMENT, options, parent);
    },

    //options:font,value...
    createBMFontElement:function(options, parent){
        if(!options || !options.font) return;
        return this._createElement(drogon.UIType.BMFONT_ELEMENT, options, parent);
    },

    //options:plist, sprite...
    createSpriteElement:function(options, parent){
        if(!options || !options.plist) return;
        return this._createElement(drogon.UIType.SPRITE_ELEMENT, options, parent);
    },

    onResize: function(){
        if(this.onBodyResize){
            this.onBodyResize();
        }
        for(var i = 0; i < this.elements.length; i++){
            this.elements[i].onResize();
        }
    },

    remove: function(ele){
        var idx = this.elements.indexOf(ele);
        if(idx !== -1){
            this.elements.splice(idx, 1);
        }
    },

    dispose: function(){
        for(var i = 0; i < this.elements.length; i++){
            this.elements[i].manager = null;
            this.elements[i].dispose(true);
        }
        if(!this.useGameDiv)
            this.htmlBody.removeChild(this.body);
    },
});
*/