function check(req,res) {
    loginbean = req.session.loginbean;
    if(loginbean==undefined){
        return false;
    }
    return loginbean;
}
module.exports = check;