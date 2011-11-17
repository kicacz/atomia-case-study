jQuery(document).ready(function($){
	
/***** GET ALL START *****/
	$('#get_all').click(function(){
		send('GET', '');
		$('#buttons').animate({height : '30px'}, 100, function(){
			$('.addin').css('display', 'none');
		});
	});
	/***** GET ALL END *****/
	
	
/***** GET ONE START *****/
	$('#get').click(function(){
		if ($('#get_div').css('display') == 'none')
		{
			$('#get_div').css('display', 'block');
			$('#buttons').animate({height : '66px'}, 100, function(){
				$('.addin').not('#get_div').css('display', 'none');
			});
		}
		else
		{
			$('#buttons').animate({height : '30px'}, 100, function(){
				$('.addin').css('display', 'none');
			});
		}
	});
	$('#get_send').click(function(){
		send('GET', { objectId : $('#get_div input[type=text]').val() } );
	});
	/***** GET ONE END *****/
	
	
/***** POST START *****/
	$('#post').click(function(){
		if ($('#post_div').css('display') == 'none')
		{
			while ($('#post_div').children().length > 8)
				$('#post_add').prev().remove();
			$('#post_div').css('display', 'block');
			$('#buttons').animate({height : '105px'}, 100, function(){
				$('.addin').not('#post_div').css('display', 'none');
			});
		}
		else
		{
			$('#buttons').animate({height : '30px'}, 100, function(){
				$('.addin').css('display', 'none');
			});
		}
	});
	$('#post_add').click(function(){
		$(this).before('<label>Parameter</label><input type="text" /><label>Value</label><input type="text" /><br/>');
		$('#buttons').animate({height : '+=36px'}, 200, function(){});
	});
	$('#post_remove').click(function(){
		if ($(this).parent().children().length > 8)
		{
			for (i=0; i<=4; i++)
				$(this).prev().prev().remove();
			$('#buttons').animate({height : '-=36px'}, 200, function(){});
		}
	});
	$('#post_send').click(function(){
		var p = "{";
		$first = $(this).parent().find('input:eq(0)');
		num = parseInt(($(this).parent().children().length-1)/5);
		for (i=0; i<num; i++)
		{
			p += "\"" + $first.val() + "\"" + ":" + "\"" + $first.next().next().val() + "\",";
			$first = $first.next().next().next().next().next();
		}	
		p = p.substring(0, p.length-1) + "}";
		kk = JSON.parse(p);
		
		send('POST', kk);
	});
	/***** POST END *****/

/***** REMOVE START *****/
	$('#remove').click(function(){
		if ($('#remove_div').css('display') == 'none')
		{
			$('#remove_div').css('display', 'block');
			$('#buttons').animate({height : '66px'}, 100, function(){
				$('.addin').not('#remove_div').css('display', 'none');
			});
		}
		else
		{
			$('#buttons').animate({height : '30px'}, 100, function(){
				$('.addin').css('display', 'none');
			});
		}
	});
	$('#remove_send').click(function(){
		send('GET', { remove : $('#remove_div input[type=text]').val() } );
	});
	/***** REMOVE END *****/

	function send(type, data)
	{
		if (type === 'POST')
		{
			req = new XMLHttpRequest();
			req.open(type, 'http://127.0.0.1:8181/', true);
			req.send(JSON.stringify( data ));
			req.onreadystatechange = function () {
				if (req.readyState != 4) return;
				if (req.status != 200 && req.status != 304) {
		//			alert('HTTP error ' + req.status);
					return;
				}
				callback(req.responseText);
			}
		}
		if (type === 'GET')
		{
			$.ajax({
				url: 'http://127.0.0.1:8181/',
				dataType: "json",
				data: "data=" + JSON.stringify( data ),
				jsonpCallback: '_test',
				type: 'GET',
				contentType: "application/json",
				cache: false,
				timeout: 5000,
				success: callback,
				error: function(jqXHR, textStatus, errorThrown) {
					alert('error ' + textStatus + " " + errorThrown);
				}
			});
		}
	}
	
	function callback(data)
	{
		$('#browser').empty();
		try
		{
			var obj = jQuery.parseJSON(data);
			
			for (i=0; i<obj.length; i++)
			{
				var pom_str = JSON.stringify(obj[i]);
				var obj_pom = '{ ' + '"object' + i + '": [' + pom_str + '] }';
				$('#browser').append(JSONTREEVIEWER.processNodes(jQuery.parseJSON(obj_pom)));
			}
			
			$('#browser').treeview({
				control: '#treecontrol',
				add: obj
			});
		}
		catch (e)
		{
		}
	}
});