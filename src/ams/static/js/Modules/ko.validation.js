// Validation Control
var ValidControl = function(obj, options){
	obj.hasError = ko.observable(false);
	obj.errorMessage = ko.observable('');
	obj.isDisabled = ko.observable(false);

	// options
	obj.loadCheck = ko.observable(false);
	obj.isRequired = ko.observable(false);
	obj.defaultMessage = ko.observable('');
	obj.ruleMessage = ko.observable('');
	obj.isCustomRule = ko.observable(false);
	obj.ruleRegex = ko.observable(null);

	obj.cssDisabled = ko.observable('disabled');
	obj.cssError = ko.observable('has-error');
	obj.cssSuccess = ko.observable('has-success');

	if(typeof options['loadCheck'] == "boolean"){
		obj.loadCheck(options['loadCheck']);
	}

	if(typeof options['required'] == "boolean"){
		obj.isRequired(options['required']);
	}

	if(typeof options['default'] == "string"){
		obj.defaultMessage(options['default']);
	}

	if(typeof options['message'] == "string"){
		obj.ruleMessage(options['message']);
	}

	if(typeof options['regex'] == "object"){
		obj.isCustomRule(true);
		obj.ruleRegex(options['regex']);
	}

	if(typeof options['disabled'] == "string"){
		obj.cssDisabled(options['disabled']);
	}

	if(typeof options['error'] == "string"){
		obj.cssError(options['error']);
	}

	if(typeof options['success'] == "string"){
		obj.cssSuccess(options['success']);
	}

	// status
	obj.Status = ko.computed(function(){
		if(obj.loadCheck()){
			return obj.hasError();
		}else{
			return isEmpty(obj()) ? false : obj.hasError();
		}
	});

	// css
	obj.ErrorClass = ko.computed(function(){
		var css = '';
		var val = obj();

		if(obj.isDisabled()){
			css = obj.cssDisabled();
		}else if(obj.isRequired()){
			if(obj.loadCheck() || !isEmpty(val)){
				css = obj.Status() ? obj.cssError() : obj.cssSuccess();
			}
		}else if(!isEmpty(val)){
			css = obj.Status() ? obj.cssError() : obj.cssSuccess();
		}

		return css;
	});

	// message
	obj.Message = ko.computed(function(){
		return obj.hasError() ? obj.errorMessage() : '';
	});

	// functions
	obj.CheckRequired = function(val){
		if(obj.isRequired()){
			obj.hasError(isEmpty(val));
			obj.errorMessage(isEmpty(val) ? obj.defaultMessage() : '');
		}else{
			obj.hasError(false);
			obj.errorMessage('');
		}
	};

	// change required
	obj.EditRequired = function(val){
		obj.isRequired(val);
		obj.CheckRequired(obj());
	};

	// change disabled
	obj.EditDisabled = function(val){
		obj.isDisabled(val);
		obj.EditRequired(!val);
	};

	// reset
	obj.Reset = function(){
		obj.hasError(false);
		obj('');
	};

	return obj;
};

// Required
ko.extenders.required = function(obj, options){
	obj = new ValidControl(obj, options);
	obj.isRequired(true);

	function validate(val){
		if(obj.isDisabled()) return;

		obj.CheckRequired(val);	// check required
	}

	validate(obj());
	obj.subscribe(validate);

	return obj;
};

/*
 * alphabet
 * minLength[integer]: minimal string length
 * manxLength[integer]: maximum string length
 */
ko.extenders.alphabet = function(obj, options){
	obj = new ValidControl(obj, options);

	// rule options
	obj.minLength = ko.observable(0);
	obj.maxLength = ko.observable(0);

	if(typeof options.minLength == "number"){
		obj.minLength(options.minLength);
	}

	if(typeof options.maxLength == "number"){
		obj.maxLength(options.maxLength);
	}

	function validate(val){
		if(obj.isDisabled()) return;

		obj.CheckRequired(val);	// check required

		var regex = /^[a-z]+$/i;
		var isValid = true;

		// validation code
		if(!isEmpty(val)){
			if(obj.minLength() > 0){
				isValid = isValid && (val.length < obj.minLength());
			}

			if(obj.maxLength() > 0){
				isValid = isValid && (val.length > obj.maxLength());
			}

			isValid = isValid && regex.test(val);

			if(!isValid){
				obj.hasError(true);
				obj.errorMessage(obj.ruleMessage());
			}
		}
	}

	validate(obj());
	obj.subscribe(validate);

	return obj;
};

