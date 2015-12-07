var AgentsCtrl = function(parent){
	var self = this;
	self.parent = parent;

	self.button = new ButtonClass();
	self.error = new ErrorClass(self);

	self.pageObj = $('#' + self.parent.module.id);

	var modal = $("#AgentsModal");

	self.mode = ko.observable('create');

	var title = {
		'create': window.lang['title']['createAgent'],
		'edit': window.lang['title']['editAgent']
	};
	self.title = ko.computed(function(){
		return title[self.mode()];
	});

	self.agents = ko.computed(function(){
		return self.parent.agentTree();
	});
	self.agentType = ko.observable('NonRakeback');
	self.agentTypeText = ko.computed(function(){
		return self.agentType() == 'NonRakeback' ? window.lang['label']['nonRakeback']: window.lang['label']['rakeback'];
	});
	self.typeClass = function(val, data){
		return val == data ? 'fa-check-circle' : 'fa-circle-o';
	};
	self.authority = ko.observable();
	self.ableChooseAgentType = ko.computed(function(){
		return self.authority() == 'LABEL';
	});

	self.agentCode = ko.observable('');
	self.hierarchyId = ko.observable('');
	self.language = ko.observable('');
	self.parentCommission = ko.observable(100);

	self.commission = ko.observable('').extend({ 'number': { "minValue": 0, "maxValue": parseInt(self.parentCommission()), "required": true, 'message': '' } });
	self.commissionPlaceholder = ko.computed(function(){
		return '0 ~ ' + self.parentCommission();
	});

	self.rakeback = ko.observable('').extend({ 'number': { "minValue": 0, "maxValue": parseInt(self.commission()), "required": true, 'message': '' } });
	self.rakebackPlaceholder = ko.computed(function(){
		if(isEmpty(self.commission()) || typeof parseInt(self.commission()) != 'number'){
			self.rakeback.maxValue(0);
			if(!isEmpty(self.rakeback())){
				self.rakeback.hasError(true);
				self.rakeback.errorMessage(window.lang['error']['RAKEBACK_FILLED_BEFORE_COMMISSION']);
				self.rakeback.ruleMessage(window.lang['error']['RAKEBACK_FILLED_BEFORE_COMMISSION']);
			}else{
				self.rakeback.ruleMessage(window.lang['error']['RANGE_INPUT'].replace('{min}', 0).replace('{max}', 0));
			}
			return window.lang['placeholder']['rakebackBeforeCommission'];
		}else{
			self.rakeback.maxValue(parseInt(self.commission()));
			self.rakeback.ruleMessage(window.lang['error']['RANGE_INPUT'].replace('{min}', 0).replace('{max}', self.commission()));
			return '0 ~ ' + self.commission();
		}
	});
	self.rakebackCheck = function(){
		var dummy = self.rakeback();
		self.rakeback('');
		self.rakeback(dummy);
	};

	self.emailAddress = ko.observable('').extend({ 'EmailAddress': { "required": true, 'message': window.lang['error']['INVALID_EMAIL'] } });
	self.prevEmailAddress = ko.observable('');
	self.preparing = ko.observable(false);

	self.personalInfoAccess = ko.observable(true);
	self.balanceAccess = ko.observable(true);
	self.suspended = ko.observable(false);

	// submit button
	self.submitStatus = ko.computed(function(){
		var rst = false;
		if(self.mode() == 'create'){
			rst = self.commission.hasError() || self.rakeback.hasError() || self.emailAddress.hasError();
		}else{
			rst = self.commission.hasError() || self.rakeback.hasError() || self.emailAddress.hasError();
		}
		return rst;
	});
	self.submitDisabled = ko.computed(function(){
		return (self.submitStatus()) ? 'disabled' : '';
	});

	self.setParent = function(data){
		self.reset();
		if(self.mode() == 'create'){
			if(!in_array(data.agentType,['Rakeback','NonRakeback'])){
				self.changeAgentType('NonRakeback');
			}else{
				self.changeAgentType(data.agentType);
			}
			self.authority(data.authority);
		}
		if (typeof data.commissionPercent != 'number') data.commissionPercent = 100;
		self.hierarchyId(data.hierarchyId);
		self.parentCommission(data.commissionPercent);
		self.commission.maxValue(self.parentCommission());
		self.commission.ruleMessage(window.lang['error']['RANGE_INPUT'].replace('{min}', 0).replace('{max}', self.parentCommission()));
	};

	self.changeAgentType = function(agentType){
		self.agentType(agentType);
		self.rakeback.EditRequired(agentType == 'Rakeback');
	};

	self.reset = function(){
		self.agentCode('');
		self.hierarchyId('');
		self.commission('');
		self.rakeback('');
		self.emailAddress('');
		self.prevEmailAddress('');
		self.personalInfoAccess(true);
		self.balanceAccess(true);
		self.language('en_US');
		self.pageObj.find(".langSelect2").select2('val', window.language[0]['code']);
	};

	self.save = function(){

		if(self.agentType() == 'Rakeback'){
			var dummy = self.rakeback();
			self.rakeback('');
			self.rakeback(dummy);
		}
		if(self.button.status() || self.submitStatus()) return;
		self.button.load();
		self.error.reset();

		if(self.mode() == 'create'){
			var params = {
				"http_method": 'post',
				"agentType": self.agentType(),
				"commission": self.commission(),
				"rakeback": self.agentType() == 'Rakeback' ? self.rakeback(): 0,
				"emailAddress": self.emailAddress(),
				"hasPersonalInfoAccess": self.personalInfoAccess(),
				"hasBalanceAccess": self.balanceAccess(),
				"validationPath": location.protocol + '//' + location.host + '/AcceptInvitation',
				"language": self.language()
			};

			$.ajaxSetup({ cache: false, async: true });
			$.post('/ams/agents/invite/' + self.hierarchyId(), params, function(data){
				data = checkSessionExpired(data);
				if(data.error == 0){
					gritter(1, window.lang['success']['newAgentCreated']);
					self.reset();
					self.parent.getAgents();
					modal.modal('hide');
				}else{
					if(!isEmpty(data.comment) && !isEmpty(data.comment['parentCommissionPercent'])) data.comment = data.comment['parentCommissionPercent'];
					if(!isEmpty(data.comment) && !isEmpty(data.comment['highestChildCommissionRatio'])) data.comment = data.comment['highestChildCommissionRatio'];

					self.error.msg(data);
				}
				self.button.reset();
			},'json');
		}else{
			var params = {
				"http_method": 'post',
				"commission": self.commission(),
				"defaultRakeback": self.agentType() == 'Rakeback' ? self.rakeback(): 0,
				"hasPersonalInfoAccess": self.personalInfoAccess(),
				"hasBalanceAccess": self.balanceAccess(),
				"status": self.suspended() ? 'Suspend':'Active'
			};
			if(self.preparing() && self.prevEmailAddress() != self.emailAddress()){
				params.emailAddress = self.emailAddress();
				params.validationPath = location.protocol + '//' + location.host + '/AcceptInvitation';
			}
			if(self.preparing()){
				params.language = self.language();
			}

			$.ajaxSetup({ cache: false, async: true });
			$.post('/ams/agents/update/' + self.hierarchyId(), params, function(data){
				data = checkSessionExpired(data);
				if(data.error == 0){
					gritter(1, window.lang['success']['agentUpdated']);
					self.reset();
					self.parent.getAgents();
					modal.modal('hide');
				}else{
					if(!isEmpty(data.comment) && !isEmpty(data.comment['parentCommissionPercent'])) data.comment = data.comment['parentCommissionPercent'];
					if(!isEmpty(data.comment) && !isEmpty(data.comment['highestChildCommissionRatio'])) data.comment = data.comment['highestChildCommissionRatio'];

					self.error.msg(data);
				}
				self.button.reset();
			},'json');
		}
	};

	self.init = function(){

	};

	self.load = function(mode, data){
		self.mode(mode);
		modal.modal('show');
		self.reset();
		self.button.reset();
		self.error.reset();

		if(self.mode() == 'create'){
			var html = '\
				<div class="entity-selector select2" style="width: 100%;"></div>\
			';

			var obj = $('#selectAgent');
			window.bindTo(self, "selectAgent_agent_search", self.pageObj, obj, html);

			self.element = self.pageObj.find('.entity-selector');
			self.element.select2({
				data: self.agents(),
				containerCssClass: ''
			});

			self.element.on("select2-selecting", function(e){
				self.setParent(e.object);
			});
			self.element.select2('val', self.agents()[0].id);

			self.setParent(self.agents()[0]);
			self.emailAddress.EditRequired(true);
		}else{
			self.setParent(self.parent.agents()[data.parentIndex]);
			self.hierarchyId(data.hierarchyId);
			self.changeAgentType(data.agentType);
			self.commission(data.commissionPercent);
			self.rakeback(data.defaultRakebackPercent);
			self.emailAddress(data.emailAddress);
			self.prevEmailAddress(data.emailAddress);
			self.personalInfoAccess(data.hasPersonalInfoAccess);
			self.balanceAccess(data.hasBalanceAccess);
			self.suspended(data.suspended);
			self.emailAddress.EditRequired(!isEmpty(data.emailAddress) || data.emailAddress.length > 0);
			self.agentCode(data.name);
			self.preparing(data.preparing);
			self.language(data.language);
			self.pageObj.find(".langSelect2").select2('val', data.language);
		}
	};

	self.pageObj.find(".langSelect2").select2({
		dropdownCssClass : 'select2-hide-search'
	});
};

