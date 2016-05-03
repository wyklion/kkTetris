/**
 * Created by kk on 2016/4/28.
 */

var GameSocket = function(){
    this.socket = io('localhost');
    this.data = {
        user:null,
        users:[],
        rooms:{},
    };
    this._onConnection();
    this._onMsg();
    this._onLobbyInfo();
    this._onRoomInfo();
    this._onCreateRoom();
    this._onJoinRoom();
    this._onExitRoom();
    this._onPerate();
}
GameSocket.prototype = {
    constructor: GameSocket,
    _onConnection: function(){
        var _this = this;
        this.socket.on('onConnection', function (data) {
            if(!data.err){
                _this.data.user = data.user;
                _this.data.users = data.users;
                _this.data.rooms = data.rooms;
                console.log("login:", data);
                main.onLogin();
            }
            else
                console.log(data.err);
        });
    },
    _onMsg: function(){
        this.socket.on('msg', function (data, data2) {
            console.log("msg:", data, data2);
        });
    },
    _onLobbyInfo: function(){
        var _this = this;
        this.socket.on('lobbyInfo', function (data) {
            if(!data.err) {
                console.log("============== lobbyInfo ===============");
                if (data.rooms) {
                    _this.data.rooms = data.rooms;
                    main.updateRoomList();
                    console.log("rooms:", _this.data.rooms);
                }
                if (data.users) {
                    _this.data.users = data.users;
                    main.updateUserList();
                    console.log("userInfo", _this.data.users);
                }
            }
            else
                console.log(data.err);
        });
    },
    _onRoomInfo: function(){
        var _this = this;
        this.socket.on('roomInfo', function (data) {
            _this.data.room = data.room;
            console.log("roomInfo:",_this.data.room);
            if(main.game.single && _this.data.room.playUsers.length == 2)
                main.game.someoneJoined();
            else if(!main.game.single && _this.data.room.playUsers.length == 1)
                main.game.someoneLeft();
        });
    },
    createRoom: function(){
        this.socket.emit("createRoom");
    },
    _onCreateRoom: function(){
        var _this = this;
        this.socket.on("onCreateRoom", function(data){
            if(!data.err){
                _this.data.room = data.room;
                console.log("onCreateRoom", _this.data.room);
                main.goRoom();
            }
            else
                console.log(data.err);
        });
    },
    joinRoom: function(roomId){
        this.socket.emit("joinRoom", {roomId:roomId});
    },
    _onJoinRoom: function(){
        var _this = this;
        this.socket.on("onJoinRoom", function(data){
            if(!data.err){
                _this.data.room = data.room;
                main.goRoom();
                console.log("onJoinRoom", _this.data.room);
            }
            else
                console.log(data.err);
        });
    },
    exitRoom: function(){
        this.socket.emit("exitRoom");
    },
    _onExitRoom: function(){
        var _this = this;
        this.socket.on("onExitRoom", function(data){
            if(!data.err){
                console.log("onExitRoom", _this.data.roomId);
                _this.data.roomId = null;
                _this.data.room = null;
                main.exitRoom();
            }
            else
                console.log(data.err);
        });
    },
    operate: function(oper, data){
        var info = {oper: oper};
        if(data){
            info.data = data;
        }
        this.socket.emit("operation", info);
    },
    _onPerate: function(){
        var _this = this;
        this.socket.on("onOperation", function(data){
            //console.log("other operate:", data.oper);
            if(main.game){
                var myTetris = main.game.tetris;
                var tetris = main.game.otherTetris;
                switch(data.oper){
                    case OPERTABLE.ready:
                        main.game.otherReady();
                        break;
                    case OPERTABLE.start:
                        main.game.startVS(data.shapes);
                        break;
                    case OPERTABLE.dead:
                        main.game.win();
                        break;
                    case OPERTABLE.left:
                        tetris.move(-1,0);
                        break;
                    case OPERTABLE.right:
                        tetris.move(1,0);
                        break;
                    case OPERTABLE.down:
                        var attack = tetris.move(0,-1);
                        if(attack && attack == data.data){
                            myTetris.trash(attack);
                        }
                        break;
                    case OPERTABLE.drop:
                        var attack = tetris.drop();
                        if(attack && attack == data.data){
                            myTetris.trash(attack);
                        }
                        break;
                    case OPERTABLE.rotateL:
                        tetris.rotate(true);
                        break;
                    case OPERTABLE.rotateR:
                        tetris.rotate(false);
                        break;
                    case OPERTABLE.hold:
                        tetris.holdShape();
                        break;
                }
            }
        });
    },
    setKeyboard: function(keyboard){
        this.data.user.keyboard = keyboard;
        if(main.game){
            main.game.updateInput();
        }
        this.socket.emit("setting", {type:"keyboard", keyboard:keyboard});
    },
}