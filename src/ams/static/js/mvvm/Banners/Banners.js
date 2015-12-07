var Banners = function(module){
	var self = this;

	self.url = ko.computed(function(){
		return '/ams/banners/list';
	});

	self.formatObj = ko.computed(function(){
		var rst = {
			"money": ['bet','payout','refund','total_winloss','winLoss'],
			"int": ['betCount','payoutCount']
		}
		return rst;
	});

	self.lang = [
		{'code': 'en_US', 'name': 'English'},
		{'code': 'zh_CN', 'name': '中文（简体）'},
		{'code': 'zh_TW', 'name': '中文（繁體）'},
		{'code': 'ja_JP', 'name': '日本語'},
		{'code': 'in_ID', 'name': 'Bahasa Indonesia'}
	];

	self.selectedLang = ko.observable(window.userData['language']);
	self.selectedLangName = ko.computed(function(){
		var rst = '';
		for(var i = 0; i < self.lang.length; i++){
			if(self.selectedLang() == self.lang[i]['code']){
				rst = self.lang[i]['name'];
				return rst;
			}
		}
		return rst;
	});

	self.changeLang = function(code){
		self.selectedLang(code);
		self.loadReset();
	};

	var tableId = 'bannersTable';
	var dtOption = {
		url: self.url(),
		useCheck: false,
		autoLoad: true,
		useButtons: false,
		pagingType: "full_numbers_total",
		fnDataRebuild: function(row){
			row.banner = '<img class="bannerImg" src="' + row.url + '" width="' + row.width + '" height="' + row.height + '">';
			row.size = row.width + ' x ' + row.height + '<br>(' + (row.contentLength / 1000) + 'kb)';
			row.action = '<span bannerId="' + row.id + '" bannerSrc="' + row.url + '" bannerSize="' + row.contentLength + '"><span class="bannerDownload"></span></span>';
			switch(row.language){
				case 'en-US':
					row.lang = 'English';
					break;
				case 'zh-CN':
					row.lang = '中文（简体）';
					break;
				case 'zh-TW':
					row.lang = '中文（繁體）';
					break;
				case 'ja-JP':
					row.lang = '日本語';
					break;
			}
			return covertFormat(row, self.formatObj());
		},
		drawCallback: function(){
			var html = '<button class="btn btn-flat btn-danger" data-bind="click: function(){ parent.download($element); }"><i class="fa fa-download"></i> ' + window.lang['buttons']['download'] + '</button>';
			window.templateEngine.addTemplate(self.DT.element, tableId + "_DT_download", html);
			var container = self.DT.element.find('.bannerDownload');
			$.each(container, function(i, row){
				ko.renderTemplate(tableId + "_DT_download", self.DT, {templateEngine: window.templateEngine}, row, "replaceNode");
			});
			$('.bannerImg').on("contextmenu", function(e){
				e.preventDefault();
			});
		},
		"order": null
	};
	self.DT = new DataTableClass(dtOption, self);

	self.params = ko.computed(function(){
		return {
			"lang": self.selectedLang()
		};
	});

	self.download = function(element){
		var id = $(element).parent().attr('bannerId');
		var src = $(element).parent().attr('bannerSrc');
		var size = $(element).parent().attr('bannerSize');

		$.ajaxSetup({cache: false, async: true});

		var iframe, frm;
		var bannerId = document.createElement('input');
		var bannerSrc = document.createElement('input');
		var bannerSize = document.createElement('input');

		iframe = CreateHiddenFrame(0);
		frm = CreateHiddenForm(0);

		bannerId.type = 'hidden';
		bannerId.name = 'id';
		bannerId.value = id;

		bannerSrc.type = 'hidden';
		bannerSrc.name = 'src';
		bannerSrc.value = src;

		bannerSize.type = 'hidden';
		bannerSize.name = 'size';
		bannerSize.value = size;

		frm.appendChild(bannerId);
		frm.appendChild(bannerSrc);
		frm.appendChild(bannerSize);

		frm.method = 'post';
		frm.target = $(iframe).attr('name');
		frm.action = '/ams/banners/download';

		frm.submit();
	};

	self.loadReset = function(){
		self.DT.redraw(window.DTPreset['Banners']);
	};

	self.init = function(){};

	self.load = function(){
		self.selectedLang(window.userData['language']);
		self.DT.options.ajax.url = self.url();
		self.DT.load();
	};
};