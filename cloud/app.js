var express = require('express');
var xml2js = require('xml2js');
var utils = require('express/node_modules/connect/lib/utils');
var weixin = require('cloud/weixin.js');
var js2xmlparser = require("js2xmlparser");
var config = require('cloud/config/weixin.js');
var https = require("https");
var http = require("http");
var API = require('wechat-api');
var api = new API(config.appid, config.appsecret);
var avosExpressCookieSession = require('avos-express-cookie-session');
var OAuth = require('wechat-oauth');
var client = new OAuth(config.appid, config.appsecret);
var jsSHA = require("jssha");


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


//本地登录检测
function requiredAuthentication(req, res, next) {
//	var xml = js2xmlparser('xml',req.body);
//	console.log("requiredAuthentication:"+xml);
    if (req.AV.user) {
    	console.log("pass！！！！");
        next();
    } else {
    	console.log("不过 重新登录");
    	if(req.body.userid){
    		var openid = req.body.userid;
    		console.log("登录验证："+openid);
    	}else{
    		var openid = "ouCvVs_M1ghMQUWLRDzI7FGKsnVE";
    	}
//      var openid = req.body.userid;
    	AV.User.logIn(openid, openid, {
    		success: function(user) {
    			console.log("pass~");
    			next();
    		},
    		error: function(user, averr) {
  				console.log("getusererror:"+averr);
//				req.session.error = 'Access denied!';
  			}
    	});
    }
}

//微信登录检测
function wxAuthentication(req, res, next) {
//	var xml = js2xmlparser('xml',req.body);
//	console.log("requiredAuthentication:"+xml);
    if (req.AV.user) {
    	console.log("老用户 pass！！！！");
        next();
    }else if(req.query.code){
    	console.log("code:"+req.query.code);
    	https.get('https://api.weixin.qq.com/sns/oauth2/access_token?appid='+config.appid+'&secret='+config.appsecret+'&code='+req.query.code+'&grant_type=authorization_code', function(res){
			var str = '';
			res.on('data', function (chunk) {
				str += chunk;
			});
			res.on('end', function () {
				console.log("error:",JSON.parse(str).errcode);
				if (JSON.parse(str).errcode) {
					console.log("error:"+JSON.parse(str).errcode);
				} else{
					console.log("openid = "+JSON.parse(str).openid);
	    			var openid = JSON.parse(str).openid;
					AV.User.logIn(openid, openid, {
						success: function(user) {
							console.log("新登录用户 to cards:");
							next();
						},
						error: function(user, averr) {
							console.log("getusererror:"+JSON.stringify(averr));
						}
					});
				}

			});	
    	});
    }else {
    	console.log("不过 重新登录:"+req.url);
    	res.redirect('https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx966a571968e8cdee&redirect_uri=http%3A%2F%2Fxbox.avosapps.com'+req.url+'&response_type=code&scope=snsapi_base&state=STATE#wechat_redirect');
    }
}

//睡眠
function sleep(milliSeconds) { 
    var startTime = new Date().getTime(); 
    while (new Date().getTime() < startTime + milliSeconds);
 };


//用户数据初始化
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

// noncestr
     var createNonceStr = function() {
          return Math.random().toString(36).substr(2, 15);
     };

      // timestamp
     var createTimeStamp = function () {
          return parseInt(new Date().getTime() / 1000) + '';
     };

// 计算签名方法
     var calcSignature = function (ticket, noncestr, ts, url) {
          var str = 'jsapi_ticket=' + ticket + '&noncestr=' + noncestr + '&timestamp='+ ts +'&url=' + url;
          shaObj = new jsSHA(str, 'TEXT');
          return shaObj.getHash('SHA-1', 'HEX');
     }

// 使用 Express 路由 API 服务 /hello 的 HTTP GET 请求
app.get('/hello', function(req, res) {
	app.render('hello', { message: 'Congrats, you just set up your app!' },function(error,html){
		if (error) {
			console('getHello_error'+error);
		}
		return res.send('123123');
	});
	
})





//更新menu
app.get('/menu', function(req, res) {
	var menu = {
		"button":[
		{
			"type": "scancode_push",
			"name": "扫码",
            "key": "GETSHOWINFOFROMID",
		},
   		{
   			"type":"view",
   			"name":"Mycards",
   			"url":"http://xbox.avosapps.com/cards"
   		},
   		{
   			"type":"view",
   			"name":"Me",
   			"url":"http://xbox.avosapps.com/me"
   		}
   		]
		}
	api.createMenu(menu,function(error,result){
		console.log('creatmenu_error:',error+'result:'+result.errmsg);
	});
});

//app.get('/weixin', function(req, res) {
//	console.log('1weixin req:', req.query);
//	weixin.exec(req.query, function(err, data) {
//		if (err) {
//			return res.send(err.code || 500, err.message);
//		}
//		return res.send(data);
//	});
//})

app.get('/huodong', requiredAuthentication, function(req, res) {
	
	if (AV.User.current()) {
			res.render('huodong');
	}else{
		console.log("异常！！！！");
	}
})