var AgentsTransfer = function(parent){
	var self = this;
	self.parent = parent;

	var modal = $("#AgentsTransfer");

	self.button = new ButtonClass();
	self.loading = new LoadingClass();

	self.data = ko.observable({});
	self.myBalance = ko.observable('');
	self.amount = ko.observable('').extend({ 'decimal': { "minValue": 0.01, "required": true, "digit": 2, "message": window.lang['error']['INVALID_BALANCE'] } });
	self.amountDp = ko.computed(function(){
		var rst = '';
		if(!isEmpty(self.amount()) && !self.amount.hasError()){
			if(self.mode() == 'credit'){
				rst = '<strong class="text-danger">(' + dataFormat(self.amount() * -1, 'money') + ')</strong>';
			}else if(self.mode() == 'debit'){
				rst = '<strong class="text-success">(+' + dataFormat(self.amount(), 'money') + ')</strong>';
			}
		}
		return rst;
	});
	self.mode = ko.observable('creditDebit');
	self.modeString = ko.computed(function(){
		return window.lang['label'][self.mode()];
	});
	self.status = ko.observable('input');
	self.agentBalance = ko.observable(0);

	// submit button
	self.submitStatus = ko.computed(function(){
		var rst = false;
		rst = self.button.status() || self.amount.hasError();
		return rst;
	});
	self.submitDisabled = ko.computed(function(){
		return (self.submitStatus()) ? 'disabled' : '';
	});

	self.getMyBalance = function(){
		self.loading.load();
		$.ajaxSetup({ cache: false, async: true });
		$.post('/ams/Common/getMyBalance', null, function(data){
			data = checkSessionExpired(data);
			if(data.error == 0){
				self.myBalance(data.body.balance);
				self.loading.totalItems(1);
			}else{
				self.loading.totalItems(0);
				gritter(0, data);
			}
		}, 'json');
	};

	self.credit = function(){
		if(self.submitStatus()) return;
		var myBalance = number_format(self.myBalance(), 2, '.', '');
		self.amount(self.amount().replace(/,/g, ''));
		//if(parseFloat(self.amount()) > parseFloat(myBalance)){
		//	self.amount(myBalance);
		//}
		self.mode('credit');
		self.status('confirm');
	};

	self.debit = function(){
		if(self.submitStatus()) return;
		var agentBalance = self.agentBalance();
		self.amount(self.amount().replace(/,/g, ''));
		//if(parseFloat(self.amount()) > parseFloat(agentBalance)){
		//	self.amount(agentBalance);
		//}
		self.mode('debit');
		self.status('confirm');
	};

	self.resultMessage = ko.observable('');
	self.resultError = ko.observable('');
	self.save = function(){
		if(self.submitStatus()) return;
		self.button.load();
		self.status('result');
		self.resultMessage('');
		self.resultError('');

		var params = {
			"http_method": 'post',
			"amount": self.amount()
		};

		$.ajaxSetup({ cache: false, async: true });
		$.post('/ams/agents/balance/' + self.mode() + '/' + self.data().financialAccountId, params, function(data){
			data = checkSessionExpired(data);
			if(data.error == 0){
				self.resultError(false);
				self.resultMessage(window.lang['string']['success']);
				self.parent.getAgents();
			}else{
				self.resultError(true);
				self.resultMessage(window.lang['string']['fail'] + ': ' + replaceErrorCode(data));
			}
			self.button.reset();
		},'json');
	};

	self.init = function(){

	};

	self.load = function(data){
		self.button.reset();
		self.amount('');
		self.status('input');
		self.data(data);
		self.resultMessage('');
		self.resultError('');
		self.agentBalance(parseFloat(number_format(self.data().balance, 2, '.', '')));
		self.getMyBalance();
		modal.modal('show');
	};
};

