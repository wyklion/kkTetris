/**
 * Created by kk on 2016/4/28.
 */

var GameSocket = function(){
    main.spin();
    this.socket = io(SERVER_NAME);
    this.data = {
        user:null,
        users:[],
        rooms:{},
    };
    this._onConnection();
    this._onDisconnect();
    this._onReconnect();
    this._onMsg();
    this._onLobbyInfo();
    this._onRoomInfo();
    this._onCreateRoom();
    this._onJoinRoom();
    this._onExitRoom();
    this._onOperate();
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
            main.stopSpin();
        });
    },
    _onDisconnect: function(){
        var _this = this;
        this.socket.on('disconnect', function(){
            console.log('disconnect');
            _this.socket.reconnect();
        });
    },
    _onReconnect: function(){
        this.socket.on('reconnect', function(transport_type,reconnectionAttempts){
            console.log('reconnect...',transport_type,reconnectionAttempts);
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
    getRoomOtherUser: function(){
        if(!this.data.room) return null;
        if(this.data.room.playUsers.length < 2) return null;
        var otherUser = this.data.user.id === this.data.room.playUsers[0] ? this.data.room.playUsers[1] : this.data.room.playUsers[0];
        return otherUser;
    },
    _onRoomInfo: function(){
        var _this = this;
        this.socket.on('roomInfo', function (data) {
            _this.data.room = data.room;
            console.log("roomInfo:",_this.data.room);
            if(main.game.single && _this.data.room.playUsers.length == 2){
                main.game.someoneJoined();
            }
            else if(!main.game.single && _this.data.room.playUsers.length == 1)
                main.game.someoneLeft();
        });
    },
    createRoom: function(){
        main.spin();
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
            main.stopSpin();
        });
    },
    joinRoom: function(roomId){
        main.spin();
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
            main.stopSpin();
        });
    },
    exitRoom: function(){
        main.spin();
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
            main.stopSpin();
        });
    },
    operate: function(oper, data){
        var info = {oper: oper};
        if(data){
            info.data = data;
        }
        this.socket.emit("operation", info);
    },
    _onOperate: function(){
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
                    case OPERTABLE.gameover:
                        main.game.gameOver(data.result);
                        break;
                    case OPERTABLE.dead:
                        break;
                    case OPERTABLE.left:
                        tetris.move(-1,0);
                        break;
                    case OPERTABLE.right:
                        tetris.move(1,0);
                        break;
                    case OPERTABLE.down:
                        tetris.moveDown();
                        break;
                    case OPERTABLE.downNature:
                        tetris.moveDownNature();
                        break;
                    case OPERTABLE.drop:
                        tetris.drop();
                        break;
                    case OPERTABLE.attack:
                        main.game.trashPool(data.data);
                        break;
                    case OPERTABLE.trash:
                        tetris.trash(data.data);
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
    single: function(time){
        this.socket.emit("single40", {
            time:time,
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
