function strLength(val){
	var str = String(val);
	var _byte = 0;

	if(str.length != 0){
		for (var i=0; i < str.length; i++){
			var str2 = str.charAt(i);
			if(escape(str2).length > 4){
				_byte += 2;
			}else{
				_byte++;
			}
		}
	}

	return _byte;
}

function chr_byte(chr){
	if(escape(chr).length > 4){
		return 2;
	}else{
		return 1;
	}
}

function cutString(str, limit, more){
	var tmpStr = str;
	var byte_count = 0;
	var len = str.length;
	var dot = "";
	var strResult = "";

	for(i=0; i<len; i++){
		byte_count += chr_byte(str.charAt(i));

		if(byte_count == limit-1){
			if(chr_byte(str.charAt(i+1)) == 2){
				tmpStr = str.substring(0,i+1);
				dot = more;
			}else {
				if(i+2 != len) dot = more;
				tmpStr = str.substring(0,i+2);
			}
			break;
		}else if(byte_count == limit){
			if(i+1 != len) dot = more;

			tmpStr = str.substring(0,i+1);
			break;
		}
	}

	strResult = tmpStr + dot;
	return strResult;
}

function nl2br(str, is_xhtml) {
	var breakTag = (is_xhtml || typeof is_xhtml === 'undefined') ? '<br ' + '/>' : '<br>';

	return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
}

function strip_tags(input, allowed) {
	if(typeof(input) != "string"){
		return input;
	}else{
		allowed = (((allowed || '') + '')
			.toLowerCase()
			.match(/<[a-z][a-z0-9]*>/g) || [])
			.join(''); // making sure the allowed arg is a string containing only tags in lowercase (<a><b><c>)
		var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi,
			commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;
		return input.replace(commentsAndPhpTags, '')
			.replace(tags, function($0, $1) {
				return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : '';
			});
	}
}

// left trim
function ltrim(str, charlist) {
	charlist = !charlist ? ' \\s\u00A0' : (charlist + '')
		.replace(/([\[\]\(\)\.\?\/\*\{\}\+\$\^\:])/g, '$1');
	var re = new RegExp('^[' + charlist + ']+', 'g');
	return (str + '')
		.replace(re, '');
}

// right trim
function rtrim(str, charlist) {
	charlist = !charlist ? ' \\s\u00A0' : (charlist + '')
		.replace(/([\[\]\(\)\.\?\/\*\{\}\+\$\^\:])/g, '\\$1');
	var re = new RegExp('[' + charlist + ']+$', 'g');
	return (str + '')
		.replace(re, '');
}

// trim
function trim(str, charlist) {
	var whitespace, l = 0,
		i = 0;
	str += '';

	if (!charlist) {
		// default list
		whitespace =
			' \n\r\t\f\x0b\xa0\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u200b\u2028\u2029\u3000';
	} else {
		// preg_quote custom list
		charlist += '';
		whitespace = charlist.replace(/([\[\]\(\)\.\?\/\*\{\}\+\$\^\:])/g, '$1');
	}

	l = str.length;
	for (i = 0; i < l; i++) {
		if (whitespace.indexOf(str.charAt(i)) === -1) {
			str = str.substring(i);
			break;
		}
	}

	l = str.length;
	for (i = l - 1; i >= 0; i--) {
		if (whitespace.indexOf(str.charAt(i)) === -1) {
			str = str.substring(0, i + 1);
			break;
		}
	}

	return whitespace.indexOf(str.charAt(0)) === -1 ? str : '';
}