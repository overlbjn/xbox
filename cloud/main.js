require("cloud/app.js");
// Use AV.Cloud.define to define as many cloud functions as you want.
// For example:
AV.Cloud.define("hello", function(request, response) {
  response.success("Hello wor12312312ld!");
});

AV.Cloud.run('hello', {name: 'dennis'}, {
  success: function(data){
      //调用成功，得到成功的应答data
       console.log('data'+"hello");
       console.log("hello");
   
  },
  error: function(err){
      //处理调用失败
      console.log("hello");
  }
});