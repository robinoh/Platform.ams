// empty data
function isEmpty(data){
	return (data == null || (data == '' && strLength(data) == 0) || typeof data == "undefined");
}

// json
function json_encode (mixed_val) {
	var retVal, json = this.window.JSON;
	try {
		if (typeof json === 'object' && typeof json.stringify === 'function') {
			retVal = json.stringify(mixed_val);
			if (retVal === undefined) {
				throw new SyntaxError('json_encode');
			}
			return retVal;
		}

		var value = mixed_val;

		var quote = function (string) {
			var escapable = /[\\\"\u0000-\u001f\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
			var meta = {
				'\b': '\\b',
				'\t': '\\t',
				'\n': '\\n',
				'\f': '\\f',
				'\r': '\\r',
				'"': '\\"',
				'\\': '\\\\'
			};

			escapable.lastIndex = 0;
			return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
				var c = meta[a];
				return typeof c === 'string' ? c : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
			}) + '"' : '"' + string + '"';
		};

		var str = function (key, holder) {
			var gap = '';
			var indent = '    ';
			var i = 0;
			var k = '';
			var v = '';
			var length = 0;
			var mind = gap;
			var partial = [];
			var value = holder[key];

			if (value && typeof value === 'object' && typeof value.toJSON === 'function') {
				value = value.toJSON(key);
			}

			switch (typeof value) {
				case 'string':
					return quote(value);

				case 'number':
					return isFinite(value) ? String(value) : 'null';

				case 'boolean':
				case 'null':
					return String(value);

				case 'object':
					if (!value) {
						return 'null';
					}
					if ((this.PHPJS_Resource && value instanceof this.PHPJS_Resource) || (window.PHPJS_Resource && value instanceof window.PHPJS_Resource)) {
						throw new SyntaxError('json_encode');
					}

					gap += indent;
					partial = [];

					if (Object.prototype.toString.apply(value) === '[object Array]') {
						length = value.length;
						for (i = 0; i < length; i += 1) {
							partial[i] = str(i, value) || 'null';
						}

						v = partial.length === 0 ? '[]' : gap ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']' : '[' + partial.join(',') + ']';
						gap = mind;
						return v;
					}

					for (k in value) {
						if (Object.hasOwnProperty.call(value, k)) {
							v = str(k, value);
							if (v) {
								partial.push(quote(k) + (gap ? ': ' : ':') + v);
							}
						}
					}

					v = partial.length === 0 ? '{}' : gap ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}' : '{' + partial.join(',') + '}';
					gap = mind;
					return v;
				case 'undefined':
				// Fall-through
				case 'function':
				// Fall-through
				default:
					throw new SyntaxError('json_encode');
			}
		};

		return str('', {
			'': value
		});

	} catch (err) { // Todo: ensure error handling above throws a SyntaxError in all cases where it could
		if (!(err instanceof SyntaxError)) {
			throw new Error('Unexpected error type in json_encode()');
		}
		this.php_js = this.php_js || {};
		this.php_js.last_error_json = 4; // usable by json_last_error()
		return null;
	}
}

function json_decode (str_json) {
	var json = this.window.JSON;
	if (typeof json === 'object' && typeof json.parse === 'function') {
		try {
			return json.parse(str_json);
		} catch (err) {
			if (!(err instanceof SyntaxError)) {
				throw new Error('Unexpected error type in json_decode()');
			}
			this.php_js = this.php_js || {};
			this.php_js.last_error_json = 4;
			return null;
		}
	}

	var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
	var j;
	var text = str_json;

	cx.lastIndex = 0;
	if (cx.test(text)) {
		text = text.replace(cx, function (a) {
			return '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
		});
	}

	if ((/^[\],:{}\s]*$/).
			test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@').
				replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
				replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

		j = eval('(' + text + ')');

		return j;
	}

	this.php_js = this.php_js || {};
	this.php_js.last_error_json = 4;
	return null;
}

