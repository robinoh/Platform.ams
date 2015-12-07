var Login = function(token){
	var self = this;

	self.error = new ErrorClass(self);
	self.button = new ButtonClass(self);

	self.username = ko.observable('').extend({ 'required': { "required": true } });
	self.password = ko.observable('').extend({ 'required': { "required": true } });
	self.usernameForgot = ko.observable('').extend({ 'required': { "required": true } });
	self.visibleForgot = ko.observable(false);

	self.submitStatus = ko.computed(function(){
		return self.button.status() || self.username.hasError() || self.password.hasError();
	});
	self.submitDisabled = ko.computed(function(){
		return (self.submitStatus()) ? 'disabled' : '';
	});
	self.submitStatus2 = ko.computed(function(){
		return self.button.status() || self.usernameForgot.hasError();
	});
	self.submitDisabled2 = ko.computed(function(){
		return (self.submitStatus2()) ? 'disabled' : '';
	});

	self.toggleVisibleForgot = function(){
		var rst = self.visibleForgot();
		self.visibleForgot(!rst);
		self.usernameForgot('');
		if(!rst == true){
			$('#inputUsernameForgot').trigger('focus');
		}
	};

	self.login = function(){
		if(self.submitStatus()) return;
		self.button.load();
		self.error.reset();

		var params = {
			"username" : self.username(),
			"password" : self.password()
		};
		$.ajaxSetup({ cache: false, async: true });
		$.post("/ams/Common/login", params, function(data){
			if(data.error == 0){
				location.href = '/MyInfo'
			}else{
				if(data.body == 'AMS_SIGNIN_USERNAME_NOT_FOUND'){
					self.username.hasError(true);
					self.username.errorMessage(replaceErrorCode(data));
					$('#inputUsername').trigger('focus');
				}else if(data.body == 'AMS_SIGNIN_BAD_CREDENTIALS'){
					self.password.hasError(true);
					self.password.errorMessage(replaceErrorCode(data));
					$('#inputPassword').trigger('focus');
				}else{
					self.error.msg(data);
				}
			}
			self.button.reset();
		}, 'json');
	};

	self.forgotPassword = function(){
		if(self.submitStatus2()) return;
		self.button.load();
		self.error.reset();

		var params = {
			"http_method" : 'post',
			"usernameOrEmailAddress" : self.usernameForgot(),
			"validationPath" : location.protocol + '//' + location.host + '/ResetPassword'
		};
		$.ajaxSetup({ cache: false, async: true });
		$.post("/ams/agents/forgotPassword", params, function(data){
			if(data.error == 0){
				self.usernameForgot.errorMessage(window.lang['success']['resetPassword'].replace("{email}", data.body['emailAddress']));
			}else{
				self.usernameForgot.hasError(true);
				self.usernameForgot.errorMessage(replaceErrorCode(data));
				$('#inputUsernameForgot').trigger('focus');
			}
			self.button.reset();
		}, 'json');
	};

	self.load = function(){
	};
};