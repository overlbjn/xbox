var express = require('express');
var xml2js = require('xml2js');
var utils = require('express/node_modules/connect/lib/utils');
var weixin = require('cloud/weixin.js');
var js2xmlparser = require("js2xmlparser");
var config = require('cloud/config/weixin.js');
var OAuth = require('wechat-oauth');
var client = new OAuth(config.appid, config.appsecret);
var API = require('wechat-api');
var api = new API(config.appid, config.appsecret);
var avosExpressCookieSession = require('avos-express-cookie-session');



// 解析微信的 xml 数据
var xmlBodyParser = function (req, res, next) {
  if (req._body) return next();
  req.body = req.body || {};

  // ignore GET
  if ('GET' == req.method || 'HEAD' == req.method) return next();

  // check Content-Type
  if ('text/xml' != utils.mime(req)) return next();

  // flag as parsed
  req._body = true;

  // parse
  var buf = '';
  req.setEncoding('utf8');
  req.on('data', function(chunk){ buf += chunk });
  req.on('end', function(){  
    xml2js.parseString(buf, function(err, json) {
      if (err) {
          err.status = 400;
          next(err);
      } else {
          req.body = json;
          next();
      }
    });
  });
};

app = express();

// App 全局配置
app.set('views','cloud/views');   // 设置模板目录
app.set('view engine', 'ejs');    // 设置 template 引擎
app.use(express.bodyParser());    // 读取请求 body 的中间件
app.use(xmlBodyParser);
app.use(express.cookieParser('xbox')); //启用 cookie
app.use(avosExpressCookieSession({cookie: { maxAge: 3600000 } ,fetchUser: true})); //使用 avos-express-cookie-session 记录登录信息到 cookie。



// 使用 Express 路由 API 服务 /hello 的 HTTP GET 请求
app.get('/hello', function(req, res) {
	app.render('hello', { message: 'Congrats, you just set up your app!' },function(error,html){
		if (error) {
			console('getHello_error'+error);
		}
		return res.send('123123');
	});
	
})

app.get('/url', function(req, res) {
	
	var url = client.getAuthorizeURL('http://xbox.avosapps.com/me', 'STATE', 'snsapi_base');
	console.log("url:"+url);
})


//更新menu
app.get('/menu', function(req, res) {
	var menu = {
		"button":[
		{
			"type":"view",
			"name":"ask",
			"url":"http://www.baidu.com"
		},
   		{
   			"type":"click",
   			"name":"show",
   			"key":"SHOWINFORMATION"
   		},
   		{
   			"type":"view",
   			"name":"me",
   			"url":"https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx966a571968e8cdee&redirect_uri=http%3A%2F%2Fxbox.avosapps.com%2Fme&response_type=code&scope=snsapi_base&state=STATE#wechat_redirect"
   		}
   		]
		}
	api.createMenu(menu,function(error,result){
		console.log('creatmenu_error:',error+'result:'+result.errmsg);
	});
});

app.get('/weixin', function(req, res) {
  console.log('1weixin req:', req.query);
  weixin.exec(req.query, function(err, data) {
    if (err) {
      return res.send(err.code || 500, err.message);
    }
    return res.send(data);
  });
})

app.get('/me', function(req, res) {
  console.log('2getMe_req:', req.query.code);
  client.getAccessToken(req.query.code, function (err, result) {
  	if (err) {
  		console.log("getAccessTokenerror:"+err);
  	} else{
  		var accessToken = result.data.access_token;
  		var openid = result.data.openid;
  		AV.User.logIn(openid, openid, {
  			success: function(user) {
  				
  				var userinfo = {
  					email:user.get('email'),
  					sex:user.get('sex'),
  					nickname:user.get('nickname'),
  					city:user.get('city'),
  					headimgurl:user.get('headimgurl'),
  					language:user.get('language'),
  					province:user.get('province'),
  					country:user.get('country'),
  					unionid:user.get('unionid'),
  					age:user.get('age'),
  					QQ:user.get('QQ'),
  					MOMO:user.get('MOMO'),
  					weibo:user.get('weibo'),
  					IDnumber:user.get('IDnumber'),
  					createat:user.get('createat'),
  					userid:openid
  				}
  				console.log("getusersuccess:"+userinfo.nickname);
  				res.render('me',userinfo);
  			},
  			error: function(user, averr) {
  				console.log("getusererror:"+averr);
  			}
  		});
  	}
  });
})

function sleep(milliSeconds) { 
    var startTime = new Date().getTime(); 
    while (new Date().getTime() < startTime + milliSeconds);
};


function userinfoinit(user,openid){
	var userinfo = {
		email:user.get('email'),
		sex:user.get('sex'),
		nickname:user.get('nickname'),
		city:user.get('city'),
		headimgurl:user.get('headimgurl'),
		language:user.get('language'),
		province:user.get('province'),
		country:user.get('country'),
		unionid:user.get('unionid'),
		age:user.get('age'),
		QQ:user.get('QQ'),
		MOMO:user.get('MOMO'),
		weibo:user.get('weibo'),
		IDnumber:user.get('IDnumber'),
		createat:user.get('createat'),
		userid:openid
	}
	return userinfo;
}

