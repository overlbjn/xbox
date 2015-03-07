var crypto = require('crypto');
var config = require('cloud/config/weixin.js');
var debug = require('debug')('AV:weixin');

/*1weixin req: { 
  signature: '48c90298121b9d8875623b2656f9e0175bee4d3f',
  echostr: '7674587388177211231',
  timestamp: '1425706079',
  nonce: '126867952' }*/

exports.exec = function(params, cb) {
  if (params.signature) {
    checkSignature(params.signature, params.timestamp, params.nonce, params.echostr, cb);
  } else if(params.MsgId) {
  	console.log('msg:'+params.MsgId);
    receiveMessage(params, cb);
  } else if(params.Event){
  	console.log('event:'+params.Event);
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
