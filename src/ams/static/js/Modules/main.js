var ViewModel = function () {
	var self = this;

	self.nav = new NavClass();
	self.mySetting = new MySetting();

	self.module = [
		{ id: "MyInfo", view: MyInfo },
		{ id: "PokerStatistics", view: PokerStatistics },
		{ id: "CasinoStatistics", view: CasinoStatistics },
		{ id: "Agents", view: Agents },
		{ id: "Players", view: Players },
		{ id: "PlayersWalletHistory", view: PlayersWalletHistory },
		{ id: "BonusCodeTools", view: BonusCodeTools },
		{ id: "Banners", view: Banners }
	];

	self.findModule = function (id) {
		for(var i=0; i<self.module.length; i++){
			if(id == self.module[i].id){
				return self.module[i];
			}
		}
		return null;
	};

	self.init = function() {
		var vm;
		var m = getSegmentUrl();
		var id = '';
		var key = '';

		for(var i=0; i < m.length; i++){
			if(i < 2){
				id += m[i];
			}
		}

		if(!isEmpty(m[2])){
			key = m[2];
		}

		// clear interval time
		//clearInterval(window.interval.APIStat);

		var s = getJsonFromUrl();
		var pageModule = self.findModule(id);
		var element = document.getElementById(id);

		// global vm load
		self.nav.load(id, m, key, s);
		vm = new pageModule.view(pageModule);
		ko.applyBindings(vm, element);

		vm.init(key, s);
		vm.load(key, s);
		self.vm = vm;
	};

	self.init();
};

window.vm = new ViewModel();
ko.applyBindings(window.vm);


$(function() {
	// skip enter
	$('[role="form"]').keydown(function(e){
		var keyCode = (e.which ? e.which : e.keyCode);
		var tagName = e.srcElement.tagName;
		var isExclude = (
			(!isEmpty($(e.target).attr('data-bind')) &&
			$(e.target).attr('data-bind').indexOf('executeOnEnter') > -1) ||
			tagName != 'TEXTAREA'
		);

		if(!isExclude){
			if(keyCode == 13){
				e.returnValue = false;
				return false;
			}
		}
	});

	$(window).bind("load resize", function() {
		$('[data-toggle="popover"][aria-describedby]:not([aria-describedby=""])').popover("show");
	});

	$('[data-toggle="popover"]').popover({container: "body"});
	$('[data-toggle="tooltip"]').tooltip({container: "body"});


	$('.btn').keydown(function(e){
		var keyCode = (e.which ? e.which : e.keyCode);

		if(keyCode == 13 || keyCode == 32){
			e.returnValue = false;
			return false;
		}
	}).keyup(function(e){
		var keyCode = (e.which ? e.which : e.keyCode);

		if(keyCode == 13 || keyCode == 32){
			e.returnValue = false;
			return false;
		}
	});
	$('.btn').focus(function(){
		//$(this).trigger('blur');
	});

	if(!isEmpty(window.userData) && !isEmpty(window.userData['resetPassword']) && window.userData['resetPassword']){
		window.vm.mySetting.editInfo();
	}
});