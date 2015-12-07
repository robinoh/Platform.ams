
/* common */
function logout(){
	$.ajaxSetup({cache: false, async: false});
	$.post('/ams/Common/logout', function (){
		location.href = '/';
	}, 'json');
	location.href = '/';
}

// debug log
function debugLog(data){
	if(isEmpty(data.isDebug)) return data;

	if(typeof window.console != 'undefined' && typeof window.console.log != 'undefined'){
		if(data.isDebug){
			console.log(data);
		}
	}

	return data;
}

// session
function checkSessionExpired(data)
{
	if(typeof window.console != 'undefined' && typeof window.console.log != 'undefined'){
		if(data.isDebug){
			console.log(data);
		}
	}

	var isLogout = false;

	if(data != null && 'error' in data){
		if(data.body == 'SESSION_EXPIRED' || data.error == '401')
		{
			isLogout = true;
		}
	}
	else
	{
		isLogout = true;
	}

	if(isLogout){
		logout();
	}else{
		return data;
	}

}


/*
 * URL functions
 */
function getSegmentUrl() {
	return location.pathname.substr(1).split('/');
}

function getJsonFromUrl() {
	//var query = window.location.hash.substr(1);
	var query = window.location.search.substr(1);
	var data = query.split("&");
	var result = {};

	for(var i=0; i<data.length; i++) {
		var item = data[i].split("=");
		result[item[0]] = item[1];
	}

	return result;
}

// succcess message
function replaceSuccessCode(content, type){
	var result;

	if(type){
		result = content;
	} else {
		result = window.lang['success'][content];
	}
	return result;
}

// error messageModalConfirm
function replaceErrorCode(content){
	var result, status;
	var errors = window.lang['error'];
	var errorComment = window.lang['errorComment'];

	var code = '';
	var comment = false;

	var http_error = {
		"404": window.lang['error']['UNKNOWN'],
		"unkown": window.lang['error']['UNKNOWN']
	};

	if(typeof(content) == 'string'){
		code = content;
		comment = false;
	}

	if(typeof(content)== 'object'){
		status = content.error;

		if(!isEmpty(content.body)){
			code = content.body;
		}else if(!isEmpty(content.code)){
			code = content.code;
		}

		comment = isEmpty(content.comment) ? '[Unknown]' : content.comment;

		if(isEmpty(content.body) && isEmpty(content.comment)){
			comment = false;
			code = 'UNKNOWN';
			result = isEmpty(http_error[status]) ? http_error.unkown : http_error[status];
		}
	}

	if(code != 'UNKNOWN'){
		result = isEmpty(errors[code]) ? code : errors[code];

		if(comment !== false){
			if(!isEmpty(errorComment) && !isEmpty(errorComment[comment])){
				result = errorComment[comment];
			}

			if(isEmpty(window.lang[code])){
				result = result.replace('{comment}', comment);
			}else{
				result = (isEmpty(window.lang[code][comment])) ? result : window.lang[code][comment];
			}
		}
	}

	return result;
}


// gritter
function gritter(type, content){
	var title;
	var className;
	var result = replaceErrorCode(content);

	switch(type){
		case 0:
			title = window.lang['title']['error'];
			className = 'danger';
			break;
		case 1:
			title = window.lang['title']['success'];
			className = 'success';
			break;
		case 2:
			title = window.lang['title']['warning'];
			className = 'warning';
			break;
		case 3:
			title = window.lang['title']['info'];
			className = 'info';
			break;
		default:
			break;
	}

	$.gritter.removeAll({
		after_close: function(){
			$.gritter.add({
				position: 'top-right',
				title: title,
				text: result,
				class_name: className,
				time: 3000
			});
		}
	});
}
// function type check
function isFunction(name){
	return (typeof name == "function");
}

// datatable onclick
function convertButtons(val, mode){
	var rst;
	switch (mode){
		case "editAdmin":
			rst = '<a><i class="fa fa-cog"></i></a> ' + val;
			break;

		case "dropdown":
			rst = '\
				<div class="dropdown">\
					<a data-toggle="dropdown" aria-haspopup="true" role="button" aria-expanded="false">' + val + '</a>\
					<ul class="dropdown-menu" role="menu">\
						<li><a title="Info"><i class="fa fa-info-circle"></i> Info</a></li>\
						<li><a title="GameHistory"><i class="fa fa-gamepad"></i> Game History</a></li>\
					</ul>\
				</div>\
			';
			break;
	}
	return rst;
}

// get Hash value
function getHashValue(key) {
	var matches = location.hash.match(new RegExp(key+'=([^&]*)'));
	return matches ? matches[1] : null;
}


// check is val numeric
function checkNumeric(val){
	var ret;

	// trim value
	val = val.toString().fnTrim();

	ret = /(^\d+|(^\d{1,3}(\,\d{3})*))($|\.\d+)$/g.test(val);

	if(ret){
		var beForeDot = RegExp.$1;
		var afterDot = RegExp.$4;
		ret = beForeDot.replace(/,/g,'') + '' + afterDot;
	}

	return ret;
}

// check amount
function checkAmount(val){

	var num = parseFloat(val);

	if(isEmpty(val) || num == 0){
		return 2;
	}

	var patt = /^(\d{1,3}(,\d{3})+|\d+)(\.(\d{1,2}))?$/;
	if(!patt.test(val) || isNaN(num) || num < 0){
		return 3;
	}

	return 1;
}

function checkRakeBack(val){

	var num = parseInt(val);

	if (isEmpty(val)){
		return 2;
	}

	var patt = /^[0-9]{0,10}$/;
	var patt2 = /^[0-9]{0,10}[.][0-9]{0,2}$/;
	if((!patt.test(val) && !patt2.test(val)) || isNaN(num) || num < 0){
		return 3;
	}

	return 1;
}

// trim function
if(!String.fnTrim){
	String.prototype.fnTrim = function(){
		var val = this;
		if(isEmpty(val)){
			return '';
		}else{
			return val.replace(/^\s+|\s+$/gm, '');
		}
	}
}

function closePopover(obj){
	var rst = $(obj).parent().parent().parent();
	$(rst).popover('destroy');
}

function dropDownFixPosition(button,dropdown){
	var dropDownTop = button.offset().top + button.outerHeight();
	dropdown.css('top', dropDownTop + "px");
	dropdown.css('left', button.offset().left + "px");
}
