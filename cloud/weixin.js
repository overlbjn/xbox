var crypto = require('crypto');
var config = require('cloud/config/weixin.js');
var debug = require('debug')('AV:weixin');
var User = AV.Object.extend('_User');
var API = require('wechat-api');
var api = new API(config.appid, config.appsecret);



exports.exec = function(params, cb) {

  if (params.signature) {
  	//服务器验证
    checkSignature(params.signature, params.timestamp, params.nonce, params.echostr, cb);
    
  } else if(params.xml.MsgId) {
  	
  	console.log('msg:'+params.xml.MsgId);
  	//消息处理
  	var msgStr = '你好，你发的内容是「' + params.xml.Content + '」。';
    receiveMessage(params,msgStr, cb);
    
  } else if(params.xml.Event){
  	//事件处理
  	console.log('event:'+params.xml.Event);
  	
  	//订阅
  	if(params.xml.Event=='subscribe'){
  		//注册
  		console.log('注册：'+params.xml.FromUserName.toString());
  		api.getUser(params.xml.FromUserName,function(error,result){
  			console.log('getuser_error:'+error+'getuser_result:'+result.nickname);
  			if (result.nickname) {
  				var username = params.xml.FromUserName;
  				var password = params.xml.FromUserName;
  				var nickname = result.nickname;
  				if(username && password){
  					var user = new AV.User();
  					user.set('username', username.toString());
  					user.set('password', password.toString());
  					user.set('nickname', nickname.toString());
  					user.set('sex', result.sex.toString());
  					user.set('city', result.city.toString());
  					user.set('country', result.country.toString());
  					user.set('province', result.province.toString());
  					user.set('language', result.language.toString());
  					user.set('headimgurl', result.headimgurl.toString());
  					user.set('unionid', result.unionid.toString());
  					user.signUp(null,{
  						success:function(user){
  							console.log('注册成功');
  							var msgtext = '欢迎新用户'+nickname;
  							receiveMessage(params,msgtext,cb);
  						},
  						error:function(user,error){
  							console.log('user error:'+error.code+error.message);
  							if (error.code==202) {
  								var msgtext = nickname+' 欢迎回来!';
  								receiveMessage(params,msgtext,cb);
  							}
  						}
  					})
  				}
  			}
  		})
  	}else if(params.xml.Event=='unsubscribe'){
  		cb(null,'');
  	}else if (params.xml.Event=='CLICK') {
  		console.log('click = ',params.xml.EventKey);
  		var result = {
  			success: 'success'
  		}
  		cb(null,result);
  	}else if (params.xml.Event=='scancode_push') {
  		var msgtext = params.xml;
  		console.log("scancode_push:"+params.xml.Ticket);
  		var result = {
  			success: 'success'
  		}
  		cb(null,result);
  	}else if (params.xml.Event=='SCAN') {

  		console.log("1 SCAN:"+params.xml.Ticket);
  		console.log("1 SCAN:"+params.xml.FromUserName);
  		var query = new AV.Query('ShowInfo');
		query.equalTo("wxticket", params.xml.Ticket.toString());
		query.first({
			success: function(showinfo) {
				console.log("shoinfo 结果："+showinfo);
				if (showinfo) {
					console.log("showinfo找到:"+showinfo.id);
					var query = new AV.Query(AV.User);
					query.equalTo("username", params.xml.FromUserName.toString());  
					query.first({
					  success: function(fuser) {
					  	console.log("fuser找到:"+fuser.id);
					  	var query = new AV.Query('GetInfo');
					  	query.equalTo("guser", fuser);
					  	query.equalTo("info", showinfo);
					  	query.find({
					  		success:function(getinfo){
					  			
					  			if (getinfo.length) {
					  				console.log("已经有了："+getinfo.length);
					  				var msgtext = "扫描成功,已经存在："+fuser.id+' '+showinfo.id;
								    		receiveMessage(params,msgtext,cb);
					  			} else{
					  				console.log("还没有： "+getinfo.length);
					  				var getinfo = new AV.Object("GetInfo");
								    getinfo.set('guser',fuser);
								    getinfo.set('info',showinfo);
								    getinfo.save(null,{
								    	success:function(getinfo){
								    		var msgtext = "扫描成功，点击Mycards查看吧！";
								    		receiveMessage(params,msgtext,cb);
								    	},error:function(error){
								    		var msgtext = "扫描失败："+error.message;
								    		receiveMessage(params,msgtext,cb);
								    	}
								    });
					  			}
					  		},error:function(error){
					  			var msgtext = "查询失败："+error.message;
								receiveMessage(params,msgtext,cb);
					  		}
					  	});
					  }
					});	
				} else{
					var queryPT = new AV.Query('AskInfo');
					queryPT.include("ptinfo");
					queryPT.equalTo("wxticket", params.xml.Ticket.toString());
					queryPT.first({
						success:function(askinfo){
							if (askinfo.id) {
								var query = new AV.Query(AV.User);
								query.equalTo("username", params.xml.FromUserName.toString());  
								query.first({
								  success: function(fuser) {
								  	console.log("fuser找到:"+fuser.id);
								  	var PTquery = new AV.Query('PTShowInfo');
								  	PTquery.equalTo("ptinfo", askinfo.get('ptinfo')); 
								  	PTquery.equalTo("fuser", fuser); 
								  	PTquery.find({
								  		success:function(ptshowinfos){
								  			if (ptshowinfos.length) {
								  				var msgtext = "您已成功报名，请勿重复扫描！";
								    			receiveMessage(params,msgtext,cb);
								  			} else{
								  				var ptshowinfo = new AV.Object('PTShowInfo');
								  				ptshowinfo.set('fuser',fuser);
								  				ptshowinfo.set('ptinfo',askinfo.get('ptinfo'));
								  				ptshowinfo.save(null,{
								  					success:function(ptshowinfo){
								  						var ptgetinfo = new AV.Object('PTGetInfo');
								  						ptgetinfo.set('guser',askinfo.get('ptinfo').get('fuser'));
								  						ptgetinfo.set('ptshowinfo',ptshowinfo);
								  						ptgetinfo.save(null,{
								  							success:function(ptgetinfo){
								  								var msgtext = "报名成功！";
																receiveMessage(params,msgtext,cb);
								  							},error:function(error){
								  								console.log("ptgetinfo保存失败"+error.message);
								  								var msgtext = "报名失败："+error.message;
																receiveMessage(params,msgtext,cb);
								  							}
								  						});
								  					},error:function(error){
								  						console.log("ptshowinfo 保存失败："+error.message);
								  					}
								  				});
								  			}
								  		},error:function(error){
								  			console.log("ptshowinfos查询失败"+error.message);
								  		}
								  	});
								  },error:function(error){
								  	console.log("fuser 查询失败："+error.message);
								  }
								});
							}
						},error:function(error){
							var msgtext = "查询失败："+error.message;
							receiveMessage(params,msgtext,cb);
						}
					});
				}
			},error: function(error) {
				var msgtext = "扫描二维码错误:"+error.message;
				receiveMessage(params,msgtext,cb);
			}
		});
		
  	}else if (params.xml.Event=='VIEW') {
  		
  		var result = {
  			success: 'success'
  		}
  		cb(null,result);
  	}
  }
}

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

// 验证签名
var checkSignature = function(signature, timestamp, nonce, echostr, cb) {
  var oriStr = [config.token, timestamp, nonce].sort().join('')
  var code = crypto.createHash('sha1').update(oriStr).digest('hex');
  debug('code:', code)
  if (code == signature) {
    cb(null, echostr);
  } else {
    var err = new Error('Unauthorized');
    err.code = 401;
    cb(err);
  }
}

// 接收普通消息
var receiveMessage = function(msg,msgContent, cb) {
  var result = {
  	
  	ToUserName: msg.xml.FromUserName[0],
  	FromUserName: '' + msg.xml.ToUserName + '',
  	CreateTime: new Date().getTime(),
  	MsgType: 'text',
  	Content: msgContent
  
  }
  cb(null, result);
}

//获取用户资料
