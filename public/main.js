var socket;
var Main = function(){
    this.mainDiv = document.getElementById("mainDiv");
    this.init();
};
Main.prototype = {
    constructor: Main,
    init: function(){
        this.initUI();
    },
    initUI: function(){
        $('#logoutButton').on('click', function () {
            location.href = '/logout';
        })
        $('#createRoomButton').on('click', function () {
            socket.createRoom();
        })
        $('#exitButton').on('click', function () {
            socket.exitRoom();
        })
        var _this = this;
        $('#leftkey').on('click', function(){
            $(this).empty();
            _this.setkey = "left";
        });
        $('#rightkey').on('click', function(){
            $(this).empty();
            _this.setkey = "right";
        });
        $('#dropkey').on('click', function(){
            $(this).empty();
            _this.setkey = "drop";
        });
        $('#downkey').on('click', function(){
            $(this).empty();
            _this.setkey = "down";
        });
        $('#rotatekey').on('click', function(){
            $(this).empty();
            _this.setkey = "rotate";
        });
        $('#rotateRightkey').on('click', function(){
            $(this).empty();
            _this.setkey = "rotateRight";
        });
        $('#rotate180key').on('click', function(){
            $(this).empty();
            _this.setkey = "rotate180";
        });
        $('#holdkey').on('click', function(){
            $(this).empty();
            _this.setkey = "hold";
        });
        $('#keyboardButton').on('click', function () {
            _this.settingKey = true;
            $('#myModal').modal();
        })
        $('#myModal').on('shown.bs.modal', function () {
            _this.keyboard = {};
            for(var i in socket.data.user.keyboard){
                if(i==="dasDelay" || i=="moveDelay") continue;
                $('#'+i+'key').empty();
                $('#'+i+'key').empty();
                var str = "<kbd>"+String.fromCharCode(socket.data.user.keyboard[i])+"</kbd>"
                $('#'+i+'key').append(str);
                _this.keyboard[i] = socket.data.user.keyboard[i];
            }
            $('#dasDelay').val(socket.data.user.keyboard.dasDelay);
            $('#moveDelay').val(socket.data.user.keyboard.moveDelay);
            $(document).keydown(function(event){
                if(!_this.setkey) return;
                var str = "<kbd>"+String.fromCharCode(event.keyCode)+"</kbd>"
                $('#'+_this.setkey+'key').append(str);
                _this.keyboard[_this.setkey] = event.keyCode;
                _this.setkey = null;
            });
        });
        $('#myModal').on('hide.bs.modal', function () {
            _this.setkey = null;
            $(document).unbind("keydown");
        });
        $('#keyboardSave').on('click', function () {
            var dasDelay = parseInt($('#dasDelay').val());
            if(dasDelay < 10) dasDelay = 10; else if(dasDelay > 1000) dasDelay = 1000;
            var moveDelay = parseInt($('#moveDelay').val());
            if(moveDelay < 0) moveDelay = 0; else if(moveDelay > 500) moveDelay = 500;
            _this.keyboard.dasDelay = dasDelay;
            _this.keyboard.moveDelay = moveDelay;
            socket.setKeyboard(_this.keyboard);
            _this.keyboard = null;
            $('#myModal').modal('hide');
        });
    },
    onLogin: function(){
        var welcome = document.getElementById("welcome");
        //welcome.innerHTML = "Welcome "+socket.data.user+"<a href='/logout'>注销</a>"
        welcome.innerHTML = "Welcome "+socket.data.user.id;
        this.updateRoomList();
        this.updateUserList();
    },
    updateRoomList: function(){
        $('#roomList').empty();
        for(var i in socket.data.rooms) {
            var room = socket.data.rooms[i];
            var str = "<tr><td>"+room.id+"</td><td>";
            if(room.playUsers.length === 1){
                str += room.playUsers[0] + " is waiting...</td><td><button id='room"+room.id+"' type='button' class='btn btn-default'>enter</button></td>";
            }
            else{
                str += room.playUsers[0] + " vs " + room.playUsers[1] + "</td><td><button id='room"+room.id+"' type='button' class='btn btn-default disabled'>watch</button></td>";
            }
            $('#roomList').append(str);
            $('#room'+room.id).on('click', function(){
                socket.joinRoom(room.id);
            });
        }
    },
    updateUserList: function(){
        $('#userList').empty();
        for(var i = 0; i < socket.data.users.length; i++) {
            var user = "<li class='list-group-item'>"+socket.data.users[i]+"</li>";
            $('#userList').append(user);
        }
    },
    goRoom: function(){
        $('#mainDiv').hide();
        $('#gameDiv').show();
        this.game = new Game();
        this.game.init();
        var single = socket.data.room.playUsers.length != 2;
        this.game.single = single;
        this.game.ui.reset(single);
    },
    exitRoom: function(){
        $('#mainDiv').show();
        $('#gameDiv').hide();
        this.updateRoomList();
        this.updateUserList();
        this.game.dispose();
        this.game = null;
    },
};

var main = new Main();
socket = new GameSocket();

//var game = new Game();
//game.init();