/*
 * number
 * minValue[integer]: minimal string length
 * maxValue[integer]: maximum string length
 */
ko.extenders.number = function(obj, options){
	obj = new ValidControl(obj, options);

	// rule options
	obj.minValue = ko.observable('');
	obj.maxValue = ko.observable('');

	if(typeof options.minValue == "number"){
		obj.minValue(options.minValue);
	}

	if(typeof options.maxValue == "number"){
		obj.maxValue(options.maxValue);
	}

	function validate(val){
		if(obj.isDisabled()) return;

		obj.CheckRequired(val);	// check required

		var regex = /^(\d{1,3}(,\d{3})+|\d+)?$/;
		var isNotValid = false;

		// validation code
		if(!isEmpty(val)){
			if(typeof obj.minValue() == 'number' && obj.minValue() >= 0){
				isNotValid = isNotValid || (val < obj.minValue());
			}

			if(typeof obj.maxValue() == 'number' && obj.maxValue() >= 0){
				isNotValid = isNotValid || (val > obj.maxValue());
			}

			isNotValid = isNotValid || !regex.test(val);

			if(isNotValid){
				obj.hasError(true);
				obj.errorMessage(obj.ruleMessage());
			}
		}
	}

	validate(obj());
	obj.subscribe(validate);

	return obj;
};

/*
 * decimal
 * useMinus[boolean]: usage minus sign
 * digit[integer]: length of a decimal point
 */
ko.extenders.decimal = function(obj, options){
	obj = new ValidControl(obj, options);

	obj.minValue = ko.observable('');
	obj.maxValue = ko.observable('');
	obj.onlyNum = ko.observable(false);

	if(typeof options.minValue == "number"){
		obj.minValue(options.minValue);
	}

	if(typeof options.maxValue == "number"){
		obj.maxValue(options.maxValue);
	}

	if(typeof options.onlyNum == "boolean"){
		obj.onlyNum(options.onlyNum);
	}

	obj.useMinus = ko.observable(false);
	obj.digit = ko.observable(0);
	if(obj.onlyNum() == true){
		obj.regex = '(\\d*)';
	}else{
		obj.regex = '([1-9]{1,3}(,\\d{3})*|((\\d))*)';
	}

	if(typeof options.useMinus == "boolean"){
		obj.useMinus(options.useMinus);
		obj.regex = '([-]?)' + obj.regex;
	}

	if(typeof options.digit == "number"){
		obj.digit(options.digit);
		obj.regex += '(\\.(\\d{1,[digit]}))?'.replace('[digit]', obj.digit());
	}

	function validate(val){
		if(obj.isDisabled()) return;

		obj.CheckRequired(val);

		var strRegex = '^' + obj.regex + '$';
		var regex = new RegExp(strRegex);

		var isNotValid = false;
		// validation code
		if(!isEmpty(val)){

			if(obj.onlyNum() == true){
				val = val.replace(/[^\.0-9]/g, '');
				obj(val);
			}

			isNotValid = isNotValid || !regex.test(val);
			val = parseFloat(val.toString().replace(/[^0-9\.]/g, ''));
			if(typeof obj.minValue() == 'number' && obj.minValue() >= 0){
				isNotValid = isNotValid || (val < obj.minValue());
			}

			if(typeof obj.maxValue() == 'number' && obj.maxValue() >= 0){
				isNotValid = isNotValid || (val > obj.maxValue());
			}

			if(isNotValid){
				obj.hasError(true);
				obj.errorMessage(obj.ruleMessage());
			}
		}
	}

	validate(obj());
	obj.subscribe(validate);

	return obj;
};

/*
 * alphanum
 * minLength[integer]: minimal string length
 * maxLength[integer]: maximum string length
 */
ko.extenders.alphanum = function(obj, options){
	obj = new ValidControl(obj, options);

	// rule options
	obj.minLength = ko.observable(0);
	obj.maxLength = ko.observable(0);

	if(typeof options.minLength == "number"){
		obj.minLength(options.minLength);
	}

	if(typeof options.maxLength == "number"){
		obj.maxLength(options.maxLength);
	}

	function validate(val){
		if(obj.isDisabled()) return;

		obj.CheckRequired(val);	// check required

		var regex = /^[a-z0-9]+$/i;
		var isNotValid = false;

		// validation code
		if(!isEmpty(val)){
			if(obj.minLength() > 0){
				isNotValid = isNotValid || (val.length < obj.minLength());
			}

			if(obj.maxLength() > 0){
				isNotValid = isNotValid || (val.length > obj.maxLength());
			}

			isNotValid = isNotValid || !regex.test(val);

			if(isNotValid){
				obj.hasError(true);
				obj.errorMessage(obj.ruleMessage());
			}
		}
	}

	validate(obj());
	obj.subscribe(validate);

	return obj;
};

