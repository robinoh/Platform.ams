function is_array(mixed_var) {
	var ini,
		_getFuncName = function(fn) {
			var name = (/\W*function\s+([\w\$]+)\s*\(/)
				.exec(fn);
			if (!name) {
				return '(Anonymous)';
			}
			return name[1];
		};
	var _isArray = function(mixed_var) {
		if (!mixed_var || typeof mixed_var !== 'object' || typeof mixed_var.length !== 'number') {
			return false;
		}
		var len = mixed_var.length;
		mixed_var[mixed_var.length] = 'bogus';
		if (len !== mixed_var.length) {
			mixed_var.length -= 1;
			return true;
		}
		delete mixed_var[mixed_var.length];
		return false;
	};

	if (!mixed_var || typeof mixed_var !== 'object') {
		return false;
	}

	this.php_js = this.php_js || {};
	this.php_js.ini = this.php_js.ini || {};

	ini = this.php_js.ini['phpjs.objectsAsArrays'];

	return _isArray(mixed_var) ||
		((!ini || (
			(parseInt(ini.local_value, 10) !== 0 && (!ini.local_value.toLowerCase || ini.local_value.toLowerCase() !==
			'off')))) && (
		Object.prototype.toString.call(mixed_var) === '[object Object]' && _getFuncName(mixed_var.constructor) ===
		'Object'
		));
}

function in_array (needle, haystack, argStrict) {
	var key = '',
		strict = !! argStrict;

	if (strict) {
		for (key in haystack) {
			if (haystack[key] === needle) {
				return true;
			}
		}
	} else {
		for (key in haystack) {
			if (haystack[key] == needle) {
				return true;
			}
		}
	}

	return false;
}

function end (arr) {
	this.php_js = this.php_js || {};
	this.php_js.pointers = this.php_js.pointers || [];
	var indexOf = function (value) {
		for (var i = 0, length = this.length; i < length; i++) {
			if (this[i] === value) {
				return i;
			}
		}
		return -1;
	};
	// END REDUNDANT
	var pointers = this.php_js.pointers;
	if (!pointers.indexOf) {
		pointers.indexOf = indexOf;
	}
	if (pointers.indexOf(arr) === -1) {
		pointers.push(arr, 0);
	}
	var arrpos = pointers.indexOf(arr);
	if (Object.prototype.toString.call(arr) !== '[object Array]') {
		var ct = 0;
		for (var k in arr) {
			ct++;
			var val = arr[k];
		}
		if (ct === 0) {
			return false; // Empty
		}
		pointers[arrpos + 1] = ct - 1;
		return val;
	}
	if (arr.length === 0) {
		return false;
	}
	pointers[arrpos + 1] = arr.length - 1;

	return arr[pointers[arrpos + 1]];
}

// count of array or object (mode 1: include child array or object)
function count(mixed_var, mode) {
	var key, cnt = 0;

	if (mixed_var === null || typeof mixed_var === 'undefined') {
		return 0;
	} else if (mixed_var.constructor !== Array && mixed_var.constructor !== Object) {
		return 1;
	}

	if(isEmpty(mode)) {
		mode = 0;
	}

	for (key in mixed_var) {
		if (mixed_var.hasOwnProperty(key)) {
			cnt++;
			if (mode == 1 && mixed_var[key] && (mixed_var[key].constructor === Array || mixed_var[key].constructor ===
				Object)) {
				cnt += this.count(mixed_var[key], 1);
			}
		}
	}

	return cnt;
}