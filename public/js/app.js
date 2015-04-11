(function($) {

  $(function() {
  	
    $('#baoming').click(function () {
//  	alert($("#wxqcode")[0].innerHTML);
    	
//  	alert(document.getElementById("wxqcode").innerHTML);
//  	$('#wxqcode').innerHTML='<img class="am-radius" alt="200*200" src="http://www.baidu.com/img/baidu_jgylogo3.gif" width="200" height="200" />';
//		$('#doc-modal-1').modal('open');
    	var $btn = $(this);
    	$btn.button('loading');
    	var postdata = {
    		'ptinfo':'5528f45fe4b0da2c5dfe975a'
    	}
    	$.post("/pingtai", postdata, function(data){
				console.log("data:"+JSON.stringify(data));
				$('#wxqcode')[0].innerHTML='<img class="am-radius" alt="200*200" src='+JSON.stringify(data)+' width="200" height="200" />';
				$('#doc-modal-1').modal('open');
				$btn.button('reset');
    	});
    })
  });
})(jQuery);