function requiredAuthentication(req, res, next) {
//	var xml = js2xmlparser('xml',req);
//  console.log('renrenren:', req.AV.user);
//  next();
    if (req.AV.user) {
    	console.log("pass！！！！");
        next();
    } else {
    	console.log("不过 重新登录");
        var openid = "ouCvVs_M1ghMQUWLRDzI7FGKsnVE";
//		console.log("认证："+req.body.userid);
//      var openid = req.body.userid;
    	AV.User.logIn(openid, openid, {
    		success: function(user) {
    			console.log("不过 重登了");
    			next();
    		},
    		error: function(user, averr) {
				console.log("getusererror:"+averr.message);
//				req.session.error = 'Access denied!';
			}
    	});
    }
}

//app.get('/user', requiredAuthentication)
app.get('/user',requiredAuthentication, function(req, res) {
	//ouCvVs4z85LHY7GLQidA_ILJdpKc ouCvVs164UvFVU61LcA5KbHwaVBM ouCvVs_M1ghMQUWLRDzI7FGKsnVE
	console.log("回调完成");	
	if (req.AV.user) {
		console.log('欢迎回来'+req.AV.user.get("nickname"));
//		 AV.User.logOut();
//  	user = AV.User.current();
    	res.render('user',userinfoinit(AV.User.current()));
     	
    } else {
    	console.log('bug！！！！！！！');
    	
    }	
})

app.post('/weixin', function(req, res) {
  weixin.exec(req.body, function(err, data) {
    if (err) {
      return res.send(err.code || 500, err.message);
    }
    var xml = js2xmlparser('xml',data);
    	console.log('res:', xml)
    	res.set('Content-Type', 'text/xml');
    	return res.send(xml);
    
  });
})

app.post('/update',requiredAuthentication, function(req, res) {
//	var xml = js2xmlparser('xml',req.body);
	var user;
	if (req.AV.user) {
		
    	user = AV.User.current();
     	console.log('欢迎回来'+user.get("nickname"));
     	for (var vk in req.body) {
     		if (vk!="userid") {
     			user.set(vk, req.body[vk]);
     		}
     	}
     	user.save(null,{
     		success:function(user){
     			return res.send("用户资料保存成功");
     		},
     		error:function(user,erro){
     			console.log('用户资料保存失败'+erro);
     			return res.send('用户资料保存失败'+erro.message);
     		}
     	});
	} else {
		var openid = req.body.userid;
		AV.User.logIn(openid, openid, {
			success: function(cuser) {
				user = cuser;
    			console.log('用户登陆成功');
    			for (var vk in req.body) {
    				if (vk!="userid") {
    					user.set(vk, req.body[vk]);
    				}
    			}
    			user.save(null,{
    				success:function(user){
    					return res.send("用户资料保存成功");
    				},
    				error:function(user,erro){
    					console.log('用户资料保存失败'+erro);
    					return res.send('用户资料保存失败'+erro.message);
    				}
    			});
			},
			error: function(cuser, averr) {
				console.log("getuser error:"+averr);
			}
		});
	}	
})

app.post('/show', function(req, res) {
	
	if (req.AV.user) {
		var showinfo = AV.Object.new('ShowInfo');
		showinfo.set('fuser',AV.User.current());
		showinfo.set('list',JSON.stringify(req.body));
		showinfo.save(null,{
			success:function(showinfo){
				return res.send("生成成功："+showinfo.id);
			},error:function(showinfo,error){
				return res.send("生成失败"+error);
			}
		});
	}else{
		var userid = req.body.userid;
		AV.User.logIn(userid, userid, {
			success: function(user) {
				console.log('用户登陆成功');
				var showinfo = AV.Object.new('ShowInfo');
				showinfo.set('fuser',AV.User.current());
				showinfo.set('list',JSON.stringify(req.body));
				showinfo.save(null,{
					success:function(showinfo){
						return res.send("生成成功："+showinfo.id);
					},error:function(showinfo,error){
						return res.send("生成失败"+error);
					}
				});
			},
			error: function(user, errorr) {
				console.log('用户登陆失败'+errorr);
				return res.send("用户登陆失败"+errorr);
			}
		});
	}
	var xml = js2xmlparser('xml',req.body);
    console.log('res:', xml)

	
})

//语言输出
var languageout = function(x){
	var language = x.toString();
	if (language=='zh_CN') {
		return '简体中文';
	}else{
		return '未知';
	}
}
//性别输出
var sexout = function(x){
	var sex = x.toString();
	if (sex=='1') {
		return '男';
	} else if(sex=='2'){
		return '女';
	}else{
		return '未知';
	}
}

// 最后，必须有这行代码来使 express 响应 HTTP 请求
app.listen();
