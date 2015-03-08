var express = require('express');
var xml2js = require('xml2js');
var utils = require('express/node_modules/connect/lib/utils');
var weixin = require('cloud/weixin.js');


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



// 使用 Express 路由 API 服务 /hello 的 HTTP GET 请求
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
   			"type":"view",
   			"name":"show",
   			"url":"http://www.baidu.com"
   		},
   		{
   			"type":"view",
   			"name":"link",
   			"url":"http://www.baidu.com"
   		}
   		]
		}
	var API = require('wechat-api');
	var api = new API('wx966a571968e8cdee', '05de0873c601d0025f8042e28c250a3c');
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

app.post('/weixin', function(req, res) {
  weixin.exec(req.body, function(err, data) {
    if (err) {
      return res.send(err.code || 500, err.message);
    }
    var builder = new xml2js.Builder();
    var xml = builder.buildObject(data);
    console.log('res:', data)
    res.set('Content-Type', 'text/xml');
    return res.send(xml);
  });
})

// 最后，必须有这行代码来使 express 响应 HTTP 请求
app.listen();
