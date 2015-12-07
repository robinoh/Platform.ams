var AcceptInvitation = function(token){
	var self = this;

	self.error = new ErrorClass(self);
	self.button = new ButtonClass(self);

	self.token = token;
	self.verifying = ko.observable(false);
	self.verified = ko.observable(false);
	self.alertTitle = ko.computed(function(){
		return self.verifying() ? '<i class="fa fa-spinner fa-spin"></i> ' + window.lang['string']['verifyingNow'] : window.lang['title']['error'];
	});
	self.alertCss = ko.computed(function(){
		return self.verifying() ? 'alert-info' : 'alert-danger';
	});

	self.verify = function(){
		self.verifying(true);
		self.error.msg(window.lang['string']['pleaseWait']);
		var params = {
			"http_method": "get"
		};
		$.ajaxSetup({ cache: false, async: true });
		$.post("/ams/agents/token/invitation/" + self.token, params, function(data){
			self.error.reset();
			self.verifying(false);
			if(data.error == 0){
				self.verified(true);
			}else{
				self.error.msg(replaceErrorCode(data));
			}
		}, 'json');
	};

	self.agentCode = ko.observable('').extend({ 'invitationAgentCode': { "required": true } });
	self.password = ko.observable('').extend({ 'invitationPassword': { "required": true } });
	self.confirmPassword = ko.observable('');
	self.confirmPasswordHasError = ko.computed(function(){
		var rst = false;
		if(self.password() != self.confirmPassword()) rst = true;
		return rst;
	});
	self.confirmPasswordClass = ko.computed(function(){
		var rst;
		if(self.confirmPasswordHasError() && !self.password.hasError()){
			rst = 'has-error';
		} else {
			rst = (!self.password.hasError() && !isEmpty(self.confirmPassword())) ? 'has-success' : '';
		}
		return rst;
	});
	self.confirmPasswordMessage = ko.computed(function(){
		var rst = '';
		if(self.confirmPasswordHasError() && !self.password.hasError()){
			rst = window.lang['error']['PASSWORD_NOT_MATCH'];
		}
		return rst;
	});

	self.submitStatus = ko.computed(function(){
		return self.button.status() || self.agentCode.hasError() || self.password.hasError() || self.confirmPasswordHasError();
	});
	self.submitDisabled = ko.computed(function(){
		return (self.submitStatus()) ? 'disabled' : '';
	});

	self.checkAgentCode = function(){
		if(self.button.status() || self.agentCode.hasError()) return;
		self.button.load();

		var params = {
			"http_method": "get"
		};
		$.ajaxSetup({ cache: false, async: true });
		$.post("/ams/agents/exists/" + self.agentCode(), params, function(data){
			if(data.error == 0){
				if(data.body.exists == true){
					self.agentCode.hasError(true);
					self.agentCode.errorMessage(window.lang['error']['NOT_AVAILABLE'].replace('{code}', self.agentCode()));
				}
			}else{
				self.agentCode.hasError(true);
				gritter(0, replaceErrorCode(data));
			}
			self.button.reset();
		}, 'json');
	};

	self.accept = function(){
		if(self.submitStatus()) return;
		self.button.load();
		self.error.reset();

		var params = {
			"http_method": "post",
			"username": self.agentCode(),
			"password": self.password()
		};
		$.ajaxSetup({ cache: false, async: true });
		$.post("/ams/agents/token/update/username_password/" + self.token, params, function(data){
			if(data.error == 0){
				var params = "username=" + self.agentCode() +
					"&password=" + self.password();

				$.ajaxSetup({ cache: false });
				$.post("/ams/Common/login", params, function(tmp){
					if(tmp.error == 0){
						location.href = '/MyInfo'
					}else{
						self.error.msg(replaceErrorCode(data));
					}
					self.button.reset();
				}, 'json');
			}else{
				if(data.body == 'AMS_AGENT_UPDATE_ALREADY_EXISTS_USERNAME'){
					self.error.msg(window.lang['error']['AMS_AGENT_UPDATE_ALREADY_EXISTS_USERNAME'].replace("{code}", self.agentCode()));
				}else{
					self.error.msg(replaceErrorCode(data));
				}
			}
			self.button.reset();
		}, 'json');
	};

	self.load = function(){
		self.verify();
	};
};