var express = require('express');
var router = express.Router();

/* GET index page. */
//router.get('/', function(req, res,next) {
//    res.render('index', { title: 'Express' });    // 到达此路径则渲染index文件，并传出title值供 index.html使用
//});

router.route("/checklogin").post(function (req, res) {
   if (!req.session.user) {
      req.session.error = "请先登录";
      res.send({ err: '未登录' });
   }
   else {
      res.send({ result: req.session.user });
   }
});

/* GET login page. */
router.route("/login").get(function (req, res) {
   console.log(req.body);
}).post(function (req, res) {                        // 从此路径检测到post方式则进行post数据的处理操作
   //get User info
   var id = req.body.id;                //获取post上来的 data数据中 uname的值
   var pswd = req.body.pswd;
   //console.log("login:", id, pswd);
   mongo.find("users", { id: id }, function (result) {
      //console.log("login user:", result);
      if (result.length === 0) {
         //查询不到用户名匹配信息，则用户名不存在
         req.session.error = '用户名不存在';
         res.send({ err: '用户名不存在' });
         //    res.redirect("/login");
      } else {
         if (pswd != result[0].password) {     //查询到匹配用户名的信息，但相应的password属性不匹配
            req.session.error = "密码错误";
            res.send({ err: '密码错误' });
            //    res.redirect("/login");
         } else {                                     //信息匹配成功，则将此对象（匹配到的user) 赋给session.user  并返回成功
            req.session.user = result[0];
            res.send({ result: result[0] });
            //    res.redirect("/play");
         }
      }
   })
});

/* GET register page. */
router.route("/register").post(function (req, res) {
   var uname = req.body.uname;
   var upwd = req.body.upwd;
   mongo.find("users", { id: uname }, function (result) {
      if (result.length > 0) {
         req.session.error = '用户名已存在！';
         res.send(500);
      } else {
         mongo.createNewUser(uname, upwd, function (err, result) {
            if (err || result.result.n !== 1) {
               req.session.error = '创建用户失败！';
               res.send(500);
            }
            else {
               req.session.error = '用户名创建成功！';
               res.send(200);
            }
         });
      }
   });
});

/* GET logout page. */
router.get("/logout", function (req, res) {
   req.session.user = null;
   req.session.error = null;
   res.redirect("/login");
});

//kk admin
router.route("/admin").get(function (req, res) {
   if (!req.session.user || req.session.user.id != "kk") {
      req.session.error = "请用管理员帐号登录"
      res.redirect("/login");
   }
   else {
      res.render("admin");
   }
}).post(function (req, res) {
   if (!req.session.user || req.session.user.id != "kk") {
      req.session.error = "请用管理员帐号登录"
      res.redirect("/login");
      return;
   }
   var type = req.body.type;
   var collection = req.body.collection;
   var query = JSON.parse(req.body.query);
   mongo.find(collection, query, function (result) {
      res.send(result);
      res.status(200);
   });
});

//normal query
router.route("/rank").post(function (req, res) {
   mongo.findOption("users", {}, {
      fields: ["id", "single40Best"], limit: 100, sort: { "single40Best": 1 }
   }, function (result) {
      res.send(result);
      res.status(200);
   });
});

module.exports = router;
