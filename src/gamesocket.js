/**
 * Created by kk on 2016/4/28.
 */
var SocketIO = require('socket.io');

var OPERTABLE = {
    ready:      0,
    dead:       1,

    left:       10,
    right:      11,
    down:       12,
    drop:       13,
    rotateL:    14,
    rotateR:    15,
    rotate180:  16,
    hold:       17,

    downNature: 18,
    leftEnd:    19,
    rightEnd:   20,
    downEnd:    21,

    attack:     30,
    trash:      31,

    start:      100,
    gameover:   200,
};

var MSG_TYPE = {
    lobby: 0,
    room: 1,
};

var getTime = function(){
    var date = new Date();
    return date.getTime();
};

var RandomGenerator = function(){
    var shapes = [];
    for(var i = 0; i < 100; i++){
        var bag = [1,2,3,4,5,6,7];
        for(var j = 0; j < 7; j++){
            var idx = Math.floor(Math.random()*bag.length);
            shapes.push(bag[idx])
            bag.splice(idx, 1);
        }
    }
    return shapes;
};

var RoomManager = function(){
    this.rooms = {};
    this.currentRoomIdx = 0;
};
RoomManager.prototype = {
    constructor: RoomManager,
    getRooms: function(){
        return this.rooms;
    },
    getRoom: function(id){
        return this.rooms[id];
    },
    createRoom: function(userId){
        var idx = this.currentRoomIdx++;
        this.rooms[idx] = {
            id: idx,
            playUsers:[userId],
            watchUsers:[],
            ready:{},
        };
        return idx;
    },
    joinRoom: function(roomId, userId, watch){
        var room = this.rooms[roomId];
        if(room) {
            if(!watch) {
                if (room.playUsers.length == 1) {
                    room.playUsers.push(userId);
                    return {err: null};
                }
                else
                    return {err: "room " + roomId + " is empty."};
            }
            else if (room.playUsers.length == 2){
                room.watchUsers.push(userId);
                return {err: null};
            }
            else
                return {err: "room " + roomId + " is not full."};
        }
        else
            return {err: "room "+roomId+" not exists."}
    },
    exitRoom: function(roomId, userId, watch){
        var room = this.rooms[roomId];
        if(room) {
            if(!watch){
                var idx = room.playUsers.indexOf(userId);
                if (idx > -1) {
                    room.playUsers.splice(idx, 1);
                    room.ready = {};
                    if (room.playUsers.length === 0) {
                        delete this.rooms[roomId];
                        return {err:null, delRoom: true, watch: false};
                    }
                    else
                        return {err:null, delRoom: false, watch: false};
                }
                else
                    return {err: "who exits room?"};
            }
            else{
                var watchIdx = room.watchUsers.indexOf(userId);
                if(watchIdx > -1){
                    room.watchUsers.splice(watchIdx, 1);
                    return {err:null, delRoom: false, watch: true};
                }
                else
                    return {err: "who watch exits room?"};
            }
        }
        else
            return {err: "room "+roomId+" not exists."}
    },
    userLeave: function(socket){
        for(var i in this.rooms){
            var idx = this.rooms[i].playUsers.indexOf(socket.userId);
            var watchIdx = this.rooms[i].watchUsers.indexOf(socket.userId);
            if(idx > -1){
                this.rooms[i].playUsers.splice(idx, 1);
                this.rooms[i].ready = {};
                if(this.rooms[i].playing){
                    this.rooms[i].playing = false;
                    socket.broadcast.to("room"+socket.roomId).emit('roomInfo', {room:this.rooms[i], userId:socket.userId, join:false, watch:false});
                    mongo.updateAddValue("users", {id:socket.userId}, {disconnect: 1});
                }
                if(this.rooms[i].playUsers.length === 0){
                    delete this.rooms[i];
                }
            }
            else if(watchIdx > -1){
                this.rooms[i].watchUsers.splice(watchIdx, 1);
                socket.broadcast.to("room"+socket.roomId).emit('roomInfo', {room:this.rooms[i], userId:socket.userId, join:false, watch:true});
            }
        }
    },
    getOtherUserId: function(room, userId){
        if(room.playUsers.length == 2){
            return room.playUsers[0] == userId ? room.playUsers[1] : room.playUsers[0];
        }
        return null;
    },
    userReady: function(socket){
        if(socket.roomId == null || socket.roomId == undefined) return;
        var room = this.rooms[socket.roomId];
        if(!room) return;
        room.ready[socket.userId] = true;
        var otherUser = this.getOtherUserId(room, socket.userId);
        if(otherUser){
            if(room.ready[otherUser]){
                room.win = null;
                room.playing = true;
                var randomShapes = RandomGenerator();
                socket.emit("onOperation", {oper:OPERTABLE.start, shapes: randomShapes});
                socket.broadcast.to("room"+socket.roomId).emit("onOperation", {oper:OPERTABLE.start, shapes: randomShapes});
                mongo.insertOne("gameinfo", {id:socket.userId, id2:otherUser, type:"vsGame", roomId:socket.roomId, time:getTime()})
            }
        }
        console.log("room", socket.roomId, "user", socket.userId, "is ready...");
    },
    userDead: function(socket){
        if(socket.roomId == null || socket.roomId == undefined) return;
        var room = this.rooms[socket.roomId];
        if(!room) return;
        room.ready = {};
        room.playing = false;
        if(room.win) return; //already gameover...
        var otherUser = this.getOtherUserId(room, socket.userId);
        room.win = otherUser;
        socket.emit("onOperation", {oper:OPERTABLE.gameover, result:{win:otherUser,lose:socket.userId}});
        socket.broadcast.to("room"+socket.roomId).emit('onOperation', {oper:OPERTABLE.gameover, result:{win:otherUser,lose:socket.userId}});
        console.log("room", socket.roomId, "user", socket.userId, "lose", otherUser, "win");
        mongo.updateAddValue("users", {id:socket.userId}, {lose: 1});
        mongo.updateAddValue("users", {id:otherUser}, {win: 1});
    },
};

