
var express = require('express');
var app = express();
var avosExpressCookieSession = require('avos-express-cookie-session');

// App 全局配置
app.set('views','cloud/views');   // 设置模板目录
app.set('view engine', 'ejs');    // 设置 template 引擎
app.use(express.bodyParser());    // 读取请求 body 的中间件

// 启用 cookieParser
app.use(express.cookieParser('Your Cookie Secure'));
// 使用 avos-express-cookie-session 记录登录信息到 cookie
app.use(avosExpressCookieSession({ cookie: { maxAge: 3600000 }, fetchUser: true}));


function requiredAuthentication(req, res, next) {
    if (req.AV.user) {
    	console.log("pass！！！！");
        next();
    } else {
    	console.log("不过 重新登录");
        var openid = "ouCvVs_M1ghMQUWLRDzI7FGKsnVE";
//      var openid = req.body.userid;
    	AV.User.logIn(openid, openid, {
    		success: function(user) {
    			console.log("pass！！！！");
    			next();
    		},
    		error: function(user, averr) {
				console.log("getusererror:"+averr);
//				req.session.error = 'Access denied!';
			}
    	});
    }
}


app.get('/user',requiredAuthentication, function(req, res) {
	if (AV.User.current()) {
    console.log("success！！！！"+AV.User.current().id);
   }else{
   	 console.log("bug！！！！");
   }
  res.send({ user: AV.User.current() });
})

// 最后，必须有这行代码来使 express 响应 HTTP 请求
app.listen();