// number format
function number_format (number, decimals, dec_point, thousands_sep) {

	/*
	number = (number + '').replace(/[^0-9+\-Ee.]/g, '');
	var n = !isFinite(+number) ? 0 : +number,
		prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
		sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep,
		s = '',
		toFixedFix = function (n, prec) {
			var k = Math.pow(10, prec);
			return n < 0 ? '' + Math.ceil(n * k) / k : '' + Math.floor(n * (k*10) / k*10) / k;
		};
	// Fix for IE parseFloat(0.55).toFixed(0) = 0;
	s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.');
	if (s[0].length > 3) {
		s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
	}
	if ((s[1] || '').length < prec) {
		s[1] = s[1] || '';
		s[1] += new Array(prec - s[1].length + 1).join('0');
	}
	return s.join(dec);
	*/
	decimals = (decimals) ? (decimals == 'none') ? 'none' : Math.abs(decimals) : 0;
	thousands_sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep;
	dec_point = (typeof dec_point === 'undefined') ? '.' : dec_point;

	var oVal = String(number).split('.');
	if (oVal[0].length > 3) {
		oVal[0] = oVal[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, thousands_sep);
	}
	if (oVal[1]){
		oVal[1] = oVal[1].substring(0, decimals);
	} else {
		oVal[1] = "";
	}
	if (oVal[1].length < decimals){
		var length = decimals - oVal[1].length;
		for (var i=0; i<length; i++){
			oVal[1] += "0";
		}
	}

	return (oVal[1]) ? oVal.join('.') : oVal[0];

}

function unNumber_format (val) {

	var rst = val.replace(/[^\.0-9]/g, '');
	rst = parseFloat(rst);
	if(isNaN(rst)){
		rst = '';
	}

	return rst.toString();

}

// data format
function dataFormat(val, type, bit){
	var result, number;
	var start, end;

	bit = isEmpty(bit) ? 2 : bit;

	switch(type){
		case 'int':
			val = val.toString().replace(/\,/, '');
			number = number_format(val);

			if(val < 0){
				result = '<span class="text-danger">' + number + '</span>';
			}else{
				result = '<span>' + number + '</span>';
			}
			break;
		case 'float':
			val = val.toString().replace(/\,/, '');
			number = number_format(val, bit);

			if(val < 0){
				result = '<span class="text-danger">' + number + '</span>';
			}else{
				result = '<span>' + number + '</span>';
			}
			break;
		case 'money':
			val = val.toString().replace(/\,/, '');
			var oVal = isNaN(val) ? 0 : parseFloat(val);
			var oMoney = number_format(oVal, 4);
			var money;
			var digits = isEmpty(bit) ? 2 : bit;
			var lengthForFix = 100;

			if(oVal < 0){
				//money = Math.abs(Math.floor(parseFloat((oVal * lengthForFix).toFixed(1))) / lengthForFix);
				oVal = oVal * -1;
				money = number_format(oVal, digits);

				result = '<span class="text-danger" title="' + oMoney + '">-$' + money + '</span>';
			}else{
				//money = parseInt(Math.floor(parseFloat((oVal * lengthForFix).toFixed(1)))) / lengthForFix;
				money = number_format(oVal, digits);

				result = '<span title="' + oMoney + '">$' + money + '</span>';
			}
			break;
		case 'date':
			result = convertDate(val, 'YYYY-MM-DD');
			break;
		case 'dateAbs':
			result = convertDate(val, 'YYYY-MM-DD', true);
			break;
		case 'datetime':
			result = convertDate(val);
			break;
		case 'datetimeAbs':
			result = convertDate(val, null, true);
			break;
		case 'percentage':
			result = val + ' %';
			break;
		case 'day':
			result = convertDate(val, 'YYYY-MM-DD');
			break;
		case 'dayAbs':
			result = convertDate(val, 'YYYY-MM-DD', true);
			break;
		case 'week':
			start = moment.utc(val).format('YYYY-MM-DD');
			end = moment.utc(val).add({"days": 6}).format('YYYY-MM-DD');

			result = start + ' ~ ' + end;
			break;
		case 'weekAbs':
			start = moment(val).format('YYYY-MM-DD');
			end = moment(val).add({"days": 6}).format('YYYY-MM-DD');

			result = start + ' ~ ' + end;
			break;
		case 'month':
			result = moment.utc(val).format('YYYY-MM');
			break;
		case 'monthAbs':
			result = moment(val).format('YYYY-MM');
			break;
		default:
			result = val;
			break;
	}

	return result;
}

