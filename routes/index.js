var express = require('express');
var router = express.Router();

/* GET index page. */
//router.get('/', function(req, res,next) {
//    res.render('index', { title: 'Express' });    // 到达此路径则渲染index文件，并传出title值供 index.html使用
//});

/* GET login page. */
router.route("/login").get(function(req,res){    // 到达此路径则渲染login文件，并传出title值供 login.html使用
    res.render("login",{title:'User Login', message: res.locals.message});
}).post(function(req,res){                        // 从此路径检测到post方式则进行post数据的处理操作
    //get User info
    var uname = req.body.uname;                //获取post上来的 data数据中 uname的值
    var pswd = req.body.upwd;
    //console.log("login:", uname, pswd);
    mongo.find("users", {id:uname}, function(result){
        //console.log("login user:", result);
        if(result.length === 0){                            //查询不到用户名匹配信息，则用户名不存在
            req.session.error = '用户名不存在';
            res.send(404);                            //    状态码返回404
            //    res.redirect("/login");
        }else{
            if(pswd != result[0].password){     //查询到匹配用户名的信息，但相应的password属性不匹配
                req.session.error = "密码错误";
                res.send(404);
                //    res.redirect("/login");
            }else{                                     //信息匹配成功，则将此对象（匹配到的user) 赋给session.user  并返回成功
                req.session.user = result[0];
                res.send(200);
                //    res.redirect("/play");
            }
        }
    })
});

/* GET register page. */
router.route("/register").get(function(req,res){    // 到达此路径则渲染register文件，并传出title值供 register.html使用
    res.render("register",{title:'User register', message: res.locals.message});
}).post(function(req,res){
    var uname = req.body.uname;
    var upwd = req.body.upwd;
    mongo.find("users", {id:uname}, function(result){
        if(result.length > 0){
            req.session.error = '用户名已存在！';
            res.send(500);
        }else{
            mongo.insertOne("users", {
                id:uname, nick:uname, password: upwd,
                level:0, score:0,
                win:0, lose:0, disconnect: 0,
                single40Times:0, single40Best:999,
                keyboard: {
                left:37,right:39,down:70,drop:40,rotate:82,rotateRight:69,rotate180:87,hold:84,dasDelay:150,moveDelay:30,
                }
            }, function(err, result){
                if(err || result.result.n !== 1){
                    req.session.error = '创建用户失败！';
                    res.send(500);
                }
                else{
                    req.session.error = '用户名创建成功！';
                    res.send(200);}
            })
        }
    });
});

/* GET main page. */
router.get("/",function(req,res){
    if(!req.session.user){                     //到达/play路径首先判断是否已经登录
        req.session.error = "请先登录"
        res.redirect("/login");                //未登录则重定向到 /login 路径
    }
    else{
        //res.redirect("/index.html");
        //console.log("play user:", req.session.user);
        res.render("index",{title:'Tetris', user:req.session.user});         //已登录则渲染play页面
    }
});

/* GET play page. */
router.get("/play",function(req,res){
    if(!req.session.user){                     //到达/play路径首先判断是否已经登录
        req.session.error = "请先登录"
        res.redirect("/login");                //未登录则重定向到 /login 路径
    }
    else{
        //res.redirect("/index.html");
        //console.log("play user:", req.session.user);
        res.render("index",{title:'Tetris', user:req.session.user});         //已登录则渲染play页面
    }
});

/* GET logout page. */
router.get("/logout",function(req,res){
    req.session.user = null;
    req.session.error = null;
    res.redirect("/login");
});

//kk admin
router.route("/admin").get(function(req,res){
    if(!req.session.user || req.session.user.id != "kk"){
        req.session.error = "请用管理员帐号登录"
        res.redirect("/login");
    }
    else{
        res.render("admin");
    }
}).post(function(req,res){
    if(!req.session.user || req.session.user.id != "kk"){
        req.session.error = "请用管理员帐号登录"
        res.redirect("/login");
        return;
    }
    var type = req.body.type;
    var collection = req.body.collection;
    var query = req.body.query;
    mongo.find(collection, query, function(result){
        res.send(result);
        res.status(200);
    });
});

module.exports = router;