var AgentsMemo = function(parent){
	var self = this;

	var modal = $("#AgentsMemo");

	self.parent = parent;
	self.button = new ButtonClass();
	self.error = new ErrorClass(self);

	self.agentCode = ko.observable('');
	self.hierarchyId = ko.observable('');
	self.memo = ko.observable('');
	self.memoId = ko.observable('');
	self.memoExists = ko.observable(false);

	self.save = function(){
		if(self.button.status()) return;
		self.button.load();

		if(isEmpty(self.memoId()) && !isEmpty(trim(self.memo()))){
			var params = {
				"http_method": 'post',
				"memo": self.memo()
			};
			$.ajaxSetup({ cache: false, async: true });
			$.post('/ams/agents/memo/' + self.hierarchyId(), params, function(data){
				data = checkSessionExpired(data);
				if(data.error == 0){
					gritter(1, window.lang['success']['operationSuccess']);
					self.parent.getAgents();
					modal.modal('hide');
				}else{
					self.error.msg(data);
				}
				self.button.reset();
			},'json');
		}else if(isEmpty(self.memoId()) && isEmpty(trim(self.memo()))){
			modal.modal('hide');
		}else if(!isEmpty(self.memoId()) && !isEmpty(trim(self.memo()))){
			var params = {
				"http_method": 'post',
				"memo": self.memo()
			};
			$.ajaxSetup({ cache: false, async: true });
			$.post('/ams/agents/memo/' + self.hierarchyId() + '/' + self.memoId(), params, function(data){
				data = checkSessionExpired(data);
				if(data.error == 0){
					gritter(1, window.lang['success']['operationSuccess']);
					self.parent.getAgents();
					modal.modal('hide');
				}else{
					self.error.msg(data);
				}
				self.button.reset();
			},'json');
		}else{
			var params = {
				"http_method": 'delete'
			};
			$.ajaxSetup({ cache: false, async: true });
			$.post('/ams/agents/memo/' + self.hierarchyId() + '/' + self.memoId(), params, function(data){
				data = checkSessionExpired(data);
				if(data.error == 0){
					gritter(1, window.lang['success']['operationSuccess']);
					self.parent.getAgents();
					modal.modal('hide');
				}else{
					self.error.msg(data);
				}
				self.button.reset();
			},'json');
		}
	};

	self.remove = function(){
		if(self.button.status()) return;
		self.button.load();
		if(isEmpty(self.memoId())) return;
		var params = {
			"http_method": 'delete'
		};
		$.ajaxSetup({ cache: false, async: true });
		$.post('/ams/agents/memo/' + self.hierarchyId() + '/' + self.memoId(), params, function(data){
			data = checkSessionExpired(data);
			if(data.error == 0){
				gritter(1, window.lang['success']['operationSuccess']);
				self.parent.getAgents();
				modal.modal('hide');
			}else{
				self.error.msg(data);
			}
			self.button.reset();
		},'json');
	};

	self.getMemo = function(){
		if(self.button.status()) return;
		self.button.load();
		var params = {
			"http_method": 'get'
		};

		$.ajaxSetup({ cache: false, async: true });
		$.post('/ams/agents/memo/' + self.hierarchyId(), params, function(data){
			data = checkSessionExpired(data);
			if(data.error == 0){
				self.memo(data.body.memo);
				self.memoId(data.body.memoId);
			}else{
				self.error.msg(data);
			}
			self.button.reset();
		},'json');
	};

	self.init = function(){

	};

	self.load = function(data){
		self.button.reset();
		self.button.reset();
		self.memo('');
		self.memoId('');
		self.agentCode(data.name);
		self.hierarchyId(data.hierarchyId);
		self.memoExists(data.memoExists);
		modal.modal('show');
		if(self.memoExists()){
			self.getMemo();
		}
	};
};