app.get('/cards', wxAuthentication, function(req, res) {
	
	var nostr = createNonceStr();
	var timstr = createTimeStamp();
	var urlstr = 'http://xbox.avosapps.com'+req.url;
	console.log("urlstr："+urlstr);
	if (AV.User.current()) {
			var user =AV.User.current();
			var userinfo = userinfoinit(user);
			console.log("缓存用户TOme:");
			api.getTicket(function(error,ticket){
				
				if (error) {
					console.log("getticket error:"+error);
				} else{
					var signature = calcSignature(ticket.ticket, nostr, timstr, urlstr);
					userinfo["appId"]=config.appid;
					userinfo["timestamp"]=timstr;
					userinfo["nonceStr"]=nostr;
					userinfo["signature"]=signature;
					userinfo["url"]=urlstr;
					userinfo["ticket"]=ticket.ticket;
					res.render('cards',userinfo);
				}	
			});
	}else{
		console.log("异常！！！！");
	}
	
})

app.get('/me', wxAuthentication, function(req, res) {
	console.log("调试me url :"+req.url);
	var nostr = createNonceStr();
	var timstr = createTimeStamp();
	var urlstr = 'http://xbox.avosapps.com'+req.url;
	console.log("urlstr："+urlstr);
	if (AV.User.current()) {
			var user =AV.User.current();
			var userinfo = userinfoinit(user);
			console.log("缓存用户TOme:");
			api.getTicket(function(error,ticket){
				
				if (error) {
					console.log("getticket error:"+error);
					
				} else{

					var signature = calcSignature(ticket.ticket, nostr, timstr, urlstr);
					userinfo["appId"]=config.appid;
					userinfo["timestamp"]=timstr;
					userinfo["nonceStr"]=nostr;
					userinfo["signature"]=signature;
					userinfo["url"]=urlstr;
					userinfo["ticket"]=ticket.ticket;
					res.render('me',userinfo);
				}	
			});
	}else{
		console.log("异常！！！！");
	}
		

})

app.get('/editinfo', requiredAuthentication, function(req, res) {
	//ouCvVs4z85LHY7GLQidA_ILJdpKc ouCvVs164UvFVU61LcA5KbHwaVBM ouCvVs_M1ghMQUWLRDzI7FGKsnVE
		
	if (AV.User.current()) {
		console.log('欢迎回来'+AV.User.current().get("nickname"));
		api.getTicket(function(err,ticket){
			if(err){
				console.log("guan error:"+err);
			}else{
				var urlstr = 'http://xbox.avosapps.com/me?code='+req.query.code+'&state=STATE';
				var userinfo = userinfoinit(AV.User.current());
				var nostr = createNonceStr();
				var timstr = createTimeStamp();
				var signature = calcSignature(ticket.ticket, nostr, timstr, 'http://192.168.199.229:3000/user');
				userinfo["appId"]=config.appid;
				userinfo["timestamp"]=timstr;
				userinfo["nonceStr"]=nostr;
				userinfo["signature"]=signature;
				userinfo["url"]=urlstr;
				userinfo["ticket"]=ticket.ticket;
				res.render('editinfo',userinfo);
			}
		});

	} else {
    	console.log('数据异常！');
    }	
})

app.get('/makecard', requiredAuthentication, function(req, res) {
	//ouCvVs4z85LHY7GLQidA_ILJdpKc ouCvVs164UvFVU61LcA5KbHwaVBM ouCvVs_M1ghMQUWLRDzI7FGKsnVE
		
	if (AV.User.current()) {
		console.log('欢迎回来'+AV.User.current().get("nickname"));
		api.getTicket(function(err,ticket){
			if(err){
				console.log("guan error:"+err);
			}else{
				var urlstr = 'http://xbox.avosapps.com/me?code='+req.query.code+'&state=STATE';
				var userinfo = userinfoinit(AV.User.current());
				var nostr = createNonceStr();
				var timstr = createTimeStamp();
				var signature = calcSignature(ticket.ticket, nostr, timstr, 'http://192.168.199.229:3000/user');
				userinfo["appId"]=config.appid;
				userinfo["timestamp"]=timstr;
				userinfo["nonceStr"]=nostr;
				userinfo["signature"]=signature;
				userinfo["url"]=urlstr;
				userinfo["ticket"]=ticket.ticket;
				res.render('makecard',userinfo);
			}
		});

	} else {
    	console.log('数据异常！');
    }	
})
	

