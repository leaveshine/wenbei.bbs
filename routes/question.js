var express = require('express');
var router = express.Router();
var CheckSession = require("../jsBean/CheckSession");
var questionModel = require("../models/questionModel");
/* GET home page. */
router.all('/ask', function(req, res) {
    var rs = CheckSession(req,res);
    subflag = req.body['subflag'];
    if(subflag==undefined){
        if(!rs){
            res.send("<script>alert('登录过期，请重新登录');location.href='/';</script>");
            return;
        }
        res.render('ask',{loginbean:rs});
    }else {
        questionModel.ask(req,res);
    }
});
router.get("/detail",function (req,res) {
    questionModel.detail(req,res);
});
router.post("/reply",function (req,res) {
    var loginbean = CheckSession(req,res);
    if(!loginbean){return};
    subflag = req.body['subflag'];
    if(subflag!=undefined){
        questionModel.reply(req,res);
    }

});
module.exports = router;
