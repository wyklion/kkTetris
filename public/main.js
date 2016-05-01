var socket;
var Main = function(){
    this.mainDiv = document.getElementById("mainDiv");
    this.rooms = [];
    this.users = [];
    this.init();
};
Main.prototype = {
    constructor: Main,
    init: function(){
        var _this = this;
        this.roomLabel = new UITextElement({
            x:100,y:50,
            value:"Room List:",
            font:"Arial",
            size:20,
        }, this.mainDiv);
        this.createRoomButton = new UIButtonElement({
            x:300,y:50,
            w:100,h:50,
            value:"Create Room",
            onclick: function(){
                socket.createRoom();
            }
        }, this.mainDiv);
        this.userLabel = new UITextElement({
            x:600,y:50,
            value:"Users:",
            font:"Arial",
            size:20,
        }, this.mainDiv);
    },
    onLogin: function(){
        var welcome = document.getElementById("welcome");
        welcome.innerHTML = "Welcome "+socket.data.user+"<a href='/logout'>注销</a>"
        this.updateRoomList();
        this.updateUserList();
    },
    updateRoomList: function(){
        var _this = this;
        for(var i = 0; i < this.rooms.length; i++){
            this.rooms[i].label.dispose();
            this.rooms[i].button.dispose();
        }
        this.rooms = [];
        var count = 0;
        for(var i in socket.data.rooms){
            var room = socket.data.rooms[i];
            this.rooms[count] = {};
            this.rooms[count].label = new UITextElement({
                x:100,y:150+30*count,
                value:"Room "+room.id,
                font:"Arial",
                size:15,
            }, this.mainDiv);
            this.rooms[count].button = new UIButtonElement({
                x:240,y:150+30*count,
                w:80,h:40,
                value:"Enter",
                onclick: function(){
                    socket.joinRoom(room.id);
                }
            }, this.mainDiv);
            count++;
        }
    },
    updateUserList: function(){
        var _this = this;
        for(var i = 0; i < this.users.length; i++){
            this.users[i].dispose();
        }
        this.users = [];
        for(var i = 0; i < socket.data.users.length; i++){
            var user = socket.data.users[i];
            this.users[i] = new UITextElement({
                x:600,y:150+30*i,
                value:""+user,
                font:"Arial",
                size:15,
            }, this.mainDiv);
        }
    },
    setVisible: function(visible){
        if(visible)
            this.mainDiv.style.display="";
        else
            this.mainDiv.style.display="none";
    },
    goRoom: function(){
        this.setVisible(false);
        this.game = new Game();
        this.game.init();
        if(socket.data.room.playUsers.length === 2){
            this.game.single = false;
        }
    },
    exitRoom: function(){
        this.setVisible(true);
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