app.get('/user', requiredAuthentication, function(req, res) {
	//ouCvVs4z85LHY7GLQidA_ILJdpKc ouCvVs164UvFVU61LcA5KbHwaVBM ouCvVs_M1ghMQUWLRDzI7FGKsnVE
		
	if (AV.User.current()) {
		console.log('欢迎回来'+AV.User.current().get("nickname"));
		api.getTicket(function(err,ticket){
			if(err){
				console.log("guan error:"+err);
			}else{
				var urlstr = 'http://xbox.avosapps.com/me?code='+req.query.code+'&state=STATE';
				var userinfo = userinfoinit(AV.User.current());
				var nostr = createNonceStr();
				var timstr = createTimeStamp();
				var signature = calcSignature(ticket.ticket, nostr, timstr, 'http://192.168.199.229:3000/user');
				userinfo["appId"]=config.appid;
				userinfo["timestamp"]=timstr;
				userinfo["nonceStr"]=nostr;
				userinfo["signature"]=signature;
				userinfo["url"]=urlstr;
				userinfo["ticket"]=ticket.ticket;
				res.render('user',userinfo);
			}
		});

	} else {
    	console.log('数据异常！');
    }	
})


app.post('/weixin', function(req, res) {
  weixin.exec(req.body, function(err, data) {
    if (err) {
      return res.send(err.code || 500, err.message);
    }
    if(!data){
    	data = {success:'success'};
    }
    var xml = js2xmlparser('xml',data);
    console.log('res:', xml)
    res.set('Content-Type', 'text/xml');
    return res.send(xml);
    
  });
})

app.post('/getmycards',wxAuthentication, function(req, res) {
	if (AV.User.current()) {
		var user = AV.User.current();
		var query = new AV.Query('GetInfo');
		query.include("info");
		query.equalTo("guser", AV.User.current());
		query.find({
			success: function(infos) {
				console.log("查询成功："+infos.length);
				var arr = new Array();
				for (var i=0;i<infos.length;i++) {
//					console.log("遍历："+JSON.stringify(infos[i].get('info')));
					arr[i] = infos[i].get('info');
				}
				return res.send(arr);
			}
		});
     	
    } else {
    	console.log('数据异常！');
    }
})


app.post('/update', wxAuthentication, function(req, res) {
	
	if (AV.User.current()) {
		var user = AV.User.current();
		console.log('欢迎回来'+AV.User.current().get("nickname"));
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
    	console.log('数据异常！');
    }
})

app.post('/show', wxAuthentication, function(req, res) {
	
	if (AV.User.current()) {
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
		console.log('数据异常！');
	}	
})

app.post('/getmycardlist', wxAuthentication, function(req, res) {
	console.log("关系开始查询");
	if (AV.User.current()) {
		var query = new AV.Query('ShowInfo');
		query.equalTo("fuser", AV.User.current());
		query.find({
			success: function(fusers) {
				return res.send(fusers);
			}
		});
	}else{
		console.log('数据异常！');
	}
})

app.post('/getmycardinfo', wxAuthentication, function(req, res) {
//	console.log("关系card查询 ："+req.body.fuser.objectId);
	if (AV.User.current()) {
//		console.log("id:"+JSON.parse(req.body.list).nickname);
		var query = new AV.Query(AV.User);
		query.get(req.body.fuser.objectId,{
			success:function(result){
				console.log("找到用户:"+result.id);
				var data={};
				var reqdata = JSON.parse(req.body.list);
				for(var vk in reqdata){
						if (vk == "userid") continue;
						data[vk]=result.get(vk);
					}
//				console.log("done: "+JSON.stringify(data));
				return res.send(data);
			},error:function(result,err){
				
			}
		})
		
	}else{
		console.log('数据异常！');
	}
})

app.post('/sharethiscard', wxAuthentication, function(req, res) {
//	console.log("aha:"+JSON.stringify(req.body));
	var query = new AV.Query('ShowInfo');
	query.get(req.body.objectId, {
		success: function(showinfo) {
			api.createTmpQRCode(1000, 1800, function(err,result){
					if (err) {
						console.log("创建二维码失败");
					} else{
						console.log("得到啦："+api.showQRCodeURL(result.ticket));
						console.log("开始改");
						showinfo.set('wxticket',result.ticket);
						showinfo.save(null, {
							success: function(showinfo) {
								return res.send(api.showQRCodeURL(result.ticket));
							},
							error: function(showinfo, error) {
								console.log("ticket保存失败");
							}
						});	
					}
				});
		},
		error: function(object, error) {
			
		}
	});
})

app.post('/pingtai', wxAuthentication, function(req, res) {
	
//	console.log("pingt:"+req.body.list);
	api.createTmpQRCode(1000, 1800, function(err,result){
					if (err) {
						console.log("创建二维码失败");
					} else{
//						console.log("得到啦："+api.showQRCodeURL(result.ticket));
						var askinfo = AV.Object.new('AskInfo');
						askinfo.set('wxticket',result.ticket);
						var query = new AV.Query('PTInfo');
						query.get(req.body.ptinfo, {
						  success: function(ptinfo) {
						    askinfo.set('ptinfo',ptinfo);
							askinfo.save(null, {
								success: function(askinfo) {
									return res.send(api.showQRCodeURL(askinfo.get('wxticket')));
								},
								error: function(askinfo, error) {
									console.log("ask 保存失败："+error.message);
								}
							});
						  },error: function(fuser, error) {
						    console.log("fuser 查询："+error.message);
						  }
						});	
					}
				});
	
	
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
