function loginSessionCheck(req, callback){
    sess = req.session;
    if(sess.isLogin){
        callback(true);
    }else{
        callback(false);
    }
}
function setLoginSession(req, account){
    sess = req.session;
    sess.isLogin = true;
    sess.account = account;
}

function distLoginSession(req){
    if(req.session.isLogin){
        req.session.destroy(function(err){
            if(err)
                console.log(err);
        });
    }
}
module.exports = {
    loginSessionCheck,
    setLoginSession,
    distLoginSession
}