// convertType
function convertType(val, type){
	var rst;
	var obj = window[type];

	if (!isEmpty(val)){
		$.each(obj, function(idx, value){
			for (var i=0; i<value.length; i++){
				if (value[i].code == val){
					rst = value[i].name;
				}
			}
		});
	}
	return rst;
}

// type2List
function type2List(obj){
	var rst = [];
	$.each (obj, function(idx, val){
		rst.push(val.code);
	});
	return rst;
}

// convertStatus
function convertStatus(val, mode){
	var rst;
	switch (mode){
		case 'Status':
			rst = (val == false) ? window.lang['status']['active'] : '<span class="text-danger">' + window.lang['status']['suspend'] + '</span>';
			break;

		case 'Access':
			rst = (val == true) ? '<i class="fa fa-check-circle-o successIcon"></i>' : '<i class="fa fa-times dangerIcon"></i>';
			break;
	}
	return rst;
}

// set cookie
function setCookie(cname, cvalue, exdays) {
	var d = new Date();
	d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
	var expires = "expires=" + d.toUTCString();
	document.cookie = cname + "=" + cvalue + "; " + expires;
}

// get cookie
function getCookie(cname) {
	var name = cname + "=";
	var ca = document.cookie.split(';');
	for(var i=0; i<ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1);
		if (c.indexOf(name) == 0) return c.substring(name.length,c.length);
	}
	return "";
}

// display country
function displayCountry(country){
	var rst;
	rst = (window.lang['country'][country]) ? window.lang['country'][country] : country;
	return rst;
}

function PlayersDropDown(data, mode){
	var html = '';
	var name = (mode == 'username') ? data.username : (data.nickname) ? data.nickname : '';

	html += '\
	<span class="dropdown">\
		<a data-toggle="dropdown" aria-haspopup="true" role="button" aria-expanded="false">' + name + '</a>\
		<ul class="dropdown-menu" role="menu">\
	';

	if (window.userData.role == 'LABEL'){
		html += '<li><a type="walletHistory"><i class="fa fa-money"></i> ' + window.lang['string']['walletHistory'] + '</a></li>';
		html += '<li><a type="transfer"><i class="fa fa-dollar"></i> ' + window.lang['string']['creditDebit'] + '</a></li>';
		html += '<li><a type="rakeback"><i class="fa fa-pencil"></i> ' + window.lang['string']['modifyRakeBackPercentage'] + '</a></li>';
	} else {
		if (window.userData.agentInfo && window.userData.agentInfo.hasBalanceControlAccess == true){
			html += '<li><a type="walletHistory"><i class="fa fa-money"></i> ' + window.lang['string']['walletHistory'] + '</a></li>';
			html += '<li><a type="transfer"><i class="fa fa-dollar"></i> ' + window.lang['string']['creditDebit'] + '</a></li>';
		}

		if (window.userData.agentInfo && window.userData.agentInfo.type == 'Rakeback'){
			html += '<li><a type="rakeback"><i class="fa fa-pencil"></i> ' + window.lang['string']['modifyRakeBackPercentage'] + '</a></li>';
		}
	}

	html += '\
		</ul>\
	</span>\
	';
	return html;
}