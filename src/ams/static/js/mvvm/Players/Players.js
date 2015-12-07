var DepositHistory = function(parent){
	var self = this;
	var modal = $("#PlayersDepositHistory");
	self.data = ko.observableArray([]);
	self.detail = ko.observableArray([]);

	self.parent = parent;

	self.buttons = new ButtonClass();
	self.url = ko.computed(function(){
		var rst;
		rst = '/ams/players/list/deposit-history/' + self.data().userId;
		return rst;
	});

	var dtOption = {
		url: self.url(),
		pageId: 'PlayersDepositHistoryView',
		useCheck: false,
		autoLoad: false,
		useSetPage: false,
		useButtons: false,
		useDownload: false,
		pagingType: 'simple_buttons',
		fnDataRebuild: function(row){
			//row.date = convertDate(row.date, 'YYYY.MM.DD HH:mm:ss');
			row.date = dataFormat(row.date, 'datetimeAbs');
			row.amount = '<strong>' + dataFormat(row.amount, 'money') + '</strong>';
			return row;
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
			self.DT.redraw(window.DTPreset['PlayersDepositHistory']);
		}else{
			self.DT.init(self.DT.element, window.DTPreset['PlayersDepositHistory'], false);
			self.DT.options.ajax.url = self.url();
			self.DT.load();
		}
	};

	self.init = function(){

	};

	self.load = function(ele){
		var data = json_decode($(ele).parent().attr('data'));
		self.data([]);
		self.data(data);
		self.loadReset();
		modal.modal('show');
	};
};

var PlayersRakebackModal = function(parent){
	var self = this;
	self.parent = parent;
	var modal = $("#PlayersRakebackModal");

	self.error = new ErrorClass();
	self.button = new ButtonClass();

	self.step = ko.observable(0);
	self.rows = ko.observable([]);
	self.submitStatus = ko.computed(function(){
		if(self.button.status()) return true;
		for (var i=0; i<self.rows().length; i++){
			if(self.rows()[i].newRakeback.hasError()){
				return true;
			}
		}
		return false;
	});
	self.submitDisabled = ko.computed(function(){
		return self.submitStatus() ? 'disabled' : '';
	});
	self.submitErrorMsg = ko.computed(function(){
		var rst = '';
		if(self.submitStatus()){
			rst = window.lang['error']['INVALID_PERCENTAGE_RAKEBACK'];
		}
		return rst;
	});

	self.switchStep = function(step){
		if(self.submitStatus()) return;
		self.step(step);
	};

	self.displayResult = function(code, desc){
		var css = (code == 0) ? 'text-success' : 'text-danger';
		return '<span class="' + css + '">' + desc + '</span>';
	};

	self.setRows = function(rows){
		var data = [];
		for (var i=0; i<rows.length; i++){
			data.push({
				"userId": rows[i].userId,
				"username": rows[i].username  + "@" + rows[i].agent,
				"currentRakeback": rows[i].currentRakeback,
				"newRakeback": ko.observable(rows[i].currentRakeback).extend({ 'decimal': { 'required': true, 'loadCheck': true }}),
				"result": ko.observable(''),
				"code": ko.observable('')
			});
		}
		self.rows(data);
	};

	self.save = function(){
		if(self.submitStatus()) return;
		self.button.load();
		self.error.reset();

		for (var i=0; i<self.rows().length; i++){
			var row = self.rows()[i];
			if(isNaN(row.newRakeback()) || isEmpty(row.newRakeback())){
				self.rows()[i].result(window.lang['string']['resultNone']);
				continue;
			}

			var params = {
				"http_method": 'post',
				"rakebackPercent": row.newRakeback()
			};
			$.ajaxSetup({ cache: false, async: false });
			$.post('/ams/players/rakeback/' + row.userId, params, function(data){
				data = checkSessionExpired(data);

				self.rows()[i].code(data.error);

				if(data.error == 0){
					self.rows()[i].result(window.lang['string']['success']);
				}else{
					var comment = '';
					if(!isEmpty(data.comment) && !isEmpty(data.comment['parentRakebackPercent'])) comment = data.comment['parentRakebackPercent'];
					self.rows()[i].result(window.lang['string']['error'] + ': ' + replaceErrorCode(data.body).replace('{comment}', comment));
				}
			},'json');
			self.parent.DT.reload();
		}

		self.button.reset();
		self.step(2);
	};

	self.load = function(data){
		self.error.reset();
		self.step(0);
		self.rows([]);

		var rows = [];
		if(data){
			rows.push(data);
		}else{
			var list = self.parent.DT.getCheckRows();
			for (var i=0; i<list.length; i++) rows.push(list[i]);
		}
		self.setRows(rows);
		modal.modal('show');
	};
};

