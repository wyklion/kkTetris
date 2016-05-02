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
    },
    onLogin: function(){
        var welcome = document.getElementById("welcome");
        //welcome.innerHTML = "Welcome "+socket.data.user+"<a href='/logout'>注销</a>"
        welcome.innerHTML = "Welcome "+socket.data.user;
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
        this.game.setButton(single);
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

