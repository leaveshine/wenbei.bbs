var connPool = require("./ConnPool");
var LoginBean = require("../jsBean/LoginBean");
module.exports = {
    register: function (req, res) {
        pool = connPool();
        pool.getConnection(function (err, conn) {
            if (err) {
                res.send("链接数据库出错：" + err.message);
                return;
            }
            var userAddSql = "insert into user (email,pwd,nicheng,createtime) values (?,?,?,current_timestamp)";
            var param = [req.body['email'], req.body['pwd'], req.body["name"]];
            conn.query(userAddSql, param, function (err, rs) {
                var setStr = "<script>alert(";
                if (err) {
                    //res.send("数据库写入出错："+err.message);
                    if (err.message.indexOf("emailuniq") != -1) {
                        setStr += "'邮箱已注册！');";
                    } else if (err.message.indexOf("nichenguiq") != -1) {
                        setStr += "'昵称已占用！');";
                    }
                    setStr += "history.back();</script>"
                    res.send(setStr);
                    return;
                }
                //setStr += "'注册成功！');location.href='/';</script>";
                //res.send(setStr);
                res.redirect(307,"./login");
            });
            conn.release();
        });
    },
    login: function (req, res) {
        pool = connPool();
        pool.getConnection(function (err, conn) {
            if (err) {
                res.send("链接数据库出错：" + err.message);
                return;
            }
            var userAddSql = "select uid,email,nicheng from user where email=? and pwd=?";
            var param = [req.body['email'], req.body['pwd']];
            conn.query(userAddSql, param, function (err, rs) {
                var str = "<script>"
                if (err) {
                    res.send(err.message);
                    return;
                }
                if (rs.length != 0) {
                    loginbean = new LoginBean(rs[0].uid,rs[0].email,rs[0].nicheng);
                    req.session.loginbean = loginbean;
                    targetUrl = req.body['targeturl'];
                    res.redirect(targetUrl);
                    //str+="alert('登录成功！');</script>";
                    //res.send(str);
                }else{
                    str+="alert('用户名或密码错误！');history.back();</script>";
                    res.send(str);
                }
            });
            conn.release();
        });
    }
};