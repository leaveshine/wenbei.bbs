var express = require('express');
var router = express.Router();
var userModel = require("../models/UserModel");
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});
router.all("/login",function (req,res) {
  subflag = req.body['subflag'];
  if(subflag==undefined){
    res.render("login",{});
  }else{
    userModel.login(req,res);
  }

});
router.post("/register",function (req,res) {
  userModel.register(req,res);
});

module.exports = router;
