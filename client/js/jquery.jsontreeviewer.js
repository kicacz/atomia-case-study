/* 
 * Online JSON Tree Viewer 1.0 by jQuery4u 
 * http://www.jquery4u.com/demos/json-tree-viewer/
 *
 * Load JSON file and display values in browser content loaded via AJAX into an unordered list 
 * for display with the jQuery Tree View Plugin.
 *
 * Copyright (c) 2011 jQuery4u.com
 */
;(function($)
{
    JSONTREEVIEWER =
    {
        name: 'JQUERY4U.JSONTREEVIEWER',
		
        settings: {},
		
        init: function() { 
			var _this = this;	
		},
		
		/*Load the JSON file either by upload or example file and process tree*/
		processJSONTree: function(filename) {
			$('#loading').show();
			var data = '', branches = '';
			if (filename === 'copyandpastejson') {
				var copypastejson = $('#copyandpastejson').val();
				/*validate JSON*/
				if (JSONTREEVIEWER.isValidJSON(copypastejson)) { 
					data = copypastejson;
				} else { return false; }
				if (data === false) { return false; }
				/*Build JSON Tree*/
				JSONTREEVIEWER.buildTree(JSONTREEVIEWER.processNodes(jQuery.parseJSON(data)), filename);
			} else {
				//get the JSON file from file upload
				$.ajax({
					 type: 'GET',
					 url: filename,
					 async: false,
					 beforeSend: function(x) {
					  if(x && x.overrideMimeType) {
					   x.overrideMimeType('application/j-son;charset=UTF-8');
					  }
				 },
				 dataType: 'json',
				 success: function(data){
					/*Build JSON Tree*/
					JSONTREEVIEWER.buildTree(JSONTREEVIEWER.processNodes(data), filename);
				 },
				 error: function(e){
					/*Invalid JSON*/
					alert('Invalid JSON: ' + e.responseText);
					JSONTREEVIEWER.showErrorMsg();
					return false;
				 }
				});
			}
		},
		
		/*Build JSON Tree*/
		buildTree: function(branches, filename) {
			//console.log('branches' + branches);
			if (typeof branches !== 'undefined' || branches !== '') {
				$('#browser').empty().html(branches);
				$('#browser').treeview({
					control: '#treecontrol',
					add: branches
				});
				$('#selected_filename').html('('+filename+')');
				$('#loading').hide();
				$('#browser-text').hide();
			} else {
				$('#selected_filename').html('Please select JSON file above...');
				$('#loading').hide();
			}
		},
		
		/*Process each node by its type (branch or leaf)*/
		processNodes: function(node) {
			var return_str = '';
			switch(jQuery.type(node))
			{
			case 'string':
			  if ($('#hierarchy_chk').is(':checked')) {
				  return_str += '<ul style="display:none;"><li><span class="file">'+node+'</span></li></ul>';
			  } else {
				  return_str += '<ul style="display:none;"><li><span class="file">'+node+'</span></li></ul>';
			  }
			  break;
			case 'array':
				$.each(node, function(item,value){
					return_str += JSONTREEVIEWER.processNodes(this);
				});
			  break;
			default:
				/*object*/
				$.each(node, function(item,value){
					if ($('#hierarchy_chk').is(':checked')) {
						if (item.indexOf("object") != -1)
							return_str += '<ul><li><span class="folder">'+item+'</span>';
						else
							return_str += '<ul style="display:none;"><li><span class="folder">'+item+'</span>';
						return_str += JSONTREEVIEWER.processNodes(this);
						return_str += '</li></ul>';
					} else {
						return_str += JSONTREEVIEWER.processNodes(this);
					}
				});
			}
			/*Clean up any undefined elements*/
			return_str = return_str.replace('undefined', '');
			return return_str;
		},
		
		/*Populate the path of the node ready for copy*/
		getNodePath: function(node) {
			var pathresult = $(node).getPath();
			return  pathresult.replace('> null >', '');
		},
		
		/*Helper function to manage node paths display*/
		addtoppath: function(path) {
			$('#accumpaths').val(path);
			$('#toppathwrap').show();
			$('#accumpaths').focus();
			$('#accumpaths').select();
		},
		
		/*Helper function to check if JSON is valid*/
		isValidJSON: function(jsonData) {
			try {
				jsonData = jQuery.parseJSON(jsonData);
				//console.log('valid json');
				return true;
			}
			catch(e) {
				//console.log('invalid json');
				alert(e);
				JSONTREEVIEWER.showErrorMsg();
				return false;
			}
		},
		
		/*Helper function to show error message*/
		showErrorMsg: function() {
			$('#selected_filename').html('<span style="color:red;">Please try again. <a target="_blank" href="http://www.jsonlint.com/">Validate your JSON</a></span>');
			$('#loading').hide();
			$('#browser').empty();
		}
	}
	
	/*jQuery function to create path function used to get the path of the node in the tree*/
	jQuery.fn.extend({
		getPath: function( path ) {
			/*The first time this function is called, path won't be defined*/
			if ( typeof path == 'undefined' ) path = '';
			/*Add the element name*/
			var cur = this.get(0).nodeName.toLowerCase();
			var id  = this.attr('id');
			/*Add the #id if there is one*/
			if ( typeof id != 'undefined' ) {
				/*escape goat*/
				if (id == 'browser') { return path; }
			}
			var html = this.html();
			if (html.search('<li')) {
				/*add the variable name*/
				var val = this.find('span').first().html();
				/*Recurse up the DOM*/
				return this.parent().getPath( val + ' > ' + path );
			} else {
				return this.parent().getPath( path );
			}
		}
	});
	
	/*EVENTS ON LIVE ELEMENTS (DYNAMICALLY INSERTED DOM) ------------*/
	
	/*store nodepath value to clipboard	(copy to top of page)*/
	$('#browser li').live('click', function(){
		var path = $('#pathtonode').html();
		var pathdelim = $('#pathdelim_chk').val();
		path = path.replace(/ &gt; /g,pathdelim);
		JSONTREEVIEWER.addtoppath(path);
	});
		
	$('#browser li span').live('mouseenter', function(){
		$('#pathtonode').html(JSONTREEVIEWER.getNodePath(this));
		$('#pathtonode').show();
	});
	
	$('#browser li span').live('mouseleave', function(){
		$('#pathtonode').empty();
		$('#pathtonode').hide();
	});

	/*change event when user changes file upload input*/
	$('#loadfile').live('change', function(){
		JSONTREEVIEWER.processJSONTree($(this).val());
	});
	
	/*click event when the user closes the node path window*/
	$('#closetoppath').live('click', function() {
		$('#toppathwrap').hide();
	});
	
	/*change event when user changes file upload input*/
	$('#loadcopyandpastejson').live('click', function(){
		JSONTREEVIEWER.processJSONTree($(this).val());
	});
	
	/*reset/clear the JSON tree and fields*/
	$('#reset').live('click', function(){
		$('input[name=hierarchy_chk]').attr('checked', true);
		$('input[name=loadfile]').attr('value', "");
		$('#browser').empty();
		$('#browser-text').show();
		$('#selected_filename').empty();
		$('#loading').hide();
		$('#pathdelim_chk').attr('value','.');
		$('#toppathwrap').hide();
		$('#treecontrol').hide();
	});
	
	/*OPTIONS SLIDER / BUTTON ANIMATION -----------------*/
	var optionsToggleBtn = $('#options_btn');
	var buttonState = 1; //open
	optionsToggleBtn.live('click', function(){
		$('#options').slideToggle('slow' , function(){
			if (buttonState == 1) {
				buttonState = 0;
				$('#arrowoptionstoggle').attr('src','images/down-arrow.png');
			} else { 
				buttonState = 1;
				$('#arrowoptionstoggle').attr('src','images/up-arrow.png');
			}
		});
	});
	
	/*MENU TOGGLES  -------------------------------------*/
	$('#instructions-toggle').live('click', function(){
		$('#instructions-wrap').slideToggle('slow');
	});
	$('#examples-toggle').live('click', function(){
		$('#examples-wrap').slideToggle('slow');
	});
	$('#options-toggle').live('click', function(){
		$('#options-wrap').slideToggle('slow');
	});
	
	/*Menu Init*/
	$('#instructions-toggle').trigger('click');
	$('#examples-toggle').trigger('click');
	$('#options-toggle').trigger('click');
	
	/*COPY AND PASTE  -------------------------------------*/
	/*show copy and paste area*/
	$('#copyandpaste-show').live('click', function(){
		$('#copyandpaste-area').slideToggle('slow');
	});
	/*load copy and paste json*/
	$('#loadcopyandpaste').live('click', function(){
		var pastedJson = $('#copyandpastejson').val();
		if (pastedJson !== '') {
			JSONTREEVIEWER.processJSONTree('copyandpastejson');
		} else {
			alert('Please copy and paste your JSON into the box above! :o)');
		}
	});

})(jQuery);