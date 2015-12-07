var MyInfoRequestWithdrawal = function(parent){
	var self = this;
	var modal = $("#MyInfoRequestWithdrawal");

	self.parent = parent;
	self.button = new ButtonClass();
	self.error = new ErrorClass();
	self.pspList = [
		{
			"code" : "bank",
			"name" : window.lang['string']['pspBank']
		},
		{
			"code" : "neteller",
			"name" : window.lang['string']['pspNeteller']
		},
		{
			"code" : "skrill",
			"name" : window.lang['string']['pspSkrill']
		},
		{
			"code" : "ibanq",
			"name" : window.lang['string']['pspIbanq']
		}
	];
	self.psp = ko.observable(self.pspList[0]['code']);
	self.pspClass = function(val){
		return val == self.psp() ? 'active' : '';
	};
	self.setPsp = function(val){
		if(self.button.status()) return;
		self.psp(val);
		self.loadData();
	};
	self.isBank = ko.computed(function(){
		return self.psp() == self.pspList[0]['code'];
	});

	self.amount = ko.observable('').extend({'decimal':{
		'required': true,
		'digit': 2,
		'onlyNum': true
	}});
	self.amountView = ko.computed(function(){
		var rst = parseInt(self.amount);
		if(self.amount.hasError()){
			rst = self.amount();
		}else{
			rst = number_format(self.amount(), 2);
		}
		return rst;
	});
	self.amountPlaceholder = ko.computed(function(){
		var rst = number_format(self.amount.minValue(), 2) + ' ~ ' + number_format(self.amount.maxValue(), 2);
		return rst;
	});
	self.visibleAmountView = ko.observable(true);

	self.bankName = ko.observable('').extend( { 'required': { "required": true } } );
	self.pspId = ko.observable('').extend( { 'required': { "required": true } } );
	self.bankAddress = ko.observable('').extend( { 'required': { "required": true } } );
	self.accountName = ko.observable('').extend( { 'required': { "required": true } } );
	self.accountNumber = ko.observable('').extend( { 'required': { "required": true } } );
	self.swiftCode = ko.observable('').extend( { 'required': { "required": true } } );
	self.iban = ko.observable('');
	self.comment = ko.observable('');
	self.succeeded = ko.observable(false);

	self.expectedResult = ko.computed(function(){
		var rst = '';
		rst = dataFormat(self.parent.myBalance(), 'money');
		if(!isEmpty(self.amount()) && !self.amount.hasError()){
			rst +=  '<span class="text-danger"> - ' + dataFormat(unNumber_format(self.amount()), 'money') + '</span>';
		}
		return rst;
	});

	self.requestWithdrawalEmail = window.lang['string']['requestWithdrawalEmail'].replace(/\{email\}/g, window.supportEmail['cashier']);

	self.cssEmpty = function(val){
		return isEmpty(val) ? 'text-right' : 'text-left';
	};

	self.setAmount = function(way){
		switch(way){
			case 'min':
				self.amount(number_format(self.amount.minValue(), 2));
				break;
			case 'max':
				self.amount(number_format(self.amount.maxValue(), 2));
				break;
		}
	};

	self.submitStatus = ko.computed(function(){
		var rst;
		if(self.isBank()){
			rst = self.amount.hasError() || self.bankName.hasError() || self.bankAddress.hasError() || self.accountName.hasError() || self.swiftCode.hasError() || self.accountNumber.hasError();
		}else{
			rst = self.amount.hasError() || self.pspId.hasError();
		}
		return rst;
	});
	self.submitDisabled = ko.computed(function(){
		return self.button.status() || self.submitStatus() ? 'disabled' : '';
	});

	self.reset = function(){
		self.amount('');
		self.pspId('');
		self.bankName('');
		self.bankAddress('');
		self.accountName('');
		self.accountNumber('');
		self.swiftCode('');
		self.iban('');
		self.comment('');
	};

	self.loadData = function(){
		if(self.button.status()) return;
		self.error.reset();
		self.button.load();
		self.reset();

		var params = { "http_method" : 'get' };

		$.ajaxSetup({ cache: false, async: true });
		$.post('/ams/payments/' + self.psp() + '/preset', params, function(data){
			data = checkSessionExpired(data);
			if(data.error == 0){
				self.accountName(data.body.accountName);
				self.accountNumber(data.body.accountNumber);
				self.bankAddress(data.body.bankAddress);
				self.bankName(data.body.bankName);
				self.comment(data.body.comments);
				self.swiftCode(data.body.swiftCode);
				self.iban(data.body.iban);
				self.pspId(data.body.accountId);
			} else {
				gritter(0, data);
			}
			self.button.reset();
		}, 'json');
	};

	self.load = function(){
		self.reset();
		self.psp(self.pspList[0]['code']);
		self.button.reset();
		self.error.reset();
		self.amount.minValue(500);
		modal.modal('show');
		self.loadData();
		self.succeeded(false);
	};

	self.save = function(){
		if(self.button.status()) return;
		self.error.reset();
		self.button.load();

		var params = {
			"http_method" : 'post',
			"bankName": self.bankName(),
			"bankAddress": self.bankAddress(),
			"accountName": self.accountName(),
			"accountNumber": self.accountNumber(),
			"swiftCode": self.swiftCode(),
			"iban": self.iban(),
			"accountId": self.pspId(),
			"comments": self.comment()
		};

		$.ajaxSetup({ cache: false, async: true });
		$.post('/ams/payments/' + self.psp() + '/preset', params, function(data){
			data = checkSessionExpired(data);
			if(data.error == 0){
				gritter(1, window.lang['success']['SAVED']);
			} else {
				self.error.msg(data);
			}
			self.button.reset();
		}, 'json');
	};

	self.submit = function(){
		if(self.submitStatus()) return;
		self.error.reset();
		self.button.load();
		self.parent.button.load();

		$.ajaxSetup({ cache: false, async: true });
		$.post('/ams/Common/getMyBalance', null, function(data){
			data = checkSessionExpired(data);
			if(data.error == 0){
				self.parent.myBalance(data.body['balance']);
				self.parent.maxWithdrawalBalance(data.body['maxWithdrawalBalance']);
				self.amount.maxValue(data.body['maxWithdrawalBalance']);
				self.amount.ruleMessage(window.lang['error']['INVALID_REQUEST_WITHDRAWAL_AMOUNT'].replace('{min}', number_format(self.amount.minValue(), 2)).replace('{max}', number_format(self.amount.maxValue(), 2)));

				if(parseFloat(data.body['maxWithdrawalBalance']) < parseFloat(self.amount())){
					var dummy = self.amount();
					self.amount('');
					self.amount(dummy.toString());
					self.button.reset();
					self.parent.button.reset();
					return;
				}

				if(parseFloat(data.body['balance']) < 1000){
					modal.modal('hide');
					$('.myBalanceA').show();
					self.button.reset();
					self.parent.button.reset();
					gritter(0, 'BALANCE_NOT_ENOUGH');
					return;
				}

				if(self.submitStatus()) return;

				var params = {
					"http_method" : 'post',
					"bankName": self.bankName(),
					"bankAddress": self.bankAddress(),
					"accountName": self.accountName(),
					"accountNumber": self.accountNumber(),
					"swiftCode": self.swiftCode(),
					"iban": self.iban(),
					"accountId": self.pspId(),
					"amount": self.amount(),
					"comments": self.comment()
				};

				$.ajaxSetup({ cache: false, async: true });
				$.post('/ams/payments/' + self.psp() + '/request-withdrawal', params, function(data){
					data = checkSessionExpired(data);
					if(data.error == 0){
						self.succeeded(true);
						self.parent.getMyBalance();
					} else {
						self.error.msg(data);
					}
					self.button.reset();
				}, 'json');
			}else{
				self.error.msg(data);
			}
			self.parent.button.reset();
		}, 'json');


	};
};

