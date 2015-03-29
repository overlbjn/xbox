文本消息
 <xml>
 <ToUserName><![CDATA[toUser]]></ToUserName>
 <FromUserName><![CDATA[fromUser]]></FromUserName> 
 <CreateTime>1348831860</CreateTime>
 <MsgType><![CDATA[text]]></MsgType>
 <Content><![CDATA[this is a test]]></Content>
 <MsgId>1234567890123456</MsgId>
 </xml>

关注
<xml>
<ToUserName><![CDATA[toUser]]></ToUserName>
<FromUserName><![CDATA[FromUser]]></FromUserName>
<CreateTime>123456789</CreateTime>
<MsgType><![CDATA[event]]></MsgType>
<Event><![CDATA[subscribe]]></Event>
</xml>

服务器验证
signature: 'c76a4f533ab705e2be7c6a31fb69136ee64892ce',
  echostr: '7917466539500944991',
  timestamp: '1425717849',
  nonce: '1985720795' }
  



订阅 event:subscribe
取消订阅  event:unsubscribe

bug:
request uncaughtException: Can't set headers after they are sent. Error: Can't set headers after they are sent.
    at ServerResponse.OutgoingMessage.setHeader (http.js:689:11)
    at ServerResponse.res.setHeader (/mnt/avos/cloud-code/node_modules/express/node_modules/connect/lib/patch.js:59:22)
    at ServerResponse.res.set.res.header (/mnt/avos/cloud-code/node_modules/express/lib/response.js:522:10)
    at cloud_sandbox:[production] cloud/app.js:109:9
    at cloud_sandbox:[production] cloud/weixin.js:53:12
    at retryHandle (/mnt/avos/data/uluru-cloud-code/repos/tww2caz3acq9idq079ltz5ys5ra57g9tekoxcw3udlj8l6ww/node_modules/wechat-api/lib/api_common.js:204:11)
    at /mnt/avos/data/uluru-cloud-code/repos/tww2caz3acq9idq079ltz5ys5ra57g9tekoxcw3udlj8l6ww/node_modules/wechat-api/lib/util.js:18:5
    at done (/mnt/avos/data/uluru-cloud-code/repos/tww2caz3acq9idq079ltz5ys5ra57g9tekoxcw3udlj8l6ww/node_modules/wechat-api/node_modules/urllib/lib/urllib.js:346:5)
    at /mnt/avos/data/uluru-cloud-code/repos/tww2caz3
    
    
    js: {"debug":true,"appId":"wx966a571968e8cdee","timestamp":"1427654176","nonceStr":"wuflbmmsfefxn7b","signature":"19ad75d4f7b637094e5753d437186996f3d89402","jsApiList":["onMenuShareTimeline","onMenuShareAppMessage"]}
    js: {"debug":true,"appId":"wx966a571968e8cdee","timestamp":"1427653811","nonceStr":"xakp1bh0ai7ctyb","signature":"4bbd21839ee5b70e4e3ca30b1fecdf762bf7199a","jsApiList":["onMenuShareTimeline","onMenuShareAppMessage"]}
    
 datahaiziama :{"list":"{\"nickname\":\"nickname\",\"age\":\"age\",\"country\":\"country\",\"IDnumber\":\"IDnumber\",\"QQ\":\"QQ\",\"weibo\":\"weibo\",\"MOMO\":\"MOMO\",\"userid\":\"ouCvVs_M1ghMQUWLRDzI7FGKsnVE\"}",
 				"fuser":{"__type":"Pointer","className":"_User","objectId":"54fc2d46e4b029ce2b2ba8d0"},
 				"objectId":"5507ec92e4b0c9cd54f06cf5",
 				"createdAt":"2015-03-17T08:57:54.205Z",
 				"updatedAt":"2015-03-17T08:57:54.205Z"}
 
 
 官方：{
 	"jsapi_ticket":{"ticket":"sM4AOVdWfPE4DxkXGEs8VDAVRvGlm7OMI8RztdoCP-XgrhqmN34hVOGTCIRx66RuA1Bl3BMEdXStqjgTmE8Wsw","expireTime":1427662211896},
	"nonceStr":"fk0s24vd9jh8h0k",
	"timestamp":"1427655021",
	"url":"http://xobx.avosapps.com/me",
	"signature":"b688b1b024d5c6a4e2f9da6c19948cadab8761b8"}
 
 
 