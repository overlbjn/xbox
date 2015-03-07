var crypto = require('crypto');
var config = require('cloud/config/weixin.js');
var debug = require('debug')('AV:weixin');
var User = AV.Object.extend('_User');
var WechatAPI = require('wechat-api');
var fs = require('fs')

var wechatapi = new WechatAPI('wx966a571968e8cdee', '05de0873c601d0025f8042e28c250a3c', function (callback) {
  // 传入一个获取全局token的方法
  console.log('wetoken');
  console.log('token：'+wechatapi.getLatestToken());
  fs.readFile('access_token.txt', 'utf8', function (err, txt) {
    if (err) {return callback(err);}
    callback(null, JSON.parse(txt));
  });
}, function (token, callback) {
  // 请将token存储到全局，跨进程、跨机器级别的全局，比如写到数据库、redis等
  // 这样才能在cluster模式及多机情况下使用，以下为写入到文件的示例
  fs.writeFile('access_token.txt', JSON.stringify(token), callback);
});

exports.exec = function(params, cb) {
	console.log('req:'+params.xml);
  if (params.signature) {
  	//服务器验证
    checkSignature(params.signature, params.timestamp, params.nonce, params.echostr, cb);
    
  } else if(params.xml.MsgId) {
  	
  	console.log('msg:'+params.xml.MsgId);
  	//消息处理
    receiveMessage(params, cb);
    
  } else if(params.xml.Event){
  	//事件处理
  	console.log('event:'+params.xml.Event);
  	//订阅
  	if(params.xml.Event=='subscribe'){
  		//注册
  		console.log('注册：'+params.xml.FromUserName);
  		console.log('token：'+wechatapi.getLatestToken());
  		/*
  		var username = params.xml.FromUserName.toSource();
    	var password = params.xml.FromUserName.toSource();
    	if (username && password) {
        	var user = new AV.User();
        	user.set('username', username);
        	user.set('password', password);
        	user.signUp(null).then(function (user) {
            	
        	}, function (error) {
            	renderInfo(res, util.inspect(error));
        	});
    } else {
        mutil.renderError(res, '不能为空');
    }*/
  	}
  	
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
var receiveMessage = function(msg, cb) {
  var result = {
    xml: {
      ToUserName: msg.xml.FromUserName[0],
      FromUserName: '' + msg.xml.ToUserName + '',
      CreateTime: new Date().getTime(),
      MsgType: 'text',
      Content: '你好，你发的内容是「' + msg.xml.Content + '」。'
    }
  }
  cb(null, result);
}

//获取用户资料
