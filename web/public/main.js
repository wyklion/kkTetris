var socket;
var Main = function(){
    this.mainDiv = document.getElementById("mainDiv");
    this.init();
};
Main.prototype = {
    constructor: Main,
    init: function(){
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
        this.initKeyboardSetting();
        this.initSetting();
        this.initChat();
        this.setTheme();
        $('body').css('display','block');
    },
    initSetting: function(){
        var _this = this;
        $('#settingButton').on('click', function () {
            $('#settingModal').modal();
        })
        $('#settingModal').on('show.bs.modal', function () {
            if(socket.data.user.setting.theme === 0)
                $('#themeSelect').selectpicker('val', 'White Theme');
            else
                $('#themeSelect').selectpicker('val', 'Black Theme');
            _this.setting = {
                theme: socket.data.user.setting.theme,
            };
        });
        $('#settingSave').on('click', function () {
            $('#settingModal').modal('hide');
            var theme = $('#themeSelect').val();
            var newThemeIdx = theme === "White Theme" ? 0 : 1;
            if(_this.setting.theme === newThemeIdx) return;
            _this.setting.theme = newThemeIdx;
            socket.setSetting(_this.setting);
            _this.setTheme();
        });
    },
    setTheme: function(){
        if(!socket.data.user.setting)
            socket.data.user.setting = {theme:0};
        var theme = socket.data.user.setting.theme;
        if(theme === 0){
            $(".myTheme").css("background-color","#FFFFFF");
            $(".myTheme").css("border-color","#AAAAAA");
            $("body").css("background-color","#FFFFFF");
            //$("body").css("color","#000");
            //$('#userList').css('background-color','white');
        }
        else{
            $(".myTheme").css("background-color","#999999");
            $(".myTheme").css("border-color","#555555");
            $("body").css("background-color","#555555");
            //$("body").css("color","#FFF");
            //$('#userList').css('background-color','#999999');
        }
    },
    initKeyboardSetting: function(){
        for(var i in socket.data.user.keyboard){
            if(i==="dasDelay" || i=="moveDelay") continue;
            $('#'+i+'key').empty();
            var str = "<kbd>"+key[socket.data.user.keyboard[i]]+"</kbd>"
            $('#'+i+'key').append(str);
        }
        $('#dasDelay').val(socket.data.user.keyboard.dasDelay);
        $('#moveDelay').val(socket.data.user.keyboard.moveDelay);

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
                _this.keyboard[i] = socket.data.user.keyboard[i];
            }
            $('#dasDelay').val(socket.data.user.keyboard.dasDelay);
            $('#moveDelay').val(socket.data.user.keyboard.moveDelay);
            $(document).keydown(function(event){
                if(!_this.setkey) return;
                var str = "<kbd>"+key[event.keyCode]+"</kbd>"
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
    initChat: function(){
        var _this = this;
        $('#lobbySay').bind('keypress',function(event){
            if(event.keyCode == "13")
            {
                var val = $('#lobbySay').val();
                socket.sendMsg({type:MSG_TYPE.lobby, msg:val});
                _this.putMsg(socket.data.user.id, val, true);
                $('#lobbySay').val("");
            }
        });
    },
    putMsg: function(user, msg, me){
        //var txt;
        //if(me)
        //    txt = "<font color=#8a2be2>"+user+": "+msg+"</font><br>";
        //else
        //    txt = "<font color=#1e90ff>"+user+": "+msg+"</font><br>";
        //$('#lobbyTextarea').append(txt);
        msg = msg.replace('<', '&lt');
        msg = msg.replace('>', '&gt');
        $('#lobbyTextarea').append(user+": "+msg+"\n");
    },
    spin: function(){
        $("<div class='waitingDiv'></div>").appendTo($("body"));
        this.spinner = new Spinner().spin($("#wholeDiv")[0]);
    },
    stopSpin: function(){
        $(".waitingDiv").remove();
        this.spinner.stop();
    },
    onLogin: function(){
        var welcome = document.getElementById("welcome");
        //welcome.innerHTML = "Welcome "+socket.data.user+"<a href='/logout'>注销</a>"
        welcome.innerHTML = "Welcome "+socket.data.user.id;
        this.initUI();

        this.updateRoomList();
        this.updateUserList();
        this.updateRankList();
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
                str += room.playUsers[0] + " vs " + room.playUsers[1] + "</td><td><button id='watch"+room.id+"' type='button' class='btn btn-default'>watch</button></td>";
            }
            $('#roomList').append(str);
            $('#room'+room.id).on('click', function(){
                socket.joinRoom(room.id);
            });
            $('#watch'+room.id).on('click', function(){
                socket.joinRoom(room.id, true);
            });
        }
    },
    updateUserList: function(){
        $('#userList').empty();
        for(var i = 0; i < socket.data.users.length; i++) {
            var user = "<li class='myTheme list-group-item'>"+socket.data.users[i]+"</li>";
            $('#userList').append(user);
        }
    },
    updateRankList: function(){
        $.ajax({
            url: '/rank',
            type: 'post',
            data: {},
            success: function (data, status) {
                $('#rankList').empty();
                var tbody = "";
                for(var i = 0; i < data.length; i++){
                    var tdStr = "<td>"+(i+1)+"</td><td>"+data[i].id+"</td><td>"+data[i].single40Best.toFixed(1)+"</td>";
                    tbody += "<tr>"+tdStr+"</tr>";
                }
                $('#rankList').append(tbody);
            }
        });
    },
    goRoom: function(watch){
        $('#mainDiv').hide();
        $('#gameDiv').show();
        this.game = new Game();
        var single = socket.data.room.playUsers.length != 2;
        this.game.single = single;
        if(watch)
            this.game.watch = true;
        this.game.init();
    },
    exitRoom: function(){
        $('#mainDiv').show();
        $('#gameDiv').hide();
        this.updateRoomList();
        this.updateUserList();
        this.updateRankList();
        this.game.dispose();
        this.game = null;
    },
};

var main = new Main();
socket = new GameSocket();

//var game = new Game();
//game.init();