var MyInfoDetail = function(parent){
	var self = this;
	var modal = $("#MyInfoDetail");
	self.data = ko.observableArray([]);
	self.detail = ko.observableArray([]);

	self.parent = parent;

	self.mode = ko.observable('');
	self.title = ko.computed(function(){
		var rst;
		switch (self.mode()){
			case "commission":
				rst = window.lang['title']['commissionView'];
				break;
			case "subcommission":
				rst = window.lang['title']['subCommissionView'];
				break;
			case "rakeback":
				rst = window.lang['title']['rakebackView'];
				break;
		}
		return rst;
	});

	self.url = ko.computed(function(){
		var rst;
		switch (self.mode()){
			case "commission":
				rst = 'ams/info/my/detail/commission/' + self.data().id;
				break;
			case "subcommission":
				rst = 'ams/info/my/detail/subcommission/' + self.data().id;
				break;
			case "rakeback":
				rst = 'ams/info/my/detail/rakeback/' + self.data().id;
				break;
		}
		return rst;
	});

	self.buttons = new ButtonClass();

	self.formatObj = ko.computed(function(){
		var rst = {
			"money": ['ngr', 'rakeback']
		};
		return rst;
	});

	var dtOption = {
		url: self.url(),
		pageId: 'MyInfoRakebackView',
		useCheck: false,
		autoLoad: false,
		useSetPage: false,
		useButtons: false,
		useDownload: false,
		pagingType: 'simple_buttons',
		fnDataRebuild: function(row){
			row.rakebackPercent = row.rakebackPercent + '%';
			return covertFormat(row, self.formatObj());
		}
	};

	self.DT = new DataTableClass(dtOption, self);

	self.params = ko.computed(function(){
		return {

		}
	});

	self.loadReset = function(){
		if(self.DT.oTable != null){
			self.DT.options.ajax.url = self.url();
			self.DT.redraw(window.DTPreset['MyInfoRakebackView']);
		}else{
			self.DT.init(self.DT.element, window.DTPreset['MyInfoRakebackView'], false);
			self.DT.options.ajax.url = self.url();
			self.DT.load();
		}
	};

	self.getDetailData = function(){
		var formData = {
			"http_method": "get",
			"id": self.data().id
		};
		$.ajaxSetup({ cache: false });
		$.post(self.url(), formData, function(data) {
			data = debugLog(data);
			self.detail(data.body);
		},'json');
	};

	self.init = function(){

	};

	self.load = function(ele){
		var data = json_decode($(ele).parent().attr('data'));
		self.data([]);
		self.detail([]);
		self.mode(data.type);
		self.data(data);
		switch (data.type){
			case "rakeback":
				self.loadReset();
				break;
			default:
				self.getDetailData();
				break;
		}
		modal.modal('show');
	};
};


