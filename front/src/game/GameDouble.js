import Game from './Game';

export default class GameDouble extends Game {
   construtor() {
      super();
      this.otherTetris = null;
   }
   init() {
      super.init();
      if (!this.watch) {
         this.otherUser = gameManager.room.playUsers[0] === this.hostUser ? gameManager.room.playUsers[1] : gameManager.room.playUsers[0];
      }
      else {
         this.hostUser = gameManager.room.playUsers[0];
         this.otherUser = gameManager.room.playUsers[1];
         this.playing = gameManager.room.playing;
         this.tetris = new Tetris(this, false);
      }
      this.otherTetris = new Tetris(this, false);
      this.renderer = new Render(this);
      this.mainLoop();

      this.ui = new GameUI(this);
      if (!this.watch)
         this.input();
   }
   updateInput() {
      this.keyManager.updateInput();
   }
   input() {
      var keyboard = gameManager.user.keyboard;
      if (!keyboard) {
         keyboard = { left: 37, right: 39, down: 70, drop: 40, rotate: 82, rotateRight: 69, rotate180: 87, hold: 84, dasDelay: 150, moveDelay: 30 };
      }
      var _this = this;
      this.keyManager = new KeyManager({
         socket: socket,
         keyboard: keyboard,
         leftFunc: function () { _this.tetris.moveLeft(); },
         leftEndFunc: function () { _this.tetris.moveLeftToEnd(); },
         rightFunc: function () { _this.tetris.moveRight(); },
         rightEndFunc: function () { _this.tetris.moveRightToEnd(); },
         downFunc: function () { _this.tetris.moveDown(); },
         downEndFunc: function () { _this.tetris.moveDownToEnd(); },
         dropFunc: function () { _this.tetris.drop(); },
         rotateFunc: function () { _this.tetris.rotate(true); },
         rotateRightFunc: function () { _this.tetris.rotate(false); },
         rotate180Func: function () { _this.tetris.rotate180(); },
         holdFunc: function () { _this.tetris.holdShape(); },
      });

      this.onKeyDown = function (e) {
         if (e.keyCode === 113) { // F2
            _this.readyOrPlay();
         }
         //else if(e.keyCode === 80) // P
         //    _this.pause();
         if (!_this.isPaused && _this.tetris.playing) {
            _this.keyManager.onKeyDown(e.keyCode);
         }
         if (e.keyCode === 38 || e.keyCode === 40 || e.keyCode === 32)
            e.preventDefault();
      }
      this.onKeyUp = function (e) {
         _this.keyManager.onKeyUp(e.keyCode);
      }

      document.body.addEventListener("keydown", this.onKeyDown, false);
      document.body.addEventListener("keyup", this.onKeyUp, false);
   }
   readyOrPlay() {
      if (this.single) {
         this.ui.readyOrPlay();
         this.tetris.playData.reset();
         if (this.firstGame) {
            this.firstGame = false;
            this.tetris.start();
         }
         else {
            this.tetris.restart();
         }
      }
      else {
         if (!this.playing && !this.ready) {
            console.log("ready...");
            this.ui.readyOrPlay();
            this.ready = true;
            this.tetris.init();
            socket.operate(OPERTABLE.ready);
         }
      }
   }
   //for watch
   userReady(userId) {
      console.log(userId, "ready");
      if (this.hostUser === userId)
         this.tetris.init();
      else if (this.otherUser === userId)
         this.otherTetris.init();
      this.ui.userReady(userId);
   }
   startVS(shapes) {
      console.log("start vs...");
      this.ui.startVS();
      this.playing = true;
      this.ready = false;
      this.tetris.playData.reset();
      this.otherTetris.playData.reset();
      this.tetris.restart(shapes);
      this.otherTetris.restart(shapes);
   }
   gameOver(result) {
      console.log(result);
      this.reset();
      this.ui.gameOver(result.win);
   }
   lose() {
      if (this.single) {
         this.reset();
      }
   }
   reset() {
      super.reset();
      this.otherTetris.playing = false;
   }
   someoneJoined(userId, watch) {
      console.log(userId + " joined to ", watch ? "watch" : "play");
      if (this.hostUser)
         this.otherUser = userId;
      else
         this.hostUser = userId;
      if (!watch) {
         this.single = false;
         this.ready = false;
         this.tetris.init();
         this.otherTetris.init();
         this.tetris.playData.reset();
         this.otherTetris.playData.reset();
      }
      this.ui.someoneJoined(userId, watch);
   }
   someoneLeft(userId, watch) {
      console.log(watch ? "watcher " : "player " + userId + " left");
      if (!watch) {
         this.single = true;
         this.ready = false;
         if (!this.watch || userId === this.otherUser) {
            this.otherUser = null;
            this.otherTetris.playData.reset();
            this.otherTetris.init();
            if (this.playing) {
               this.playing = false;
               this.tetris.gameOver();
            }
         }
         else {
            this.hostUser = null;
            this.tetris.playData.reset();
            this.tetris.init();
            if (this.playing) {
               this.playing = false;
               this.otherTetris.gameOver();
            }
         }
      }
      this.ui.someoneLeft(userId, watch);
   }
   trashPool(trash) {
      this.tetris.hurt(trash);
   }
   calculateDeltaTime() {
      var now = Date.now();
      this._deltaTime = (now - this._lastUpdate) / 1000;
      this._lastUpdate = now;
   }
   mainLoop() {
      var _this = this;
      this._lastUpdate = Date.now();
      var callback = function () {
         _this.calculateDeltaTime();
         _this.update(_this._deltaTime);
         _this.aniHandle = requestAnimationFrame(callback);
      };
      callback();
   }
   clearFloorTime() {
      this.time = 0;
   }
   update(dt) {
      if (this.isPaused) return;
      if (this.tetris.playing) {
         this.tetris.playData.time += dt;
         this.time += dt;
         if (this.single) {
            if (this.tetris.playData.lines >= 40) {
               this.tetris.gameOver();
               socket.sendSpeed40(this.tetris.playData.time);
               return;
            }
         }
         if (!this.watch) {
            while (this.time > this.interval) {
               this.time -= this.interval;
               this.tetris.moveDownNature();
            }
         }
      }
      this.renderer.render();
   }
   pause() {
      this.isPaused = !this.isPaused;
   }
   dispose() {
      document.body.removeEventListener("keydown", this.onKeyDown, false);
      document.body.removeEventListener("keyup", this.onKeyUp, false);
      cancelAnimationFrame(this.aniHandle);
      this.renderer.clear();
      delete this;
   }
}