/*
 * alnumpunct
 * regex[regex]: custom rule
 * minLength[integer]: minimal string length
 * manxLength[integer]: maximum string length
 * Allowed Punctuation characters: !"#$%&'()*+,./:;<=>?@\^_`|{}~-[]\s
 */
ko.extenders.alnumpunct = function(obj, options){
	obj = new ValidControl(obj, options);

	// rule options
	obj.minLength = ko.observable(0);
	obj.maxLength = ko.observable(0);

	if(typeof options.minLength == "number"){
		obj.minLength(options.minLength);
	}

	if(typeof options.maxLength == "number"){
		obj.maxLength(options.maxLength);
	}

	function validate(val){
		if(obj.isDisabled()) return;

		obj.CheckRequired(val);	// check required

		var regex = obj.isCustomRule() ? obj.ruleRegex() : /^[a-z0-9\!\"\#\$\%\&\'\(\)\*\+\,\.\/\:\;\<\=\>\?\@\\\^\_\`\|\{\}\~\-\[\]\s]+$/i;
		var isNotValid = false;

		// validation code
		if(!isEmpty(val)){
			if(obj.minLength() > 0){
				isNotValid = isNotValid || (val.length < obj.minLength());
			}

			if(obj.maxLength() > 0){
				isNotValid = isNotValid || (val.length > obj.maxLength());
			}

			isNotValid = isNotValid || !regex.test(val);

			if(isNotValid){
				obj.hasError(true);
				obj.errorMessage(obj.ruleMessage());
			}
		}
	}

	validate(obj());
	obj.subscribe(validate);

	return obj;
};

/*
 * ScreenName
 * regex[regex]: custom rule
 * minLength[integer]: minimal string length (default=4)
 * manxLength[integer]: maximum string length (default=20)
 */
ko.extenders.ScreenName = function(obj, options){
	obj = new ValidControl(obj, options);

	// rule options
	obj.minLength = ko.observable(4);
	obj.maxLength = ko.observable(20);

	if(typeof options.minLength == "number"){
		obj.minLength(options.minLength);
	}

	if(typeof options.maxLength == "number"){
		obj.maxLength(options.maxLength);
	}

	function validate(val){
		if(obj.isDisabled()) return;

		obj.CheckRequired(val);	// check required

		var regex = obj.isCustomRule() ? obj.ruleRegex() : /^[a-z0-9\!\"\#\$\%\&\'\(\)\*\+\,\.\/\:\;\<\=\>\?\@\\\^\_\`\|\{\}\~\-\[\]\s]+$/i;
		var isNotValid = false;

		// validation code
		if(!isEmpty(val)){
			if(obj.minLength() > 0){
				isNotValid = isNotValid || (val.length < obj.minLength());
			}

			if(obj.maxLength() > 0){
				isNotValid = isNotValid || (val.length > obj.maxLength());
			}

			isNotValid = isNotValid || (!regex.test(val) || /(\s\s)+/.test(val) || /^\s/.test(val) || /\s$/.test(val));

			if(isNotValid){
				obj.hasError(true);
				obj.errorMessage(obj.ruleMessage());
			}
		}
	}

	validate(obj());
	obj.subscribe(validate);

	return obj;
};

/*
 * password
 * regex[regex]: custom rule
 * minLength[integer]: minimal string length (default=6)
 * manxLength[integer]: maximum string length (default=20)
 * Allowed Punctuation characters: !"#$%&'()*+,./:;<=>?@\^_`|{}~-[]
 */
ko.extenders.password = function(obj, options){
	obj = new ValidControl(obj, options);

	// rule options
	obj.minLength = ko.observable(6);
	obj.maxLength = ko.observable(20);

	if(typeof options.minLength == "number"){
		obj.minLength(options.minLength);
	}

	if(typeof options.maxLength == "number"){
		obj.maxLength(options.maxLength);
	}

	function validate(val){
		if(obj.isDisabled()) return;

		obj.CheckRequired(val);

		var regex = obj.isCustomRule() ? obj.ruleRegex() : /^(?=[a-z\!\"\#\$\%\&\'\(\)\*\+\,\.\/\:\;\<\=\>\?\@\\\^\_\`\|\{\}\~\-\[\]]*([0-9]))(?=[a-z0-9\!\"\#\$\%\&\'\(\)\*\+\,\.\/\:\;\<\=\>\?\@\\\^\_\`\|\{\}\~\-\[\]]*[a-z])[a-z0-9\!\"\#\$\%\&\'\(\)\*\+\,\.\/\:\;\<\=\>\?\@\\\^\_\`\|\{\}\~\-\[\]]+$/i;
		var isNotValid = false;

		// validation code
		if(!isEmpty(val)){

			if(obj.minLength() > 0){
				isNotValid = isNotValid || (val.length < obj.minLength());
			}

			if(obj.maxLength() > 0){
				isNotValid = isNotValid || (val.length > obj.maxLength());
			}

			isNotValid = isNotValid || !regex.test(val);

			if(isNotValid){
				obj.hasError(true);
				obj.errorMessage(obj.ruleMessage());
			}
		}
	}

	validate(obj());
	obj.subscribe(validate);

	return obj;
};

/*
 * EmailAddress
 * regex[regex]: custom rule
 * minLength[integer]: minimal string length (default=4)
 * manxLength[integer]: maximum string length (default=64)
 */
ko.extenders.EmailAddress = function(obj, options){
	obj = new ValidControl(obj, options);

	// rule options
	obj.minLength = ko.observable(4);
	obj.maxLength = ko.observable(64);

	if(typeof options.minLength == "number"){
		obj.minLength(options.minLength);
	}

	if(typeof options.maxLength == "number"){
		obj.maxLength(options.maxLength);
	}

	function validate(val){
		if(obj.isDisabled()) return;

		obj.CheckRequired(val);

		var regex = obj.isCustomRule() ? obj.ruleRegex() : /^([a-z0-9][\-a-z0-9_\+\.]*[a-z0-9])@([a-z0-9][\-a-z0-9\.]*[a-z0-9]\.(arpa|root|aero|biz|cat|com|coop|edu|gov|info|int|jobs|mil|mobi|museum|name|net|org|pro|tel|travel|ac|ad|ae|af|ag|ai|al|am|an|ao|aq|ar|as|at|au|aw|ax|az|ba|bb|bd|be|bf|bg|bh|bi|bj|bm|bn|bo|br|bs|bt|bv|bw|by|bz|ca|cc|cd|cf|cg|ch|ci|ck|cl|cm|cn|co|cr|cu|cv|cx|cy|cz|de|dj|dk|dm|do|dz|ec|ee|eg|er|es|et|eu|fi|fj|fk|fm|fo|fr|ga|gb|gd|ge|gf|gg|gh|gi|gl|gm|gn|gp|gq|gr|gs|gt|gu|gw|gy|hk|hm|hn|hr|ht|hu|id|ie|il|im|in|io|iq|ir|is|it|je|jm|jo|jp|ke|kg|kh|ki|km|kn|kr|kw|ky|kz|la|lb|lc|li|lk|lr|ls|lt|lu|lv|ly|ma|mc|md|mg|mh|mk|ml|mm|mn|mo|mp|mq|mr|ms|mt|mu|mv|mw|mx|my|mz|na|nc|ne|nf|ng|ni|nl|no|np|nr|nu|nz|om|pa|pe|pf|pg|ph|pk|pl|pm|pn|pr|ps|pt|pw|py|qa|re|ro|ru|rw|sa|sb|sc|sd|se|sg|sh|si|sj|sk|sl|sm|sn|so|sr|st|su|sv|sy|sz|tc|td|tf|tg|th|tj|tk|tl|tm|tn|to|tp|tr|tt|tv|tw|tz|ua|ug|uk|um|us|uy|uz|va|vc|ve|vg|vi|vn|vu|wf|ws|ye|yt|yu|za|zm|zw)|([0-9]{1,3}\.{3}[0-9]{1,3}))$/i;
		var isNotValid = false;

		// validation code
		if(!isEmpty(val)){
			if(obj.minLength() > 0){
				isNotValid = isNotValid || (val.length < obj.minLength());
			}

			if(obj.maxLength() > 0){
				isNotValid = isNotValid || (val.length > obj.maxLength());
			}

			isNotValid = isNotValid || !regex.test(val);

			if(isNotValid){
				obj.hasError(true);
				obj.errorMessage(obj.ruleMessage());
			}
		}
	}

	validate(obj());
	obj.subscribe(validate);

	return obj;
};

// admin username
ko.extenders.username = function(obj, options){
	obj = new ValidControl(obj, options);

	// rule options
	obj.minLength = ko.observable(4);
	obj.maxLength = ko.observable(10);

	if(typeof options.minLength == "number"){
		obj.minLength(options.minLength);
	}

	if(typeof options.maxLength == "number"){
		obj.maxLength(options.maxLength);
	}

	function validate(val){
		if(obj.isDisabled()) return;

		obj.CheckRequired(val);

		var regex = obj.isCustomRule() ? obj.ruleRegex() : /^[a-zA-Z0-9]{4,10}$/;
		var isNotValid = false;

		// validation code
		if(!isEmpty(val)){
			if(obj.minLength() > 0){
				isNotValid = isNotValid || (val.length < obj.minLength());
			}

			if(obj.maxLength() > 0){
				isNotValid = isNotValid || (val.length > obj.maxLength());
			}

			isNotValid = isNotValid || !regex.test(val);

			if(isNotValid){
				obj.hasError(true);
				obj.errorMessage(obj.ruleMessage());
			}
		}
	}

	validate(obj());
	obj.subscribe(validate);

	return obj;
};

/*
 * GeneralText
 * regex[regex]: custom rule
 * minLength[integer]: minimal string length
 * manxLength[integer]: maximum string length
 */
ko.extenders.GeneralText = function(obj, options){
	obj = new ValidControl(obj, options);

	// rule options
	obj.minLength = ko.observable(0);
	obj.maxLength = ko.observable(0);

	if(typeof options.minLength == "number"){
		obj.minLength(options.minLength);
	}

	if(typeof options.maxLength == "number"){
		obj.maxLength(options.maxLength);
	}

	function validate(val){
		if(obj.isDisabled()) return;

		obj.CheckRequired(val);

		var isNotValid = false;

		// validation code
		if(!isEmpty(val)){
			if(obj.minLength() > 0){
				isNotValid = isNotValid || (val.length < obj.minLength());
			}

			if(obj.maxLength() > 0){
				isNotValid = isNotValid || (val.length > obj.maxLength());
			}

			if(isNotValid){
				obj.hasError(true);
				obj.errorMessage(obj.ruleMessage());
			}
		}
	}

	validate(obj());
	obj.subscribe(validate);

	return obj;
};


/* invitation */
ko.extenders.invitationAgentCode = function(obj, options){
	obj = new ValidControl(obj, options);

	function validate(val){
		if(obj.isDisabled()) return;

		obj.CheckRequired(val);	// check required

		var regex = /^[a-z0-9]+$/i;
		var isNotValid = false;

		// validation code
		if(!isEmpty(val)){
			if(val.length < 3 || val.length > 10){
				obj.hasError(true);
				obj.errorMessage(window.lang['error']['INVALID_AGENTCODE_LENGTH']);
				return;
			}

			if(!regex.test(val)){
				obj.hasError(true);
				obj.errorMessage(window.lang['error']['INVALID_AGENTCODE_FORMAT']);
			}
		}
	}

	validate(obj());
	obj.subscribe(validate);

	return obj;
};

ko.extenders.invitationPassword = function(obj, options){
	obj = new ValidControl(obj, options);

	function validate(val){
		if(obj.isDisabled()) return;

		obj.CheckRequired(val);	// check required

		var regex = obj.isCustomRule() ? obj.ruleRegex() : /^(?=[a-z\!\"\#\$\%\&\'\(\)\*\+\,\.\/\:\;\<\=\>\?\@\\\^\_\`\|\{\}\~\-\[\]]*([0-9]))(?=[a-z0-9\!\"\#\$\%\&\'\(\)\*\+\,\.\/\:\;\<\=\>\?\@\\\^\_\`\|\{\}\~\-\[\]]*[a-z])[a-z0-9\!\"\#\$\%\&\'\(\)\*\+\,\.\/\:\;\<\=\>\?\@\\\^\_\`\|\{\}\~\-\[\]]+$/i;
		var isNotValid = false;

		// validation code
		if(!isEmpty(val)){
			if(val.length < 6 || val.length > 20){
				obj.hasError(true);
				obj.errorMessage(window.lang['error']['INVALID_PASSWORD_LENGTH']);
				return;
			}

			if(!regex.test(val)){
				obj.hasError(true);
				obj.errorMessage(window.lang['error']['INVALID_PASSWORD_FORMAT']);
			}
		}
	}

	validate(obj());
	obj.subscribe(validate);

	return obj;
};
