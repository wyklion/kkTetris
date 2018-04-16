var express = require('express');
var router = express.Router();

/**
 * 检查登录
 */
router.route("/checklogin").get(function (req, res) {
   if (!req.session.user) {
      res.send({ err: '未登录' });
   }
   else {
      res.send({ result: req.session.user });
   }
});

/**
 * 登录
 */
router.route("/login").post(function (req, res) {
   var id = req.body.id;
   var pswd = req.body.pswd;
   mongo.findUser(id, (err, user) => {
      if (err) {
         res.send({ err: '用户不存在' });
      } else {
         if (pswd != user.password) {
            res.send({ err: '密码错误' });
         } else {
            req.session.user = user;
            res.send({ result: user });
         }
      }
   })
});

/**
 * 注册
 */
router.route("/register").post(function (req, res) {
   var id = req.body.id;
   var name = req.body.name;
   var pswd = req.body.pswd;
   mongo.findUser(id, (err, user) => {
      if (err) {
         mongo.createNewUser(id, name, pswd, function (err, result) {
            if (err || result.result.n !== 1) {
               res.send({ err: '创建用户失败！' });
            }
            else {
               res.send({ result: '用户名创建成功！' });
            }
         });
      } else {
         res.send({ err: '用户名已存在！' });
      }
   });
});

/**
 * 登出
 */
router.get("/logout", function (req, res) {
   req.session.destroy((err) => {
      if (err) {
         res.send({ err: '登出失败！' })
      }
      res.send({ result: '登出成功！' });
   });
});

/**
 * 用户状态
 */
router.get("/userInfo", function (req, res) {
   var id = req.query.id;
   mongo.findUser(id, (err, user) => {
      if (err) {
         res.send({ err: '找不到用户！' });
      }
      else {
         res.send({ result: { id: id, nick: user.nick, sign: user.sign, speed40Times: user.speed40Times, speed40Best: user.speed40Best } });
      }
   })
});

/**
 * 排行榜
 */
router.route("/rank").get(function (req, res) {
   mongo.findOption("users", { speed40Best: { $lt: 999 } }, {
      fields: ["id", "nick", "speed40Best"], limit: 100, sort: { "speed40Best": 1 }
   }, function (result) {
      res.send({ result: result });
   });
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


module.exports = router;