var PlayersCreditDebitModal = function(parent){
	var self = this;
	self.parent = parent;
	var modal = $("#PlayersCreditDebitModal");

	self.error = new ErrorClass();
	self.button = new ButtonClass();

	self.step = ko.observable(0);
	self.rows = ko.observable([]);
	self.myBalance = ko.observable(0);
	self.expectedAmount = ko.computed(function(){
		var data = self.rows();
		var rst = 0;
		$(data).each(function(k, v){
			if(!isEmpty(v.credit())) rst -= parseFloat(v.credit());
			if(!isEmpty(v.debit())) rst += parseFloat(v.debit());
		});
		return rst;
	});
	self.expectedAmountDp = ko.computed(function(){
		var css;
		if(self.expectedAmount() < 0){
			css = 'text-danger';
		}else if(self.expectedAmount() > 0){
			css = 'text-success';
		}else{
			return '';
		}

		var rst = '<span class="' + css + '">(' + dataFormat(self.expectedAmount(), 'money') + ')';
		return rst;
	});

	self.submitStatusKind = ko.observable('');
	self.submitStatus = ko.computed(function(){
		if(self.button.status()) return true;
		var rst = false;
		var totalCredit = 0;
		var totalDebit = 0;
		for (var i=0; i<self.rows().length; i++){
			if(self.rows()[i].credit.hasError() || self.rows()[i].debit.hasError()){
				self.submitStatusKind('INVALID_AMOUNT');
				return true;
			}
			if(!isEmpty(self.rows()[i].credit())) totalCredit += self.rows()[i].credit();
			if(!isEmpty(self.rows()[i].debit())) totalDebit += self.rows()[i].debit();
		}
		if(totalCredit <= 0 && totalDebit <= 0){
			rst = true;
			self.submitStatusKind('');
		}
		return rst;
	});
	self.submitDisabled = ko.computed(function(){
		return self.submitStatus() ? 'disabled' : '';
	});
	self.submitErrorMsg = ko.computed(function(){
		var rst = '';
		if(self.submitStatusKind()){
			if(!isEmpty(self.submitStatusKind())) rst = window.lang['error'][self.submitStatusKind()];
		}
		return rst;
	});

	self.getMyBalance = function(){
		$.ajaxSetup({ cache: false, async: true });
		$.post('/ams/Common/getMyBalance', null, function(data){
			data = checkSessionExpired(data);
			self.myBalance(data.body.balance);
		}, 'json');
	};

	self.switchStep = function(step){
		if(self.submitStatus()) return;
		self.step(step);
	};

	self.displayResult = function(code, desc){
		var css = (code == 0) ? 'text-success' : 'text-danger';
		return '<span class="' + css + '">' + desc + '</span>';
	};

	self.setRows = function(rows){
		var data = [];
		for (var i=0; i<rows.length; i++){
			data.push({
				"userId": rows[i].userId,
				"username": rows[i].username  + "@" + rows[i].agent,
				"balance": ko.observable(rows[i].balance),
				"credit": ko.observable('').extend({ 'decimal': {'digit' : 2}}),
				"debit": ko.observable('').extend({ 'decimal': {'digit' : 2}}),
				"result": ko.observable(''),
				"code": ko.observable('')
			});
		}
		self.rows(data);
	};

	self.save = function(){
		if(self.submitStatus()) return;
		self.button.load();
		self.error.reset();

		for (var i=0; i<self.rows().length; i++){
			var row = self.rows()[i];
			if((isNaN(row.credit()) || row.credit()) <= 0 && (isNaN(row.debit()) || row.debit() <= 0)){
				self.rows()[i].result(window.lang['string']['resultNone']);
				continue;
			}

			var type = !isNaN(row.credit()) && row.credit() > 0 ? 'credit' : 'debit';
			var url = '/ams/players/balance/' + type + '/' + row.userId;
			var params = {
				"http_method": 'post',
				"amount": type == 'credit' ? row.credit() : row.debit()
			};
			$.ajaxSetup({ cache: false, async: false });
			$.post(url, params, function(data){
				data = checkSessionExpired(data);

				self.rows()[i].code(data.error);

				if(data.error == 0){
					self.rows()[i].balance(dataFormat(data.body.endBalance, 'money'));
					self.rows()[i].result(window.lang['string']['success']);
				}else{
					if(!isEmpty(window.lang['error'][data.body])){
						self.rows()[i].result(window.lang['string']['error'] +': ' + window.lang['error'][data.body]);
					}else{
						self.rows()[i].result(window.lang['string']['error'] +': ' + data.body);
					}
				}
			},'json');
		}

		self.button.reset();
		self.step(2);
		self.getMyBalance();
		self.parent.DT.reload();
	};

	self.load = function(data){
		self.error.reset();
		self.step(0);
		self.rows([]);
		self.getMyBalance();

		var rows = [];
		if(data){
			rows.push(data);
		}else{
			var list = self.parent.DT.getCheckRows();
			for (var i=0; i<list.length; i++) rows.push(list[i]);
		}
		self.setRows(rows);
		modal.modal('show');
	};
};