var Agents = function(module){
	var self = this;
	self.module = module;
	self.button = new ButtonClass();

	self.loading = new LoadingClass();
	self.showSuspended = new SearchToggle('false');
	self.agents = ko.observableArray([]);
	self.agentTree = ko.observableArray([]);

	self.getAgents = function(){
		if(self.button.status() || self.loading.status()) return;
		self.loading.load();
		self.button.load();

		var params = {
			"http_method": 'get',
			"showSuspended": self.showSuspended.val().toString()
		};

		$.ajaxSetup({ cache: false, async: true });
		$.post('/ams/agents/tree', params, function(data){
			data = checkSessionExpired(data);
			if(data.error == 0){
				self.buildTree(data.body);
				self.agentTree(data.tree);
				self.loading.totalItems(data.body.length);
				self.button.reset();
				self.setCss();
			}else{
				gritter(0, data);
				self.loading.totalItems(0);
			}
		},'json');
	};

	self.buildTree = function(data){
		var rst = [];
		for(var i = 0; i < data.length; i++){
			data[i].display = {
				"suspended": data[i].suspended,
				"editable": data[i].depth > 0,
				"index": data[i].index,
				"parentIndex": data[i].parentIndex,
				"depth": data[i].depth,
				"paddingLeft" : (data[i].depth * 15 + 8) + 'px',
				"name" : data[i].name,
				"commission" : isEmpty(data[i].commissionPercent) ? '-' : data[i].commissionPercent + '%',
				"rakeback" : isEmpty(data[i].defaultRakebackPercent) || data[i].agentType != 'Rakeback' ? '-' : data[i].defaultRakebackPercent + '%',
				"balance" : isEmpty(data[i].balance) ? '-' : dataFormat(data[i].balance, 'money'),
				"playerCount" : isEmpty(data[i].playerCount) ? '-' : number_format(data[i].playerCount),
				"hasPersonalInfoAccess" : isEmpty(data[i].hasPersonalInfoAccess) ? '-' : data[i].hasPersonalInfoAccess ? window.lang['string']['yes'] : '<span class="text-danger">' + window.lang['string']['no'] + '</span>',
				"hasBalanceAccess" : isEmpty(data[i].hasBalanceAccess) ? '-' : data[i].hasBalanceAccess ? window.lang['string']['yes'] : '<span class="text-danger">' + window.lang['string']['no'] + '</span>',
				"emailAddress" : isEmpty(data[i].emailAddress) ? '-' : (data[i].isEmailVerified) ? data[i].emailAddress : window.lang['string']['verifyingNow'],
				"preparing" : (isEmpty(data[i].preparing) || !data[i].preparing) ? false : true,
				"hasChild": false
			};
			if(!isEmpty(data[i].parentIndex) && data[data[i].parentIndex]){
				data[data[i].parentIndex]['display']['hasChild'] = true;
			}
			rst.push(data[i]);
		}
		self.agents(rst);
	};

	self.visibleParent = ko.observableArray([]);
	self.toggleSub = function(index){
		var isShow = false;
		var number = index;
		if(in_array(index, self.visibleParent())){
			$(self.visibleParent()).each(function(key, val){
				if(val == index){
					isShow = false;
					number = key;
				}
			});
		}else{
			isShow = true;
		}
		if(isShow == true){
			self.visibleParent.push(number);
		}else{
			self.visibleParent.splice(number, 1);
		}
		self.setCss();
	};
	self.visibleSub = function(data){
		var rst = false;
		if(data.depth > 1){
			if(in_array(data.parentIndex, self.visibleParent())){
				return self.visibleSub(self.agents()[data.parentIndex]);
			}
		}else{
			rst = true;
		}
		return rst;
	};

	self.setCss = function(){
		$(".table-agent tbody:eq(0) tr:visible:odd").css('background','#f8f8f8');
		$(".table-agent tbody:eq(0) tr:visible:even").css('background','transparent');
		$(".table-agent tbody:eq(0) tr").each(function(i){
			self.setCollapseCss(i);
		});
	};

	self.setCollapseCss = function(index){
		var obj = $(".table-agent tbody tr:eq(" + index + ") td:eq(0) i");
		obj.removeClass('text-success');
		obj.removeClass('text-danger');
		obj.removeClass('fa-minus-square-o');
		obj.removeClass('fa-plus-square-o');
		if(in_array(index, self.visibleParent())){
			obj.addClass('text-danger fa-minus-square-o');
		}else{
			obj.addClass('text-success fa-plus-square-o');
		}
	};

	self.showSuspendedLoad = function(){
		if(self.button.status() || self.loading.status()) return;
		self.showSuspended.toggle();
		self.getAgents();
	};

	self.create = function(){
		if(self.button.status() || self.loading.status()) return;
		self.modalCtrl.load('create');
	};

	self.edit = function(data){
		if(self.button.status() || self.loading.status()) return;
		self.modalCtrl.load('edit', data);
	};

	self.transfer = function(data){
		if(self.button.status() || self.loading.status()) return;
		self.modalTransfer.load(data);
	};

	self.memo = function(data){
		if(self.button.status() || self.loading.status()) return;
		self.modalMemo.load(data);
	};

	self.resendEmail = function(data){
		self.button.load();
		self.loading.load();

		var params = {
			"http_method": 'post'
		};

		$.ajaxSetup({ cache: false, async: true });
		$.post('/ams/agents/invite/' + data.hierarchyId + '/resend', params, function(data){
			data = checkSessionExpired(data);
			if(data.error == 0){
				gritter(1, window.lang['success']['resentInvitationEmail']);
			}else{
				gritter(0, data);
			}
			self.loading.totalItems(1);
			self.button.reset();
		},'json');
	};

	self.init = function(){

	};

	self.load = function(){
		self.getAgents();
	};

	self.modalCtrl = new AgentsCtrl(self);
	self.modalTransfer = new AgentsTransfer(self);
	self.modalMemo = new AgentsMemo(self);
};