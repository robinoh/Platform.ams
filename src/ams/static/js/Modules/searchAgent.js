var SearchAgent = function(options){
	var self = this;

	self.options = {
		"id": options['id'],
		"html": isEmpty(options['html']) ? 1 : options['html'],
		"placeholder": isEmpty(options['placeholder']) ? false : options['placeholder'],
		"mIndex": isEmpty(options['mIndex']) ? false : options['mIndex'],
		"suspended": isEmpty(options['suspended']) ? false : options['suspended'],
		"notMe": isEmpty(options['notMe']) ? false : options['notMe'],
		"default": isEmpty(options['default']) ? window.userData['username'] : options['default'],
		"disabled": isEmpty(options['disabled']) ? false : options['disabled']
	};

	self.pageObj = $('#' + self.options['id']);
	self.element = null;
	self.parentLoad = false;

	self.list = ko.observableArray([]);
	self.searchKey = ko.observable(self.options['default']);

	self.isDefault = ko.computed(function(){
		return (isEmpty(self.searchKey()) || self.searchKey() == self.options['default']);
	});

	self.css = ko.computed(function(){
		return '';
		//return (self.isDefault()) ? '' : 'has-success';
	});

	self.reset = function(){
		if(self.element != null){
			if(self.options['notMe'] !== false){
				self.element.select2("val", "");
				self.searchKey('');
			}else{
				self.element.select2("val", self.options['default']);
				self.searchKey(self.options['default']);
			}
		}
	};

	self.renderHtml = function(){
		var inline = '\
			<div class="input-group input-medium" data-bind="css: css()">\
				<span class="input-group-addon"><i class="fa fa-share-alt fa-fw"></i></span>\
				<div class="entity-selector select2 form-control disabled" style="width: 100%;"><div class="text-muted" style="line-height: 20px;"><i class="fa fa-fw fa-spinner fa-spin"></i> ' + self.options['placeholder'] + '</div></div>\
			</div>\
		';

		var bootstrap = '\
			<div class="form-group input-medium">\
				<div class="input-group" data-bind="css: css()">\
					<span class="input-group-addon"><i class="fa fa-share-alt fa-fw"></i></span>\
					<div class="entity-selector select2 form-control disabled" style="width: 100%;"><div class="text-muted" style="line-height: 20px;"><i class="fa fa-fw fa-spinner fa-spin"></i> ' + self.options['placeholder'] + '</div></div>\
				</div>\
			</div>\
		';

		var html = (self.options['html'] == 1) ? inline : bootstrap;

		var obj = $('.agentSearch');
		var context = (self.options['mIndex'] == false) ? obj : obj.eq(self.options['mIndex']);

		window.bindTo(self, self.options['id'] + "_agent_search", self.pageObj, context, html);
	};

	self.getAgents = function(){
		self.list([]);

		var params = { "http_method": 'get' };

		if(self.options['notMe'] !== false) params.notMe = window.userData['hierarchyId'];
		if(self.options['suspended'] !== false) params.showSuspended = self.options['suspended'];

		$.ajaxSetup({ cache: false, async: true });
		$.post('/ams/Info/tree', params, function(data){
			data = checkSessionExpired(data);

			if(data.error == 0){
				self.list(data.body);
				self.applySelect();
			}else{
				gritter(0, data.body);
			}
		}, 'json');
	};

	self.format = function(item){
		return '<span class="text-default">' + item['text'] + '</span>';
	};

	self.applySelect = function(){
		self.element.removeClass('form-control').removeClass('disabled');
		self.element.select2({
			data: self.list(),
			placeholder: self.options['placeholder'],
			containerCssClass: 'entity-select2',
			formatResult: self.format,
			formatSelection: self.format,
			allowClear: true
		});

		self.element.on("select2-selecting", function(e){
			if(e.val == window.userData['username'] && self.searchKey() == window.userData['username']) return;

			self.searchKey(e.object['key']);

			if(self.parentLoad !== false){
				self.parentLoad();
			}
		});

		self.element.on("select2-clearing", function(e){
			self.searchKey('');
		});

		if(self.options['placeholder'] == false){
			self.element.select2('val', self.options['default']);
		}

		if(self.options['disabled']){
			self.element.select2("enable", false);
		}

		if(self.options['notMe'] !== false){
			self.element.select2('val', "");
			self.searchKey('');
		}
	};

	self.load = function(parentLoad){
		self.renderHtml();
		self.getAgents();

		self.parentLoad = isEmpty(parentLoad) ? false : parentLoad;

		self.element = (self.options['mIndex'] == false) ? self.pageObj.find('.entity-selector') : self.pageObj.find('.entity-selector').eq(self.options['mIndex']);
	};
};