var BonusCodeToolsModal = function(parent){
	var self = this;
	self.parent = parent;

	self.button = new ButtonClass();
	self.error = new ErrorClass();

	self.modal = $("#BonusCodeToolsModal");
	self.bonusCode = ko.observable('').extend({ 'alphanum': { "minLength": 3, "maxLength": 10, "required": true, 'message': window.lang['error']['INVALID_BONUSCODE'] } });
	self.submitStatus = ko.computed(function(){
		return self.button.status() || self.bonusCode.hasError();
	});
	self.submitDisabled = ko.computed(function(){
		return self.submitStatus() ? 'disabled' : '';
	});

	self.save = function(){
		if(self.submitStatus()) return;
		self.button.load();
		self.error.reset();

		var params = {
			"http_method": 'post'
		};

		$.ajaxSetup({ cache: false, async: true });
		$.post('/ams/bonusCode/' + self.bonusCode(), params, function(data){
			data = checkSessionExpired(data);
			if(data.error == 0){
				gritter(1, window.lang['success']['bonusCodeCreated']);
				self.modal.modal('hide');
				self.parent.loadReset();
			}else{
				if(data.body == 'AMS_BONUS_CODE_ALREADY_EXISTS'){
					self.bonusCode.hasError(true);
					self.bonusCode.errorMessage(window.lang['error']['AMS_BONUS_CODE_ALREADY_EXISTS']);
				}else{
					self.error.msg(data);
				}
			}
			self.button.reset();
		},'json');
	};

	self.load = function(){
		self.bonusCode('');
		self.modal.modal('show');
	};
};

var BonusCodeTools = function(module){
	var self = this;

	self.formatObj = ko.computed(function(){
		var rst = {
			"datetimeAbs": ['createdAt'],
			"int": ['players']
		};
		return rst;
	});

	var tableId = 'BonusCodeToolsTable';
	var dtOption = {
		url: '/ams/bonusCode/list',
		useCheck: false,
		autoLoad: true,
		useButtons: false,
		pagingType: "full_numbers_toggle",
		fnDataRebuild: function(row){
			row.url = isEmpty(window.userData['labelDomain']) ? '' : window.userData['labelDomain'] + '/source/' + row.bonusCode;
			//row.downloadUrl = row.url;
			row.downloadUrl = '<div style="min-width: 120px"><div url="' + row.url + '"><span class="downloadUrl"></span></div></div>';
			row = covertFormat(row, self.formatObj());
			row.players = '<a href="/Players#' + row.bonusCode + '">' + row.players + '</a>';
			return row;
		},
		drawCallback: function(){
			var html = '\
				<button class="btn btn-xs btn-flat btn-warning" data-toggle="popover" data-content="{url}" data-placement="left"><i class="fa fa-search-plus"></i> ' + window.lang['buttons']['view'] + '</button>\
				<button class="btn btn-xs btn-flat btn-success" data-bind="click: function(){ copy2clipboard(\'{url}\', \'' + window.lang['string']['copyDescription'] + '\'); }""><i class="fa fa-copy"></i> ' + window.lang['buttons']['copy'] + '</button>\
				';
			var container = self.DT.element.find('.downloadUrl');
			$.each(container, function(i, row){
				var url = $(this).parent().attr('url');
				var html2 = html;
				html2 = html2.replace(/\{url\}/g, url);
				window.templateEngine.addTemplate(self.DT.element, tableId + "_DT_url" + i, html2);
				ko.renderTemplate(tableId + "_DT_url" + i, self.DT, {templateEngine: window.templateEngine}, row, "replaceNode");
			});
			$('#' + tableId + ' [data-toggle="popover"]').popover({
				title: window.lang['columns']['downloadUrl'] + '<a class="pull-right" onclick="$(this).closest(\'td\').find(\'.btn[data-toggle=popover]\').popover(\'hide\')">X</a>',
				html : true,
				placement : 'left'
			});
		},
		"order": null
	};
	self.DT = new DataTableClass(dtOption, self);

	self.params = ko.computed(function(){
		return {
		};
	});

	self.loadReset = function(){
		self.DT.redraw(window.DTPreset['BonusCodeTools']);
	};

	self.createModal = new BonusCodeToolsModal(self);
	self.create = function(){
		self.createModal.load();
	};

	self.init = function(){};

	self.load = function(){
		self.DT.load();
	};
};