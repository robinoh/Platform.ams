// navigation
var NavClass = function(){
	var self = this;

	self.pageId = ko.observable('');
	self.pageTitle = ko.observable('');
	self.pageLocation = ko.observableArray([]);

	self.css = function(ids){
		return (in_array(self.pageId(), ids)) ? 'active' : '';
	};

	self.currentPage = function(id){
		return (id == self.pageId()) ? 'active' : '';
	};

	self.currentLink = function(data){
		var rst;
		if(data.id == self.pageId() || isEmpty(data.url)){
			rst =  '<span>' + data.name + '</span>';
		}else{
			rst = '<a href="' + data.url + '">' + data.name + '</a>';
		}
		return rst;
	};

	self.locationHtml = ko.computed(function(){
		var rst = [];
		var data = self.pageLocation();
		for(var i=0;i<data.length;i++){
			rst.push('<li>' + self.currentLink(data[i]) + '</li>');
		}
		rst = rst.join('<li><i class="fa fa-angle-right"></i></li>');
		return rst;
	});

	self.load = function(id, m, key, s){
		self.pageId(id);

		var nav = window.lang.nav;
		var environment = isEmpty(window.environment) ? '' : '[' + window.environment.toUpperCase() + ']';


		var title = '';
		var url = '';
		var pageLocation = [];
		var isDetail = false;
		var DetailPageName = '';
		var DetailPageId = '';

		for(var i=0 ; i < m.length; i++){
			url += '/' + m[i];

			if(!isEmpty(m[i])){

				var pageId = url.replace(/\//gi, '');
				var pageName = isEmpty(nav[pageId]) ? m[i] : nav[pageId];
				if(pageId == 'PlayersWalletHistory'){
					isDetail = true;
					DetailPageName = pageId;
					DetailPageId = pageId;
				}else{
					pageLocation.push({
						"url": url,
						"id": pageId,
						"name": pageName
					});
				}
			}
		}

		if(isDetail){
			pageLocation.push({
				"url": '',
				"id": DetailPageId,
				"name": nav[DetailPageName]
			});
			title = key + "'s " + nav[DetailPageName];
		}else{
			title = nav[pageId];
		}

		self.pageLocation(pageLocation);
		title = environment + '[' + window.provider + ']' + ' ' + title;

		window.document.title = title;
	};
};

// image upload
var ImageUpload = function(options){
	var self = this;

	self.error = new ErrorClass();
	self.button = new ButtonClass();

	self.id = options.id;
	self.pageObject = $('#' + options.id);
	self.options = {
		"idx": isEmpty(options.idx) ? false : options.idx,
		"url": options.url,
		"html": options.html,
		"maxWidth": options.maxWidth,
		"maxHeight": options.maxHeight,
		"maxSize": options.maxSize,
		"allowedFiles": options.allowedFiles
	};

	self.element = null;
	self.form = null;
	self.preview = null;
	self.btnFile = null;
	self.btnRemove = null;
	self.inputBox = null;

	self.noImage = ko.observable(options.noImage);
	self.uploadFile = ko.observable('');
	self.uploadType = ko.observable('');
	self.uploadWidth = ko.observable(0);
	self.uploadHeight = ko.observable(0);

	self.isDelete = ko.observable(false);

	self.loadURL = null;
	self.saveURL = null;

	self.previewText = ko.computed(function(){
		if(isEmpty(self.uploadFile())){
			return self.noImage();
		}else{
			var img = '<img src="data:{type};base64, {src}" width="{width}" height="{height}">';

			img = img.replace('{type}', self.uploadType())
				.replace('{src}', self.uploadFile())
				.replace('{width}', self.uploadWidth())
				.replace('{height}', self.uploadHeight());

			return img;
		}
	});

	self.removeStatus = ko.computed(function(){
		return (self.button.status() || self.isDelete());
	});
	self.removeClass = ko.computed(function(){
		return (self.removeStatus()) ? 'disabled' : '';
	});

	self.getFile = function(isDelete){
		if(self.removeStatus()) return;
		self.button.load();
		self.error.reset();

		var params = {
			"isDelete": isDelete,
			"currentLogo": self.uploadFile()
		};

		$.ajaxSetup({ cache: false, async: true });
		$.post(self.loadURL, params, function(data){
			data = debugLog(data);

			self.isDelete(data.isDelete);

			self.uploadType(data['fileType']);
			self.uploadFile(data['base64File']);
			self.uploadWidth(data['width']);
			self.uploadHeight(data['height']);

			self.button.reset();
		},'json');
	};

	self.selectFile = function(){
		if(!isEmpty(self.inputBox)) self.inputBox.click();
	};

	self.chooseFile = function(){
		if(isEmpty(self.form) || self.button.status()) return;
		self.button.load();
		self.error.reset();

		self.form.submit();
	};

	self.save = function(){
		if(self.button.status()) return;
		self.button.load();
		self.error.reset();

		var params = {
			"base64File": self.uploadFile(),
			"fileType": self.uploadType(),
			"width": self.uploadWidth(),
			"height": self.uploadHeight(),
			"isDelete": self.isDelete()
		};

		$.ajaxSetup({ cache: false, async: true });
		$.post(self.saveURL, params, function(data){
			data = checkSessionExpired(data);

			self.button.reset();
		},'json');
	};

	self.renderHtml = function(){
		var component = $('.fileUpload');
		var context = (self.options.idx == false) ? component : component.eq(self.options.idx);

		window.bindTo(self, self.id + "_fileUpload", $('#' + self.id), context, self.options.html);
	};

	self.load = function(customOptions){
		self.error.reset();
		self.button.reset();
		self.isDelete(false);

		self.loadURL = customOptions.loadURL;
		self.saveURL = customOptions.saveURL;

		self.renderHtml();
		self.getFile(false);

		// define element
		self.element = (self.options.idx === false) ? self.pageObject.find('.fileUpload') : self.pageObject.find('.fileUpload').eq(self.options.idx);
		self.form = self.element.find('form');
		self.preview = self.element.find('.file-preview');
		self.btnFile = self.element.find('.file-button');
		self.btnRemove = self.element.find('.file-remove');
		self.inputBox = self.element.find('.file-input');

		// setting up upload form
		var params = {
			"maxWidth": self.options.maxWidth,
			"maxHeight": self.options.maxHeight,
			"maxSize": self.options.maxSize,
			"allowedFiles": self.options.allowedFiles
		};

		self.form.ajaxForm({
			url: self.options.url,
			clearForm: true,
			data: params,
			dataType: 'json',
			success: function(data) {
				data = checkSessionExpired(data);

				if(data.error == 0){
					self.uploadType(data.fileType);
					self.uploadFile(data.body);
					self.uploadWidth(data.imgInfo['width']);
					self.uploadHeight(data.imgInfo['height']);

					self.isDelete(false);
				}else{
					self.error.msg(data);
				}

				self.button.reset();
			}
		});
	};
};

// chart
var ChartClass = function(options){
	var self = this;

	if (typeof options.colors === "undefined") {
		//set to default colors for 3.x
		options.colors = ['#2f7ed8', '#0d233a', '#8bbc21', '#910000', '#1aadce', '#492970', '#f28f43', '#77a1e5', '#c42525', '#a6c96a'];
	}

	self.loading = new LoadingClass();
	self.chart = null;

	self.options = {
		chart: {
			renderTo: options.id,
			height: options.height
			//marginLeft: 40
		},
		title: {
			text: options.title,
			x: -20
		},
		subtitle: {
			text: options.subtitle,
			x: -20
		},
		xAxis: {
			type: options.xAxis.type,
			tickInterval: options.xAxis.tickInterval,
			dateTimeLabelFormats: {
				second: '%H:%M:%S',
				minute: '%H:%M',
				hour: '%H:%M',
				day: '%d',
				week: '%m-%d',
				month: '%Y-%m',
				year: '%Y'
			},
			tickWidth: 1,
			gridLineWidth:0,
			labels: window.chart.labels.datetime
		},
		yAxis: {
			title: {
				text: options.yAxis.title
			},
			labels: {
				align: 'right',
				x: -2,
				y: 4
			},
			showFirstLabel: false
		},
		tooltip: window.chart.tooltip.datetime,
		colors: options.colors,
		legend: options.legend,
		series: options.series
	};

	self.seriesToggle = function(ele){
		var idx = $(".chart-toggle").index($(ele));
		var series = self.chart.series[idx];
		var checkbox = $(ele).find('i');

		if (series.visible) {
			series.hide();
			checkbox.removeClass('fa-check-square-o').addClass('fa-square-o rm2');
		} else {
			series.show();
			checkbox.removeClass('fa-square-o rm2').addClass('fa-check-square-o');
		}
	};

	self.load = function(data){
		if(!isEmpty(options.plotOptions)){
			self.options.plotOptions = options.plotOptions;
		}

		var dateObj, date;

		for(var i=0;i<self.options.series.length;i++){
			if(self.options.xAxis.type == 'datetime'){
				for(var j=0;j<data[i].length;j++){
					dateObj = Date.parseExact(data[i][j][0], 'yyyy-MM-dd');
					date = Date.UTC(dateObj.getUTCFullYear(), dateObj.getUTCMonth(), (dateObj.getUTCDate() + 1), 0, 0, 0, 0);

					data[i][j][0] = date;
				}
			}

			self.options.series[i].data = data[i];
		}

		self.chart = new Highcharts.Chart(self.options);

		self.loading.totalItems(data.length);
	};
};

// error
var ErrorClass = function(parent){
	var self = this;

	self.parent = isEmpty(parent) ? false : parent;

	self.text = ko.observable('');
	self.visible = ko.computed(function () {
		return (!isEmpty(self.text()));
	});

	self.msg = function(err){
		var txt;
		var comment = false;

		txt = replaceErrorCode(err);

		if(typeof err == 'object'){
			comment = isEmpty(err.comment) ? '[Unknown]' : err.comment;
		}

		if(self.parent !== false){
			switch(comment){
				case 'password':
					self.parent.password.hasError(true);
					self.parent.password.errorMessage(txt);
					break;
				case 'comparePassword':
					self.parent.confirmPassword.hasError(true);
					self.parent.confirmPassword.errorMessage(txt);
					break;
				case 'currentPassword':
					self.parent.currentPassword.hasError(true);
					self.parent.currentPassword.errorMessage(txt);
					break;
				case 'lockDuration':
					self.parent.lockHours.hasError(true);
					self.parent.lockHours.errorMessage(txt);
					break;
				default:
					self.text(txt);
					break;
			}
		}else{
			self.text(txt);
		}
	};

	self.reset = function(){
		self.text('');
	};
};

// button
var ButtonClass = function() {
	var self = this;

	self.status = ko.observable(false);

	self.classDisabled = ko.computed(function () {
		return (self.status()) ? 'disabled' : '';
	});

	self.classLoading = function (icon) {
		return (self.status()) ? 'fa fa-spinner fa-spin': 'fa ' + icon;
	};

	self.text = function(str1, str2){
		return (self.status()) ? str2 : str1;
	};

	self.reset = function(){
		self.status(false);
	};

	self.load = function(){
		self.status(true);
	};
};

// loading
var LoadingClass = function(isIcon){
	var self = this;

	self.isIcon = isEmpty(isIcon) ? true : isIcon;
	self.defaultIcon = '<i class="fa fa-spinner fa-spin"></i>';
	self.defaultText = window.lang['string']['loading'];
	self.defaultHTML = ((self.isIcon) ? self.defaultIcon + ' ' : '') + self.defaultText;

	self.status = ko.observable(false);
	self.emptyVisible = ko.observable(true);
	self.emptyText = ko.observable('');

	self.statusIcon = function(val){
		return (self.status()) ? self.defaultIcon : val;
	};

	self.icon = function (d) {
		if(self.status()){
			return 'fa fa-spinner fa-spin';
		}else{
			return 'fa ' + d;
		}
	};

	self.errorMsg = function(msg){
		self.emptyVisible(true);
		self.emptyText(replaceErrorCode(msg));
	};

	self.totalItems = function(d){
		self.status(false);

		if(d > 0){
			self.emptyVisible(false);
			self.emptyText(self.defaultHTML);
		}else{
			self.emptyVisible(true);
			self.emptyText(window.lang['string']['datatableNoData']);
		}
	};

	self.load = function(){
		self.status(true);
		self.emptyVisible(true);
		self.emptyText(self.defaultHTML);
	};
};


// my setting
var MySetting = function(){
	var self = this;
	var obj = $("#MySettingModal");

	obj.find(".select2me").select2({
		dropdownCssClass : 'select2-hide-search'
	});

	self.button = new ButtonClass();
	self.error = new ErrorClass(self);

	self.currentPassword = ko.observable('').extend({ 'password': { "required": true, 'message': window.lang['error']['INVALID_PASSWORD_CHAR'] } });
	self.password = ko.observable('').extend({ 'password': { "required": true, 'message': window.lang['error']['INVALID_PASSWORD_CHAR'] } });
	self.confirmPassword = ko.observable('');
	self.emailAddress = ko.observable('').extend({ 'EmailAddress': { "required": true, 'message': window.lang['error']['INVALID_EMAIL'] } });
	self.prevEmailAddress = ko.observable('');
	self.language = ko.observable(window.userData['language']);
	self.timezone = ko.observable(window.userData['timezone']);
	self.changePasswordVisible = ko.observable(false);
	self.changeEmailVisible = ko.observable(false);

	self.confirmPasswordHasError = ko.computed(function(){
		var rst = false;
		if(self.password() != self.confirmPassword()) rst = true;
		return rst;
	});
	self.confirmPasswordClass = ko.computed(function(){
		var rst;
		if(self.confirmPasswordHasError()){
			rst = 'has-error';
		} else {
			rst = (self.confirmPassword()) ? 'has-success' : '';
		}
		return rst;
	});
	self.confirmPasswordMessage = ko.computed(function(){
		var rst = '';
		if(self.confirmPasswordHasError()){
			rst = window.lang['error']['PASSWORD_NOT_MATCH'];
		}
		return rst;
	});

	// submit button
	self.submitStatus = ko.computed(function(){
		return self.button.status() || isEmpty(self.password()) || self.currentPassword.Status() || self.password.Status() || self.confirmPasswordHasError();
	});
	self.submitDisabled = ko.computed(function(){
		return self.submitStatus() ? 'disabled' : '';
	});
	self.submitStatus2 = ko.computed(function(){
		return self.button.status() || isEmpty(self.emailAddress()) || self.emailAddress.Status() || self.prevEmailAddress() == self.emailAddress();
	});
	self.submitDisabled2 = ko.computed(function(){
		return self.submitStatus2() ? 'disabled' : '';
	});

	self.resetForm = function(){
		self.password('');
		self.confirmPassword('');
		self.currentPassword('');
		self.language(window.userData.language);
	};

	self.editInfo = function() {
		self.button.reset();
		self.error.reset();
		obj.find(".selectLanguage").find(".select2me").select2('val', window.userData['language']);
		obj.find(".selectTimezone").find(".select2me").select2('val', window.userData['timezone']);
		self.emailAddress(window.userData['emailAddress']);
		self.prevEmailAddress(window.userData['emailAddress']);
		self.changePasswordVisible(false);
		self.changeEmailVisible(false);

		self.resetForm();
		obj.modal('show');
	};

	self.updateInfo = function() {
		if(self.button.status() || self.submitStatus()) return;
		self.button.load();
		self.error.reset();

		var params = {
			"oldPassword": self.currentPassword(),
			"changePassword": self.password(),
			"changeLanguage": self.language()
		};

		$.ajaxSetup({ cache: false, async: true });
		$.post('/ams/Common/changeDetail', params, function(data){
			data = checkSessionExpired(data);

			if(data.error == 0){
				gritter(1, window.lang['success']['changePassword']);
				obj.modal('hide');
			} else {
				self.error.msg(data.body);
			}
			self.button.reset();
		}, 'json');
	};

	self.updateEmail = function() {
		if(self.button.status() || self.submitStatus2()) return;
		self.button.load();
		self.error.reset();

		var params = {
			"http_method": 'post',
			"emailAddress": self.emailAddress(),
			"validationPath": location.protocol + '//' + location.host + '/ChangeEmail'
		};

		$.ajaxSetup({ cache: false, async: true });
		$.post('/ams/agents/update/email', params, function(data){
			data = checkSessionExpired(data);

			if(data.error == 0){
				gritter(1, window.lang['success']['changeEmail']);
				alert(window.lang['success']['changeEmail']);
				obj.modal('hide');
			} else {
				self.error.msg(data.body);
			}
			self.button.reset();
		}, 'json');
	};

	self.setLanguage = function(){
		if(self.button.status()) return;
		self.button.load();
		self.error.reset();
		var params = {
			"changeLanguage": self.language()
		};

		$.ajaxSetup({ cache: false, async: true });
		$.post('/ams/Common/changeDetail', params, function(data){
			data = checkSessionExpired(data);

			if(data.error == 0){
				gritter(1, window.lang['success']['changeLanguage']);
				setTimeout(function(){
					location.reload();
				}, 500);
			} else {
				gritter(data.comment);
			}
		}, 'json');
	};

	self.setTimezone = function(){
		if(self.button.status()) return;
		self.button.load();
		self.error.reset();
		var params = {
			"changeTimezone": self.timezone()
		};

		$.ajaxSetup({ cache: false, async: true });
		$.post('/ams/Common/changeDetail', params, function(data){
			data = checkSessionExpired(data);

			if(data.error == 0){
				gritter(1, window.lang['success']['changeTimezone']);
				setTimeout(function(){
					location.reload();
				}, 500);
			} else {
				gritter(data.comment);
			}
		}, 'json');
	};
};

var getLastUpdatedString = function(lastUpdatedMinutes){
	if(isEmpty(lastUpdatedMinutes)) return;
	return window.lang['string']['lastUpdatedMinutes'].replace('{min}', number_format(lastUpdatedMinutes));
};

var objectName2String = function(val1, val2){
	var rst = val1;
	if(!isEmpty(val2)) rst += val2.substring(0,1).toUpperCase() + val2.substring(1);
	return rst;
};

var covertFormat = function(row, formatObj){
	var formats = [];
	for(format in formatObj){
		formats.push(format);
	}
	for(k in row){
		for(var i = 0; i < formats.length; i++){
			var format = formats[i];
			if(in_array(k, formatObj[formats[i]])){
				if(!isEmpty(row[k]) && typeof row[k] == 'object'){
					for(k2 in row[k]){
						if(isEmpty(row[k][k2]) && in_array(formats[i],['money', 'int', 'percentage'])) row[k][k2] = 0;
						row[objectName2String(k, k2)] = dataFormat(row[k][k2], format);
					}
				}else{
					if(isEmpty(row[k]) && in_array(formats[i],['money', 'int', 'percentage'])) row[k] = 0;
					row[k] = dataFormat(row[k], format);
				}
			}
		}
	}
	return row;
};

var SearchToggle = function(val, trueCss, falseCss){
	var self = this;
	trueCss = (isEmpty(trueCss)) ? '': ' ' + trueCss;
	falseCss = (isEmpty(trueCss)) ? '': ' ' + falseCss;

	self.val = ko.observable(val);

	self.css = ko.computed(function(){
		var rst = 'active';
		return (self.val() == 'true') ? 'active' + trueCss : falseCss;
	});

	self.cssCheck = ko.computed(function(){
		return (self.val() == 'true') ? 'fa-check-square-o' : 'fa-square-o';
	});

	self.toggle = function(){
		if(self.val() == 'true'){
			self.val('false');
		}else{
			self.val('true');
		}
	};

	self.reset = function(){
		self.val(val);
	};
};

var DTSetFooter = function(api, row, DT){
	if(row == null){
		$(DT.element).find('tfoot tr th:gt(0)').html('');
		return;
	}
	$(api.column(0).footer()).removeClass('text-left');
	$(api.column(0).footer()).removeClass('text-right');
	$(api.column(0).footer()).removeClass('text-center');
	$(api.column(0).footer()).addClass('text-left');
	for(k in row){
		if(!isEmpty(row[k]) && typeof row[k] == 'object'){
			for(k2 in row[k]){
				var idx = DT.getColumnIndex(objectName2String(k, k2));
				if(isEmpty(idx) || idx < 1) continue;
				$(api.column(idx).footer()).html(row[objectName2String(k, k2)]);
			}
		}else{
			var idx = DT.getColumnIndex(k);
			if(isEmpty(idx) || idx < 1) continue;
			$(api.column(idx).footer()).html(row[k]);
		}
	}
};

// file download
var CreateHiddenFrame = function CreateHiddenFrame(count){
	var hiddenIFrameID = 'hiddenDownloader' + count;
	var iframe = document.createElement('iframe');
	iframe.id = hiddenIFrameID;
	iframe.name = hiddenIFrameID;
	iframe.style.display = 'none';
	document.body.appendChild(iframe);

	return iframe;
};

var CreateHiddenForm = function CreateHiddenForm(count){
	var hiddenFormID = 'hiddenDownloaderForm' + count;
	var frm = document.createElement('form');
	frm.id = hiddenFormID;
	frm.name = hiddenFormID;
	frm.style.display = 'none';
	document.body.appendChild(frm);

	return frm;
};

function exportToCSV(header, csv, rows, filename) {

	var csvText = csv;
	var csvData = 'data:application/csv;charset=utf-8,' + encodeURIComponent(csvText);

	var iframe, frm;
	var xlsFile = document.createElement('input');
	var xlsHeader = document.createElement('input');
	var xlsData = document.createElement('input');

	iframe = CreateHiddenFrame(0);
	frm = CreateHiddenForm(0);

	xlsFile.type = 'hidden';
	xlsFile.name = 'xlsFile';
	xlsFile.value = filename;

	xlsHeader.type = 'hidden';
	xlsHeader.name = 'xlsHeader';
	xlsHeader.value = json_encode(header);

	xlsData.type = 'hidden';
	xlsData.name = 'xlsData';
	xlsData.value = json_encode(rows);

	frm.appendChild(xlsFile);
	frm.appendChild(xlsHeader);
	frm.appendChild(xlsData);

	frm.method = 'post';
	frm.target = $(iframe).attr('name');
	frm.action = '/ams/common/csvDownload';

	frm.submit();
}

function downloadCsv(url, params, filename){
	var iframe, frm;
	var xlsURL = document.createElement('input');
	var xlsParams = document.createElement('input');
	var xlsFilename = document.createElement('input');

	iframe = CreateHiddenFrame(0);
	frm = CreateHiddenForm(0);

	xlsURL.type = 'hidden';
	xlsURL.name = 'xlsURL';
	xlsURL.value = url;

	xlsParams.type = 'hidden';
	xlsParams.name = 'xlsParams';
	xlsParams.value = params;

	xlsFilename.type = 'hidden';
	xlsFilename.name = 'xlsFilename';
	xlsFilename.value = filename;

	frm.appendChild(xlsURL);
	frm.appendChild(xlsParams);
	frm.appendChild(xlsFilename);

	frm.method = 'post';
	frm.target = $(iframe).attr('name');
	frm.action = '/ams/common/downloadCsv';

	frm.submit();
}

function copy2clipboard(text, msg) {
	var IE = (document.all) ? true : false;

	//if (IE) {
	//	window.clipboardData.setData('Text', text);
	//	return true;
	//} else {
		var temp = prompt(msg, text );
		if(temp) return true;
	//}
}

$.ajaxSetup({ beforeSend: function(xhr){
	var i = new Image();
	var ajaxObj = xhr;
	var modalHTML = '\
		<div id="networkError" class="modal fade">\
			<div class="modal-dialog">\
				<div class="modal-content">\
					<div id="networkError" class="modal-body alert alert-warning no-margin-bottom">\
						<h4>' + window.lang['title']['error'] + '</h4>\
						<p>' + window.lang['error']['NETWORK_ERROR'] + '</p>\
						<button type="button" class="btn btn-block btn-flat btn-warning no-margin-bottom no-margin-left margin-top-10" onclick="location.reload()">\
							<i class="fa fa-check"></i>\
							'+ window.lang['buttons']['ok'] +'\
						</button>\
					</div>\
				</div>\
			</div>\
		</div>\
	';
	if(!isEmpty(window.navigator) && window.navigator.onLine == false){
		ajaxObj.abort();
		$(modalHTML).appendTo("body");
		$('#networkError').modal({backdrop: 'static', keyboard: false});
		setTimeout(function(){
			$('#networkError').modal('show');
		}, 1);
		return false;
	}
	$(i).error(function(){
		ajaxObj.abort();
		if($('#networkError').length < 1){
			$(modalHTML).appendTo("body");
			$('#networkError').modal({backdrop: 'static', keyboard: false});
			setTimeout(function(){
				$('#networkError').modal('show');
			}, 1);

		}
	});
	i.src = location.protocol + '//' + location.host + '/static/img/chk_online.gif?d=' + $.now();
	return true;
}});