var MyInfo = function(module){
	var self = this;

	self.detailView = new MyInfoDetail(self);
	self.button = new ButtonClass();

	self.offset = window.userData['timezoneOffset'] / (1000 * 60);
	self.dateFrom = ko.observable(moment().utcOffset(self.offset).subtract(6, 'days').startOf('day').format('YYYY-MM-DDTHH:mm:ssZ'));
	self.dateTo = ko.observable(moment().utcOffset(self.offset).endOf('day').format('YYYY-MM-DDTHH:mm:ssZ'));

	self.formatObj = ko.computed(function(){
		var rst = {
			"money": ['amount', 'balance'],
			"datetimeAbs": ['date']
		};
		return rst;
	});

	var tableId = 'myInfoTable';
	var dtOption = {
		url: '/ams/info/my/list',
		useCheck: false,
		autoLoad: false,
		useDownload: false,
		fnDataRebuild: function(row){
			switch(row.type){
				case 'commission':
					row.description = window.lang['columns']['commission'];
					break;
				case 'subcommission':
					row.description = window.lang['columns']['subCommission'];
					break;
                case 'transfer_o2a': case 'transfer_a2a': case 'transfer_a2p':
					row.descriptionArr = row.description.split(' ');
					row.username = row.descriptionArr[2];
					if(row.type == 'transfer_o2a') row.username = '(GGNetwork)';
					switch(row.direction){
						case 'from':
							row.description = window.lang['string']['creditFrom'].replace('{who}', row.username);
							break;
						case 'to':
							row.description = window.lang['string']['debitTo'].replace('{who}', row.username);
							break;
					}
					switch(row.type){
						case 'transfer_a2a':
							row.description += ' (Agent)';
							break;
						case 'transfer_a2p':
							row.description += ' (Player)';
							break;
					}
					break;
				case 'request_withdrawal':
					row.descriptionArr = row.description.split(' ');
					row.description = window.lang['string']['requestWithdrawalTo'].replace('{value}', row.descriptionArr[3]);
					break;
			}
			row = covertFormat(row, self.formatObj());

			var json = json_encode(row);
			switch(row.type){
				case 'commission':
					if(window.userData['tier'] != 0) break;
				case 'subcommission':
				case 'rakeback':
					row.description += '<span data=\''+ json +'\'><span class="detailViewLink"></span></span>';
					break;
			}
			return row;
		},
		drawCallback: function(){
			var html = '<a class="margin-left-10 " data-bind="click: function(){ parent.detailView.load($element); }"><u>' + window.lang['string']['view'] + '</u></a>';
			window.templateEngine.addTemplate(self.DT.element, tableId + "_DT_detailViewLink", html);
			var container = self.DT.element.find('.detailViewLink');
			$.each(container, function(i, row){
				ko.renderTemplate(tableId + "_DT_detailViewLink", self.DT, {templateEngine: window.templateEngine}, row, "replaceNode");
			});
		},
		"order": [[0,"desc"]]
	};

	self.DT = new DataTableClass(dtOption, self);

	self.myBalance = ko.observable(0);
	self.maxWithdrawalBalance = ko.observable(0);
	self.checkBalance = ko.observable(false);
	self.requestWithdrawalStatus = ko.computed(function(){
		return self.checkBalance() && (self.myBalance() < 1000 || self.button.status() || self.DT.button.status());
	});
	self.requestWithdrawalClassDisabled = ko.computed(function(){
		var rst = '';
		if(self.requestWithdrawalStatus()){
			rst = 'disabled';
		}
		return rst;
	});
	self.requestWithdrawalClassLoading = ko.computed(function(){
		var rst = 'fa-dollar'
		if(self.button.status() || self.DT.button.status()){
			rst = 'fa-spin fa-spinner';
		}
		return rst;
	});
	self.requestWithdrawal = new MyInfoRequestWithdrawal(self);

	self.getMyBalance = function(requestWithdrawal){
		if(self.button.status()) return;
		if(requestWithdrawal && self.requestWithdrawalStatus()){
			return;
		}
		self.button.load();
		$.ajaxSetup({ cache: false, async: true });
		$.post('/ams/Common/getMyBalance', null, function(data){
			data = checkSessionExpired(data);
			if(data.error == 0){
				self.myBalance(data.body['balance']);
				self.maxWithdrawalBalance(data.body['maxWithdrawalBalance']);
				self.requestWithdrawal.amount.maxValue(data.body['maxWithdrawalBalance']);
				self.requestWithdrawal.amount.ruleMessage(window.lang['error']['INVALID_REQUEST_WITHDRAWAL_AMOUNT'].replace('{min}', number_format(self.requestWithdrawal.amount.minValue(), 2)).replace('{max}', number_format(self.requestWithdrawal.amount.maxValue(), 2)));
			}else{
				self.myBalance(window.lang['string']['error']);
			}
			self.button.reset();
			if(!isEmpty(requestWithdrawal)){
				self.checkBalance(true);
				if(self.requestWithdrawalStatus() == true){
					$('.myBalanceA').show();
				}else{
					self.requestWithdrawal.load();
				}
			}
		}, 'json');
	};


	self.params = ko.computed(function(){
		return {
			"startDate": self.dateFrom(),
			"endDate": self.dateTo()
		}
	});

	self.loadReset = function(){
		self.DT.init(self.DT.element, window.DTPreset['MyInfo'], false);
		self.DT.load();
		self.getMyBalance();
	};

	self.init = function(id, params){};

	self.load = function(id, params){
		self.loadReset();
	};
};