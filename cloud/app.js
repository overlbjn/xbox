var express = require('express');
var xml2js = require('xml2js');
var weixin = require('cloud/weixin.js');
var utils = require('express/node_modules/connect/lib/utils');
var Counter = AV.Object.extend("Counter");

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

var app = express();

// App 全局配置
app.set('views','cloud/views');   // 设置模板目录
app.set('view engine', 'ejs');    // 设置 template 引擎
app.use(express.bodyParser());    // 读取请求 body 的中间件
app.use(xmlBodyParser);

// 使用 Express 路由 API 服务 /hello 的 HTTP GET 请求
app.get('/hello', function(req, res) {
  res.render('hello', { message: 'Congrats, you just set up your app!' });
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
  console.log('2weixin req:', req.body);
  var counter = new Counter();
  counter.set("name","asda");
  counter.save(null,{
  	success:function(counter){
  		alert('success!');
  	},
  	error:function(sounter){
  		alert('error');
  	}});
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

app.get('/av',function(req,res){
	// 创建AV.Object子类.
// 该语句应该只声明一次
var GameScore = AV.Object.extend("GameScore");

// 创建该类的一个实例
var gameScore = new GameScore();

// 你可以用Backbone的语法.
var Achievement = AV.Object.extend({
  className: "Achievement"
});
});

// 最后，必须有这行代码来使 express 响应 HTTP 请求
app.listen();
