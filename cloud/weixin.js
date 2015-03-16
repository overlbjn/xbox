var crypto = require('crypto');
var config = require('cloud/config/weixin.js');
var debug = require('debug')('AV:weixin');
var User = AV.Object.extend('_User');

var API = require('wechat-api');
var api = new API(config.appid, config.appsecret);

exports.exec = function(params, cb) {
	console.log('exec_req:'+params.xml.CreateTime);
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
  		if (params.xml.EventKey=='SHOWINFORMATION') {
  			console.log('开始登录...');
  			var username = params.xml.FromUserName.toString();
  			var password = params.xml.FromUserName.toString();
  			AV.User.logIn(username,password, {
  				success: function(user) {
  					console.log('登录成功！');
  					var msgtext = '姓名：'+user.get('nickname')+'\n性别：'+sexout(user.get('sex'))+'\n国家：'+user.get('country')+'\n省份：'+user.get('province')+'\n城市：'+user.get('city')+'\n语言：'+languageout(user.get('language'))+'\n头像：'+user.get('headimgurl');
  					receiveMessage(params,msgtext,cb);	
  				},error: function(user, err) {
  					console.log('登录失败！');
  					cb(err);
  				}
  			});
  		}else if (params.xml.EventKey=='LINKUANDME') {
  			console.log('click = ',params.xml.EventKey);
  			var result = {
  				action: 'view',
  				id: 'test'
  			}
  			cb(null, result);
  			
  		}
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
