var PokerStatistics = function(module){
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
		return group == self.group() ? 'active': '';
	};
	self.switchGroup = function(group){
		self.group(group);
	};

	self.usernameNickname = ko.observable('');
	self.usernameNicknameUse = ko.computed(function(){
		var rst;
		if(self.group() == 'agent') rst = false;
		else rst = true;
		if(self.prevGroup() == 'agent') self.usernameNickname('');
		return rst;
	});

	self.url = ko.computed(function(){
		return '/ams/statistics/poker/list/per_' + self.group();
	});

	self.dtPreset = ko.computed(function(){
		var rst = 'PokerStatistics';
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
			case 'player':
				if(window.userData['tier'] < 1){
					rst = [[10, "desc"]];
				}else{
					rst = [[7, "desc"]];
				}
				break;
			case 'agent':
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
			"money": ['winLoss', 'rakeFee', 'deduction', 'ngr'],
			"int": ['games']
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
			return covertFormat(row, self.formatObj());
		},
		"footerCallback": function(tr, data) {
			self.collapseThead('winLoss', 'winLossTotal');
			self.collapseThead('rakedHandsGames', 'gamesTotal');
			if(window.userData['tier'] == '0'){
				self.collapseThead('rakeFee', 'rakeFeeTotal');
				self.collapseThead('deduction', 'deductionTotal');
			}

			var toolbarHTML = isEmpty(data) || isEmpty(data.lastUpdatedMinutes) ? '': getLastUpdatedString(data.lastUpdatedMinutes);
			window.bindTo(self, module.id + "_table_toolbar", $('#'+module.id), '.toolbar', toolbarHTML);

			if(self.DT.getColumnIndex('ngr') && isEmpty(data.summary['ngr'])){
				data.summary['ngr'] = 0;
			}
			var summary = isEmpty(data) || isEmpty(data.summary) ? null: covertFormat(data.summary, self.formatObj());
			DTSetFooter(this.api(), summary, self.DT);
		},
		"order": self.defaultSort()
	};
	self.DT = new DataTableClass(dtOption, self);

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
		"winLoss": ['winLossCashGame', 'winLossSitAndGo', 'winLossTournament'],
		"rakeFee": ['rakeFeeCashGame', 'rakeFeeSitAndGo', 'rakeFeeTournament'],
		"rakedHandsGames": ['gamesCashGame', 'gamesSitAndGo', 'gamesTournament'],
		"deduction": ['deductionBonus', 'deductionGgp', 'deductionPayment', 'deductionTournamentOverlay']
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
	}

	self.columnsClass = function(category){
		return self.columnsStatus(category) ? 'fa-minus-square-o': 'fa-plus-square-o';
	};

	self.toggleColumns = function(category){
		var isShown = self.columnsStatus(category);
		var arr = columns[category];
		var maxIdx = 0;
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
			$('#pokerStatisticsTable').addClass(category + 'Table');
		}else{
			$('#pokerStatisticsTable').removeClass(category + 'Table');
		}
	};

	self.params = ko.computed(function(){
		return {
			"startDate": self.dateFrom() ? self.dateFrom(): null,
			"endDate": self.dateTo() ?  self.dateTo(): null,
			"usernameOrNickname": self.usernameNickname(),
			"agentCode": self.agent.searchKey()
		};
	});

	self.loadReset = function(){
		var group = self.group();
		self.DT.options.ajax.url = self.url();
		if(self.DT.oTable != null && self.prevGroup() != group){
			self.DT.options.order = self.defaultSort();
			self.DT.redraw(self.dtPreset());
			$('#pokerStatisticsTable').removeClass('winLossTable');
			$('#pokerStatisticsTable').removeClass('rakeFeeTable');
			$('#pokerStatisticsTable').removeClass('rakedHandsGamesTable');
			$('#pokerStatisticsTable').removeClass('deductionTable');
		}else{
			if(self.prevGroup() != group){
				self.DT.init(self.DT.element, self.dtPreset(), false);
			}
			self.DT.options.ajax.url = self.url();
			self.DT.options.order = self.defaultSort();
			self.DT.load();
		}
		self.prevGroup(group);
	};

	self.init = function(id, params){};

	self.load = function(id, params){
		self.agent.load();
	};
};