var CasinoStatistics = function(module){
	var self = this;

	var agentOptions = {
		"id": module.id,
		"html": 1,
		"notMe": true,
		"placeholder": window.lang['placeholder']['agentCode']
	};
	self.agent = new SearchAgent(agentOptions);

	self.dateFrom = ko.observable('');
	self.dateTo = ko.observable('');

	self.group = ko.observable('player');
	self.prevGroup = ko.observable('player');
	self.groupClass = function(group){
		return group == self.group() ? 'active' : '';
	};
	self.switchGroup = function(group){
		self.group(group);
	};

	self.usernameOrNickname = ko.observable('');
	self.usernameOrNicknameUse = ko.computed(function(){
		if(self.prevGroup() == 'agent') self.usernameOrNickname('');
		return self.group() == 'agent' ? false: true;
	});

	self.url = ko.computed(function(){
		return '/ams/statistics/casino/list/per_' + self.group();
	});

	self.dtPreset = ko.computed(function(){
		var rst = 'CasinoStatistics';
		switch(self.group()){
			case 'player':
				rst += 'Player';
				break;
			case 'agent':
				rst += 'Agent';
				break;
			case 'day': case 'week': case 'month':
				rst += 'Period';
				break;
		}
		return window.DTPreset[rst];
	});

	self.defaultSort = ko.computed(function(){
		var rst;
		switch(self.group()){
			case 'player': case 'agent':
				rst = [[0,"asc"]];
				break;
			case 'day': case 'week': case 'month':
				rst = [[0,"desc"]];
				break;
		}
		return rst;
	});

	self.formatObj = ko.computed(function(){
		var rst = {
			"money": ['bet','payout','refund','total_winloss','winLoss'],
			"int": ['betCount','payoutCount']
		};
		if(in_array(self.group(), ['day', 'week', 'month'])) rst[self.group() + 'Abs'] = ['date'];
		return rst;
	});

	var dtOption = {
		url: self.url(),
		useCheck: false,
		autoLoad: false,
		pagingType: "full_numbers_total",
		fnDataRebuild: function(row){
			if(isEmpty(row.date) && !isEmpty(row.day) && self.group() == 'day') row.date = row.day;
			return covertFormat(row, self.formatObj());
		},
		footerCallback: function(row, data){
			var toolbarHTML = isEmpty(data) || isEmpty(data.lastUpdatedMinutes) ? '': getLastUpdatedString(data.lastUpdatedMinutes);
			window.bindTo(self, module.id + "_table_toolbar", $('#'+module.id), '.toolbar', toolbarHTML);

			var summary = isEmpty(data) || isEmpty(data.summary) ? null: covertFormat(data.summary, self.formatObj());
			DTSetFooter(this.api(), summary, self.DT);
		},
		"order": self.defaultSort()
	};
	self.DT = new DataTableClass(dtOption, self);

	self.params = ko.computed(function(){
		return {
			"usernameOrNickname": self.usernameOrNickname(),
			"agentCode": self.agent.searchKey(),
			"startDate": self.dateFrom() ? self.dateFrom() : null,
			"endDate": self.dateTo() ?  self.dateTo() : null
		};
	});

	self.loadReset = function(){
		var group = self.group();
		if(self.prevGroup() != group){
			self.DT.options.ajax.url = self.url();
			self.DT.options.order = self.defaultSort();
		}
		if(self.DT.oTable != null && self.prevGroup() != group){
			self.DT.redraw(self.dtPreset());
		}else{
			if(self.prevGroup() != group){
				self.DT.init(self.DT.element, self.dtPreset(), false);
				self.DT.options.order = self.defaultSort();
			}
			self.DT.options.ajax.url = self.url();
			self.DT.load();
		}
		self.prevGroup(group);
	};

	self.init = function(){};

	self.load = function(){
		self.agent.load();
	};
};