var GameSocket = function(app, server, httpServer){
    this.mongoStore = app.mongoStore;
    this.sessionMidleware = app.sessionMidleware;
    this.io = new SocketIO();
    this.io.attach(server);
    this.io.attach(httpServer);
    this.session = null;
    this.init();

    this.users = [];
    this.roomManager = new RoomManager();
};
GameSocket.prototype = {
    constructor: GameSocket,
    init: function(){
        var _this = this;
        //this.io.use(function(socket, next) {
        //    //console.log("sesseion 1:",socket.request.session);
        //    //console.log("cookie 1", socket.request.headers.cookie);
        //    _this.sessionMidleware(socket.request, {}, next);
        //});
        //this.io.use(function(socket, next){
        //    //console.log("sesseion 2:",socket.request.session);
        //    if(!socket.request.headers.cookie)
        //        return;
        //    //console.log("cookie 2",socket.request.headers.cookie);
        //    socket.request.cookie = require('express/node_modules/cookie').parse(socket.request.headers.cookie);
        //    var connect_sid = socket.request.cookie['connect.sid'];
        //    var sid = '';
        //    if(connect_sid){
        //        sid = connect_sid.split(':')[1].split('.')[0];
        //        _this.mongoStore.get(sid, function(error, session){
        //            if (error || !session) {
        //                //console.log("io auth error:", error);
        //                // if we cannot grab a session, turn down the connection
        //                console.log(error.message);
        //            }
        //            else {
        //                console.log("io session:", sid, session);
        //                // save the session data and accept the connection
        //                socket.handshake.session = session;
        //                next();
        //            }
        //        });
        //    }
        //    else{
        //        console.log('nosession');
        //    }
        //    next();
        //});
        this.io.set('authorization', function(handshakeData, callback){
            if(!handshakeData.headers.cookie)
                return;
            // 通过客户端的cookie字符串来获取其session数据
            handshakeData.cookie = require('express/node_modules/cookie').parse(handshakeData.headers.cookie);
            var connect_sid = handshakeData.cookie['connect.sid'];
            //console.log("conid:", connect_sid, "auth:", handshakeData.cookie);
            var sid = '';
            if(connect_sid){
                sid = connect_sid.split(':')[1].split('.')[0];
                _this.mongoStore.get(sid, function(error, session){
                    if (error || !session) {
                        //console.log("io auth error:", error);
                        // if we cannot grab a session, turn down the connection
                        callback(error.message, false);
                    }
                    else {
                        //console.log("io session:", sid, session);
                        // save the session data and accept the connection
                        handshakeData.headers.session = session;
                        callback(null, true);
                    }
                });
            }
            else{
                callback('nosession');
            }
        });
    },
    start: function(){
        this.io.on('connection', this.onConnection.bind(this));
        //mongo.find("users", {id:"kk"}, function(result){
        //    console.log(result);
        //})
    },
    onConnection: function(socket){
        //console.log("connect session:", session);
        var _this = this;
        var session = socket.request.headers.session;
        if(!session || !session.user) return;
        socket.userId = session.user.id;
        console.log(socket.userId, "connected... " + socket.id);
        mongo.find("users", {id:socket.userId}, function(result){
            if(result.length>0) {
                _this.onDataConnection(result[0], socket);
            }
            else{
                socket.emit('onConnection', {err: "Can't find user when connect..."});
                console.log("Can't find user when connect...");
            }
        })
    },
    onDataConnection: function(userData, socket){
        if(this.users.indexOf(socket.userId) === -1)
            this.users.push(socket.userId);
        socket.join("lobby");
        socket.emit('onConnection', {err: null, user: userData, users: this.users, rooms: this.roomManager.getRooms()});
        socket.broadcast.to("lobby").emit('lobbyInfo', {err: null, users: this.users});

        this.onDisconnect(socket);
        this.onCreateRoom(socket);
        this.onJoinRoom(socket);
        this.onExitRoom(socket);

        this.onPlaying(socket);
        this.onSingle(socket);

        this.onSetting(socket);
        this.onMsg(socket);
    },
    onDisconnect: function(socket){
        var _this = this;
        socket.on('disconnect', function(){
            var idx = _this.users.indexOf(socket.userId);
            if(idx > -1){
                console.log(socket.userId, "disconnect");
                _this.users.splice(idx,1);
                _this.roomManager.userLeave(socket);
                socket.broadcast.to("lobby").emit('lobbyInfo',
                    {err: null, users: _this.users, rooms:_this.roomManager.getRooms()});
            }
        });
    },
    onCreateRoom: function(socket){
        var _this = this;
        socket.on('createRoom', function(data){
            var idx = _this.roomManager.createRoom(socket.userId);
            socket.roomId = idx;
            socket.leave("lobby");
            socket.join("room"+socket.roomId);
            socket.emit("onCreateRoom", {err:null, room: _this.roomManager.getRoom(idx)});
            socket.broadcast.to("lobby").emit('lobbyInfo', {rooms:_this.roomManager.getRooms()});
            console.log(socket.userId, "createRoom", socket.roomId);
            mongo.insertOne("gameinfo", {id:socket.userId, type:"createRoom", roomId:idx, time:getTime()})
        });
    },
    onJoinRoom: function(socket){
        var _this = this;
        socket.on('joinRoom', function(data){
            var result = _this.roomManager.joinRoom(data.roomId, socket.userId, data.watch);
            if(!result.err){
                socket.roomId = data.roomId;
                socket.emit("onJoinRoom", {err:null, room:_this.roomManager.getRoom(socket.roomId), watch:data.watch});
                console.log(socket.userId, data.watch?"watchRoom":"joinRoom", socket.roomId);
                socket.leave("lobby");
                socket.join("room"+socket.roomId);
                socket.broadcast.to("lobby").emit('lobbyInfo', {rooms:_this.roomManager.getRooms()});
                socket.broadcast.to("room"+socket.roomId).emit('roomInfo', {room:_this.roomManager.getRoom(socket.roomId), userId:socket.userId, join:true, watch:data.watch});
                // 通知房间内人员
                _this.io.to("room"+socket.roomId).emit('msg', socket.userId + '加入了房间', _this.roomManager.getRoom(socket.roomId));
                mongo.insertOne("gameinfo", {id:socket.userId, type:data.watch?"watchRoom":"joinRoom", roomId:socket.roomId, time:getTime()})
            }
            else{
                socket.emit("onJoinRoom", {err:result.err})
            }
        });
    },
    onExitRoom: function(socket){
        var _this = this;
        socket.on('exitRoom', function(data){
            var roomId = socket.roomId;
            var result = _this.roomManager.exitRoom(roomId, socket.userId, data.watch);
            if(!result.err){
                socket.leave("room"+roomId);    // 退出房间
                socket.join("lobby");
                console.log(socket.userId, "exit room", roomId);
                _this.io.to("room"+roomId).emit('msg', socket.userId + '退出了房间', _this.roomManager.getRoom(roomId));
                if(result.delRoom){
                    socket.broadcast.to("lobby").emit('lobbyInfo', {rooms:_this.roomManager.getRooms()});
                }
                else{
                    socket.broadcast.to("room"+socket.roomId).emit('roomInfo', {room:_this.roomManager.getRoom(roomId), userId:socket.userId, join:false, watch:data.watch});
                }
                socket.roomId = null;
                socket.emit("onExitRoom", {err:null, result:"ok"});
                socket.emit("lobbyInfo", {users: _this.users, rooms:_this.roomManager.getRooms()});
                //mongo.insertOne("gameinfo", {id:socket.userId, type:"exitRoom", roomId:roomId, time:getTime()})
            }
            else
                socket.emit("onExitRoom", {err:result.err});
        });
    },
    onPlaying: function(socket){
        var _this = this;
        socket.on('operation', function(data){
            var oper = data.oper;
            if(oper === OPERTABLE.dead){
                _this.roomManager.userDead(socket);
                return;
            }
            data.userId = socket.userId;
            socket.broadcast.to("room"+socket.roomId).emit('onOperation', data);
            if(oper === OPERTABLE.ready){
                _this.roomManager.userReady(socket);
            }
        })
    },
    onSingle: function(socket){
        var _this = this;
        socket.on('single40', function(data){
            mongo.updateAddValue("users", {id:socket.userId}, {single40Times: 1});
            mongo.updateOne("users", {id:socket.userId, single40Best:{"$gt":data.time}}, {single40Best: data.time});
        })
    },
    onSetting: function(socket){
        var _this = this;
        socket.on('setting', function(data){
            if(data.type === "keyboard"){
                mongo.updateOne("users", {id:socket.userId}, {keyboard: data.keyboard});
            }
            else if(data.type === "setting"){
                mongo.updateOne("users", {id:socket.userId}, {setting: data.setting});
            }
        })
    },
    onMsg: function(socket){
        var _this = this;
        socket.on('chat', function(data){
            if(data.type===MSG_TYPE.lobby){
                socket.broadcast.to("lobby").emit("chat", {user:socket.userId, msg:data.msg});
            }
        })
    },
}

module.exports = GameSocket;
