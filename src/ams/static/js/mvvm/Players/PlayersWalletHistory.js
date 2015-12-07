var PlayersWalletHistory = function(module){
	var self = this;
	var id = module.id;

	self.username = ko.observable('');
	self.agentCode = ko.observable('');
	self.types = ko.observable('');
	self.startDate = ko.observable('');
	self.endDate = ko.observable('');
	self.isFilter = ko.observable(false);
	self.transferTags = ko.observableArray('');
	self.isTransfer = ko.observable(true);
	self.gamesTags = ko.observableArray('');
	self.isGames = ko.observable(true);
	self.bonusTags = ko.observableArray('');
	self.isBonus = ko.observable(true);
	self.casinoTags = ko.observableArray('');
	self.isCasino = ko.observable(true);
	self.paymentTags = ko.observableArray('');
	self.isPayment = ko.observable(true);

	self.url = ko.computed(function(){
		return '/ams/players/history/wallet/' + self.agentCode() + '/' + self.username();
	});

	var tableId = 'playersWalletHistoryTable';
	var dtOption = {
		url: self.url(),
		useDownload: true,
		useCheck: false,
		autoLoad: false,
		fnDataRebuild: function(row){
			row.date = dataFormat(row.date, 'datetimeAbs');
			row.typeString = convertType(row.type, 'walletType');
			row.balance = dataFormat(row.balance, 'money');
			var patt = /([0-9]{4}\-[0-9]{2}) RakeRace Prize\. Rank ([0-9])*/g;
			var chkStr = row.description.match(patt);
			if(!isEmpty(chkStr)){
				row.description = chkStr[0].replace(/RakeRace Prize. Rank/, window.lang['string']['rakeRacePrizeRank']);
				row.type = 'rakeRace';
			}
			switch(row.type){
				case 'transfer_o2p': case 'transfer_a2p': case 'transfer_p2p':
				//rakeRacePrizeRank
					row.username = row.description.split(' ');

					if (row.type == 'transfer_o2p') {
						var icon = ' (GGNetwork)';
						row.username[2] = '';
					} else if (row.type == 'transfer_a2p') {
						var icon = ' (Agent)';
					} else if (row.type == 'transfer_p2p') {
						var icon = ' (Player)';
					}
					switch (row.username[1]){
						case 'from':
							row.description = window.lang['string']['creditFrom'].replace('{who}', row.username[2]) + icon;
							break;
						case 'to':
							row.description = window.lang['string']['debitTo'].replace('{who}', row.username[2]) + icon;
							break;
					}
					break;
			}
			row.amount = dataFormat(row.amount, 'money');
			return row;
		},
		"order": [[0,"desc"]]
	};

	self.DT = new DataTableClass(dtOption, self);

	self.params = ko.computed(function(){
		return {
			"types": self.types(),
			"startDate": self.startDate() ? self.startDate() : null,
			"endDate": self.endDate() ?  self.endDate() : null
		}
	});

	self.filterTypes = ko.computed(function(){
		var rst = [];
		$.each(self.transferTags(), function(idx, val){
			if (!in_array(val, rst)){
				rst.push(val);
			}
		});

		$.each(self.gamesTags(), function(idx, val){
			if (!in_array(val, rst)){
				rst.push(val);
			}
		});

		$.each(self.bonusTags(), function(idx, val){
			if (!in_array(val, rst)){
				rst.push(val);
			}
		});

		$.each(self.casinoTags(), function(idx, val){
			if (!in_array(val, rst)){
				rst.push(val);
			}
		});

		$.each(self.paymentTags(), function(idx, val){
			if (!in_array(val, rst)){
				rst.push(val);
			}
		});

		if (rst.length == 15) rst = 'all';
		else rst = rst.join(',');
		self.types(rst);
	});

	self.filterCss = ko.computed(function(){
		return (self.isFilter() == false) ? '' : 'active';
	});

	self.filterToggle = function(){
		self.isFilter(!self.isFilter());
	};

	self.transferToggleAll = function(){
		var filter = window.walletType.transfer;
		if (self.isTransfer() == false){
			self.isTransfer(true);
			$.each(filter, function(idx, val){
				if (!in_array(val.code, self.transferTags())){
					self.transferTags.push(val.code);
				}
			});
		} else {
			self.isTransfer(false);
			$.each(filter, function(idx, val){
				self.transferTags.remove(val.code);
			});
		}
	};

	self.transferCssAll = function(){
		return (self.isTransfer()) ? 'active' : '';
	};

	self.transferToggle = function(code){
		if (in_array(code, self.transferTags())){
			self.transferTags.remove(code);
		} else {
			self.transferTags.push(code);
		}
		if (self.transferTags().length != window.walletType.transfer.length){
			self.isTransfer(false);
		} else {
			self.isTransfer(true);
		}
	};

	self.transferCss = function(code){
		return (in_array(code, self.transferTags())) ? 'active' : '';
	};

	self.gamesToggleAll = function(){
		var filter = window.walletType.games;
		if (self.isGames() == false){
			self.isGames(true);
			$.each(filter, function(idx, val){
				if (!in_array(val.code, self.gamesTags())){
					self.gamesTags.push(val.code);
				}
			});
		} else {
			self.isGames(false);
			$.each(filter, function(idx, val){
				self.gamesTags.remove(val.code);
			});
		}
	};

	self.gamesCssAll = function(){
		return (self.isGames()) ? 'active' : '';
	};

	self.gameToggle = function(code){
		if (in_array(code, self.gamesTags())){
			self.gamesTags.remove(code);
		} else {
			self.gamesTags.push(code);
		}
		if (self.gamesTags().length != window.walletType.games.length){
			self.isGames(false);
		} else {
			self.isGames(true);
		}
	};

	self.gamesCss = function(code){
		return (in_array(code, self.gamesTags())) ? 'active' : '';
	};

	self.bonusToggleAll = function(){
		var filter = window.walletType.bonus;
		if (self.isBonus() == false){
			self.isBonus(true);
			$.each(filter, function(idx, val){
				if (!in_array(val.code, self.bonusTags())){
					self.bonusTags.push(val.code);
				}
			});
		} else {
			self.isBonus(false);
			$.each(filter, function(idx, val){
				self.bonusTags.remove(val.code);
			});
		}
	};

	self.bonusCssAll = function(){
		return (self.isBonus()) ? 'active' : '';
	};

	self.bonusToggle = function(code){
		if (in_array(code, self.bonusTags())){
			self.bonusTags.remove(code);
		} else {
			self.bonusTags.push(code);
		}
		if (self.bonusTags().length != window.walletType.bonus.length){
			self.isBonus(false);
		} else {
			self.isBonus(true);
		}
	};

	self.bonusCss = function(code){
		return (in_array(code, self.bonusTags())) ? 'active' : '';
	};

	self.casinoToggleAll = function(){
		var filter = window.walletType.casino;
		if (self.isCasino() == false){
			self.isCasino(true);
			$.each(filter, function(idx, val){
				if (!in_array(val.code, self.casinoTags())){
					self.casinoTags.push(val.code);
				}
			});
		} else {
			self.isCasino(false);
			$.each(filter, function(idx, val){
				self.casinoTags.remove(val.code);
			});
		}
	};

	self.casinoCssAll = function(){
		return (self.isCasino()) ? 'active' : '';
	};

	self.casinoToggle = function(code){
		if (in_array(code, self.casinoTags())){
			self.casinoTags.remove(code);
		} else {
			self.casinoTags.push(code);
		}
		if (self.casinoTags().length != window.walletType.casino.length){
			self.isCasino(false);
		} else {
			self.isCasino(true);
		}
	};

	self.casinoCss = function(code){
		return (in_array(code, self.casinoTags())) ? 'active' : '';
	};

	self.paymentToggleAll = function(){
		var filter = window.walletType.payment;
		if (self.isPayment() == false){
			self.isPayment(true);
			$.each(filter, function(idx, val){
				if (!in_array(val.code, self.paymentTags())){
					self.paymentTags.push(val.code);
				}
			});
		} else {
			self.isPayment(false);
			$.each(filter, function(idx, val){
				self.paymentTags.remove(val.code);
			});
		}
	};

	self.paymentCssAll = function(){
		return (self.isPayment()) ? 'active' : '';
	};

	self.paymentToggle = function(code){
		if (in_array(code, self.paymentTags())){
			self.paymentTags.remove(code);
		} else {
			self.paymentTags.push(code);
		}
		if (self.paymentTags().length != window.walletType.payment.length){
			self.isPayment(false);
		} else {
			self.isPayment(true);
		}
	};

	self.paymentCss = function(code){
		return (in_array(code, self.paymentTags())) ? 'active' : '';
	};

	self.loadReset = function(){
		if(self.DT.oTable != null){
			self.DT.options.ajax.url = self.url();
			self.DT.redraw(window.DTPreset['PlayersWalletHistory']);
		}else{
			self.params();
			self.DT.init(self.DT.element, window.DTPreset['PlayersWalletHistory'], false);
			self.DT.options.ajax.url = self.url();
			self.DT.load();

		}
	};

	self.init = function(id, params){
	};

	self.load = function(id, params){
		self.username(id);
		self.agentCode(params.agentCode);
		self.transferTags(type2List(window.walletType.transfer));
		self.gamesTags(type2List(window.walletType.games));
		self.bonusTags(type2List(window.walletType.bonus));
		self.casinoTags(type2List(window.walletType.casino));
		self.paymentTags(type2List(window.walletType.payment));
		self.loadReset();
	};
};