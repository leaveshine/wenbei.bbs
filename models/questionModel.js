var connPool = require("./ConnPool");
var async = require("async");
module.exports = {
    ask: function (req, res) {
        loginbean = req.session.loginbean;
        pool = connPool();
        pool.getConnection(function (err, conn) {
            var userAddSql = "insert into question (typeid,typename,title,content,uid,nicheng,createtime) values(?,?,?,?,?,?,current_timestamp)";
            console.log("QM.jsde的loginbean:" + loginbean);
            // 这里有一个bug：重启服务  直接访问原；路由http://localhost:3000/question/ask会报错：没有uid
            var params = [req.body['typeid'], req.body['typename'], req.body['title'], req.body['content'], loginbean.uid, loginbean.name];
            conn.query(userAddSql, params, function (err, rs) {
                if (err) {
                    res.send("ask数据库操作有误：" + err.message);
                    return;
                } else {
                    res.send("<script>alert('提问成功！');location.href='../';</script>");
                }
            });
            conn.release();
        });
    },
    queList: function (req, res, loginbean) {
        pool = connPool();
        pool.getConnection(function (err, conn) {
            if (err) {
                res.send("链接数据库出错：" + err.message);
                return;
            }

            page = 1;
            if (req.query['page'] != undefined) {
                page = parseInt(req.query['page']);
                if (page < 1) {
                    page = 1;
                }
            }

            pageSize = 2;
            pointStart = (page - 1) * pageSize;
            count = 0;
            countPage = 0;
            var countSql = "select count(*)from question";

            var listSql = "select qid,title,looknum,renum,finished,updtime,createtime from question order by qid desc limit ?,?";
            var param = [pointStart, pageSize];
            async.series({
                one: function (callback) {
                    conn.query(countSql, [], function (err, rs) {
                        count = rs[0]["count(*)"];
                        countPage = Math.ceil(count / pageSize);
                        if (page > countPage) {
                            page = countPage;
                            pointStart = (page - 1) * pageSize;
                        }
                        param = [pointStart, pageSize];
                        callback(null, rs);
                    });
                },
                two: function (callback) {
                    conn.query(listSql, param, function (err, rs) {
                        callback(null, rs);
                    });

                }
            }, function (err, result) {
                rs = result ["two"];
                count = result["one"][0]["count(*)"];
                countPage = Math.ceil(count / pageSize);
                // res.send("查询完毕:"+JSON.stringify(rs));

                res.render('index', {
                    loginbean: loginbean,
                    rs: rs,
                    page: page,
                    count: count,
                    countPage: countPage
                });
            });
            conn.release();
        });
    },
    detail: function (req, res) {
        qid = req.query["qid"];
        if (qid != undefined) {
            sqlupd = "update question set looknum=looknum+1 where qid = ?";
            sqldetail = "select qid,nicheng,typename,title,content,uid,looknum,renum,finished,updtime,date_format(createtime,'%Y-%c-%d')as createtime from question where qid = ?";
            sqlreply = "select rpid,qid,content,uid,nicheng,date_format(createtime,'%Y-%c-%d')as createtime from Replies where qid = ?";
            params = [qid];
            console.log("qid:" + qid);
            pool = connPool();
            pool.getConnection(function (err, conn) {
                if (err) {
                    console.log("数据库detail错误：" + err.message);
                    return;
                }
                async.series({
                    one: function (callback) {
                        conn.query(sqlupd, params, function (err, rs) {
                            callback(null, rs);
                        });
                    },
                    two: function (callback) {
                        conn.query(sqldetail, params, function (err, rs) {
                            callback(null, rs);
                        });
                    },
                    three:function (callback) {
                        conn.query(sqlreply, params, function (err, rs) {
                            callback(null, rs);
                        });
                    }
                }, function (err, results) {
                    rs = results["two"];
                    rsReply = results["three"];
                    console.log(rs);
                    res.render("queDetail", {rs: rs,rsReply:rsReply});
                })
                conn.release();
            });
        } else {
            res.send("没有qid数据！");
        }
    },
    reply: function (req, res) {
        loginbean = req.session.loginbean;
        pool = connPool();
        sql1 = "insert into Replies (qid,content,uid,nicheng) value (?,?,?,?)";
        param1 = [req.body['qid'], req.body['content'], loginbean.uid, loginbean.name];
        sql2 = "update question set renum = renum+1 where qid = ?";
        param2 = [req.body["qid"]];
        pool.getConnection(function (err, conn) {
            if (err) {
                console.log("reply错了" + err.message);
                return;
            }
            conn.beginTransaction(function (err) {
                if (err) {
                    console.log("REPLY错了" + err.message);
                }
                async.series({
                    one: function (callback) {
                        conn.query(sql1, param1, function (err, rs) {
                            if (err) {
                                console.log("错误"+err.message);
                                callback(err,1);
                                return;
                            }
                            callback(err,rs);
                        });
                    },
                    two: function (callback) {
                        conn.query(sql2, param2, function (err, rs) {
                            if (err) {
                                console.log("错误"+err.message);
                                callback(err,2);
                                return;
                            }
                            callback(err,rs);
                        });
                    }
                }, function (err, results) {
                    if(err){
                        console.log("回滚1");
                        conn.rollback(function () {
                            
                        });
                    }
                    conn.commit(function (err) {
                        if(err){
                            console.log("回滚2");
                            conn.rollback(function () {

                            });
                            console.log("提交事务出错");
                        }
                        console.log("提交成功！");
                        res.redirect(req.body["targeturl"]);
                    });
                });
            });
            conn.release();
        });
    }
};