var Players = function(module){
	var self = this;
	var id = module.id;

	self.depositHistoryView = new DepositHistory(self);
	self.transfer = new PlayersCreditDebitModal(self);
	self.playersRakeback = new PlayersRakebackModal(self);

	var agentOptions = {
		"id": module.id,
		"html": 1,
		"notMe": true,
		"suspended": false,
		"placeholder": window.lang['placeholder']['agentCode']
	};
	self.agent = new SearchAgent(agentOptions);

	self.includeDownlines = new SearchToggle('true');
	self.usernameOrNickname = ko.observable('');
	self.bonusCode = ko.observable('');
	self.emailAddress = ko.observable('');
	self.signUpStartDate = ko.observable('');
	self.signUpEndDate = ko.observable('');
	self.depositRangeStart = ko.observable('');
	self.depositRangeEnd = ko.observable('');

	self.url = ko.observable('/ams/players/list');

	self.formatObj = ko.computed(function(){
		var rst = {
			"money": ['balance'],
			"percentage": ['rakebackPercent']
		};
		return rst;
	});

	var tableId = 'playersTable';
	var dtOption = {
		url: self.url(),
		useCheck: (window.userData.agentInfo && (window.userData.agentInfo.hasBalanceControlAccess == true || window.userData.agentInfo.type == 'Rakeback')) ? true : false,
		autoLoad: false,
		fnDataRebuild: function(row){
			var json = json_encode(row).replace(/\'/gi, '');
			row.currentRakeback = row.rakebackPercent;
			row = covertFormat(row, self.formatObj());

			if(!isEmpty(row.rakebackCarryover) && typeof row.rakebackCarryover == 'number' && row.rakebackCarryover != 0){
				row.rakebackPercent += ' (' + dataFormat(row.rakebackCarryover, 'money') + ')';
			}

			row.username = (row.locked) ? '<del class="text-danger">' + row.username + '</del> <span class="text-danger">' + window.lang['string']['locked'] + '</span>' : row.username;
			row.personalInformation = '<span data=\''+ json +'\'><span class="detailViewLink"></span></span>';
			row.signUpDate = dataFormat(row.signUp.date, 'datetimeAbs');
			row.signUp.country = displayCountry(row.signUp.country);
			row.recentlyPlayedDate = dataFormat(row.recentlyPlayed.date, 'datetimeAbs');
			row.depositSummary = '<span class="pull-left" data=\''+ json +'\'><span class="depositHistoryView"></span></span> <span class="pull-right">' + dataFormat(row.depositSummary, 'money') + '</span>';
			return row;
		},
		"createdRow": function( row, data, index ) {
			if (window.userData.agentInfo && (window.userData.agentInfo.hasBalanceControlAccess == true || window.userData.agentInfo.type == 'Rakeback')){
				$(row).find('td:eq(1)').html(PlayersDropDown(data, 'username'));
			}
		},
		"rowCallback": function( row, data, index ) {
			$(row).find('ul.dropdown-menu > li > a').click(function(e){
				var type = $(e.currentTarget).attr('type');
				self.dropdown(type, data);
			});
		},
		drawCallback: function(){
			var html = '\
			<span data-container="body" data-toggle="popover">\
			<a class="margin-left-10" data-bind="click: function(){ parent.personalInformation($element) }"><u>' + window.lang['string']['view'] + '</u></a>\
			</span>\
			';
			window.templateEngine.addTemplate(self.DT.element, tableId + "_DT_detailViewLink", html);
			var container = self.DT.element.find('.detailViewLink');
			$.each(container, function(i, row){
				ko.renderTemplate(tableId + "_DT_detailViewLink", self.DT, {templateEngine: window.templateEngine}, row, "replaceNode");
			});

			var depositHistoryHTML = '<a class="margin-left-10 " data-bind="click: function(){ parent.depositHistoryView.load($element); }"><i class="fa fa-plus-square-o"></i></a>';
			window.templateEngine.addTemplate(self.DT.element, tableId + "_DT_depositHistoryView", depositHistoryHTML);
			var depositHistoryContainer = self.DT.element.find('.depositHistoryView');
			$.each(depositHistoryContainer, function(i, row){
				ko.renderTemplate(tableId + "_DT_depositHistoryView", self.DT, {templateEngine: window.templateEngine}, row, "replaceNode");
			});

			$('.popover').popover('destroy')

		},
		"footerCallback": function(tr, data) {
			self.collapseThead('signUp', 'signUpDate');
			self.collapseThead('recentlyPlayed', 'recentlyPlayedDate');
		},
		"order": (window.userData.agentInfo && (window.userData.agentInfo.hasBalanceControlAccess == true || window.userData.agentInfo.type == 'Rakeback')) ? [[7,"desc"]] : [[6,"desc"]]
	};

	self.dropdown = function(type, data){
		switch (type){
			case 'walletHistory':
				window.open('/Players/WalletHistory/' + data.username + '?agentCode=' + data.agent);
				break;
			default:
				self.playersModal(type, data);
				break;
		}
	};

	self.DT = new DataTableClass(dtOption, self);

	self.params = ko.computed(function(){
		return {
			"includeDownlines": self.includeDownlines.val(),
			"usernameOrNickname": self.usernameOrNickname(),
			"affiliateName": self.agent.searchKey(),
			"bonusCode": self.bonusCode(),
			"emailAddress": self.emailAddress(),
			"signUpStartDate": self.signUpStartDate() ? self.signUpStartDate() : null,
			"signUpEndDate": self.signUpEndDate() ?  self.signUpEndDate() : null
		}
	});

	self.personalInformation = function(ele){
		var data = json_decode($(ele).parent().parent().attr('data'));
		var address = '';
		if (data.personalInfo){
			if (data.personalInfo.address) address += data.personalInfo.address;
			if (data.personalInfo.city) address += ', ' + data.personalInfo.city;
			if (data.personalInfo.state) address += ', ' + data.personalInfo.state;
			if (data.personalInfo.country) address += ', ' + data.personalInfo.country;
		}

		var html = '';
		if (data.personalInfo){
			if (data.personalInfo.firstName) html += window.lang['columns']['name'] + ': ' + data.personalInfo.firstName + ' ' + data.personalInfo.lastName + '<br/>';
			if (!isEmpty(data.personalInfo['callingCode']) || !isEmpty(data.personalInfo['tel'])){
				html += window.lang['columns']['tel'] + ': ';
				if (!isEmpty(data.personalInfo['callingCode'])){
					html += '(+' + data.personalInfo['callingCode'] + ') ';
				}
				if (!isEmpty(data.personalInfo['tel'])){
					html += data.personalInfo['tel'];
				}
				html += '<br>';
			}
		}

		if (data.emailAddress) html += window.lang['columns']['email'] + ': ' + data.emailAddress + '<br/>';
		if (address) html += window.lang['columns']['address'] +  ': ' + address;

		$(ele).parent().popover({
			title: data.username + '`s ' + window.lang['columns']['personalInfo'] + '&nbsp;&nbsp;&nbsp;<span class="pull-right"><a onclick="closePopover(this)">X</a></span>',
			content: html,
			html : true,
			placement : 'right'
		});
	};

	self.collapseThead = function(category, param){
		var objSelector = 'thead tr:eq(0) th[param=' + param + ']';
		var obj = self.DT.element.find(objSelector);
		var orderObj = self.DT.element.find('thead tr:eq(1) th.' + param);

		// bind collapse action
		var html = '<i class="thead-collapse fa" data-bind="css: columnsClass(\'' + category + '\'), click: function(){ toggleColumns(\'' + category + '\'); }, clickBubble: false"></i>';
		window.bindTo(self, module.id + "_table_header", $('#'+module.id), objSelector + ' i', html);

		var css = 'sorting';
		if(self.DT.getColumnIndex(param) == self.DT.oTable.settings().order()[0][0]){
			css += '_' + self.DT.oTable.settings().order()[0][1];
		}

		$(['sorting', 'sorting_asc', 'sorting_desc']).each(function(idx, val){
			if(css == val) obj.addClass(val);
			else obj.removeClass(val);
		});

		if(!obj.hasClass('orderBind')){
			obj.addClass('orderBind');
			obj.click(function(){
				orderObj.trigger('click');
			});
		}
	};

	var columns = {
		"signUp": ['signUp.country'],
		"recentlyPlayed": ['recentlyPlayed.gameType']
	};

	self.columnsStatus = function(category){
		var rst = false;
		var arr = columns[category];
		for(var i=0;i<arr.length;i++){
			if(in_array(arr[i], self.DT.selectedColumns())){
				rst = true;
				break;
			}
		}
		return rst;
	};

	self.columnsClass = function(category){
		return self.columnsStatus(category) ? 'fa-minus-square-o': 'fa-plus-square-o';
	};

	self.toggleColumns = function(category){
		var isShown = self.columnsStatus(category);
		var arr = columns[category];
		for(var i=0;i<arr.length;i++){
			var idx = self.DT.getColumnIndex(arr[i]);
			if(!in_array(arr[i], self.DT.selectedColumns()) && !isShown){
				self.DT.selectedColumns.push(arr[i]);
				self.DT.oTable.column(idx).visible(true);
			}else if(in_array(arr[i], self.DT.selectedColumns()) && isShown){
				self.DT.selectedColumns.remove(arr[i]);
				self.DT.oTable.column(idx).visible(false);
			}
		}
		if(!isShown){
			$('#playersTable').addClass(category + 'Table');
		}else{
			$('#playersTable').removeClass(category + 'Table');
		}
		$('.popover').popover('destroy');
	};

	self.playersModal = function(mode, data){
		switch (mode){
			case 'transfer':
				self.transfer.load(data);
				break;

			case 'rakeback':
				self.playersRakeback.load(data);
				break;
		}
	};

	self.loadReset = function(){
		if(self.DT.oTable != null){
			self.DT.options.ajax.url = self.url();
			self.DT.redraw(window.DTPreset['Players']);
		}else{
			self.params();
			self.DT.init(self.DT.element, window.DTPreset['Players'], false);
			self.DT.options.ajax.url = self.url();
			self.DT.load();
		}
		$('.popover').remove();
	};

	self.init = function(id, params){
	};

	self.load = function(id, params){
		self.agent.load();
		if(!isEmpty(location.hash)){
			self.bonusCode(location.hash.substring(1));
		}
		if(!isEmpty(self.bonusCode())){
			location.hash = '';
			self.loadReset();
		}
	};
};