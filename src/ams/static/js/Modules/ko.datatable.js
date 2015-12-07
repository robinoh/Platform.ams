var DataTableClass = function(options, parent){
	var self = this;

	// define datatables variable
	self.oTable = null;

	// define object and config
	self.pageId = isEmpty(options.pageId) ? 'body' : options.pageId;
	self.pageObject = isEmpty(options.pageId) ? $('body') : $('#' + options.pageId);
	self.parent = parent;
	self.element = null;
	self.config = null;
	self.settings = {
		"autoLoad": true,
		"useCheck": false,
		"useSetPage": true,
		"useButtons": true,
		"useDownload": true,
		"useToolbar": false,
		"paging": [
			{ "size": 10, "title": '10 ' + window.lang['string']['rows'] },
			{ "size": 20, "title": '20 ' + window.lang['string']['rows'] },
			{ "size": 30, "title": '30 ' + window.lang['string']['rows'] },
			{ "size": 50, "title": '50 ' + window.lang['string']['rows'] },
			{ "size": 100, "title": '100 ' + window.lang['string']['rows'] }
		],
		"language": {
			"columns": 'Columns',
			"save": 'Close',
			"rows": 'Rows',
			"download": 'Download'
		}
	};

	// define setting observable
	self.status = ko.observable(true);
	self.button = new ButtonClass();
	self.isSetLoading = false;
	self.isVisible = ko.observable(false);
	self.pageItems = ko.observable(0);
	self.pageSize = ko.observable(20);
	self.columns = ko.observableArray([]);
	self.selectedColumns = ko.observableArray([]);
	self.defaultColumn = ko.observable('');

	self.tableHeader = ko.observable(false);
	self.tableFooter = ko.observable(false);

	// define parameters
	self.params = ko.computed(function(){
		return function(d){
			d.http_method = isEmpty(options.method) ? 'get' : options.method;
			d.customParams = isEmpty(self.parent.params()) ? {} : json_encode(self.parent.params());
		}
	});

	// columns setting
	self.setColumn = function(col){
		return {
			"name": col.name,
			"data": col.name,
			"title": col.title,
			"className": col.className,
			"orderable": col.orderable,
			"orderName": isEmpty(col.orderName) ? col.name : col.orderName,
			"width": col.width,
			"type": isEmpty(col.type) ? "html" : col.type,
			"visible": col.visible
		};
	};

	// get column index
	self.getColumnIndex = function(key){
		var idx = 0;
		var start = self.settings.useCheck ? 1 : 0;
		var columns = self.columns();

		for(var i=0;i<columns.length;i++){
			if(columns[i]['name'] == key){
				idx = i;
				break;
			}
		}

		return idx + start;
	};

	// get column option
	self.getColumnOption = function(key){
		var oCol;
		var columns = self.columns();

		for(var i=0;i<columns.length;i++){
			if(columns[i]['name'] == key){
				oCol = columns[i];
				break;
			}
		}

		return oCol;
	};

	// set sorting
	self.setSortColumns = function(sort){
		var result = [];
		var idx = 0;

		for(var i=0;i<sort.length;i++){
			var key = sort[i][0];

			if(typeof key == "number"){
				idx = key;
			}else{
				idx = self.getColumnIndex(key);
			}

			result.push([idx, sort[i][1]]);
		}

		return result;
	};

	// define default options
	self.setOptions = function(){
		self.options = {};
		self.options = {
			"paging": true,
			"pagingType": "full_numbers_total",
			"pageLength": self.pageSize(),
			"autoWidth": false,
			"lengthChange": false,
			"searching": false,
			"info": false,
			"ordering": true,
			"orderMulti": false,
			"processing": false,
			"language": {
				"loadingRecords": '<i class="fa fa-spinner fa-spin"></i>' + window.lang['string']['datatableLoading'],
				"processing": '<i class="fa fa-spinner fa-spin"></i>' + window.lang['string']['datatableLoading'],
				"sEmptyTable": '<div class="text-center">' + window.lang['string']['datatableNoData'] + '</div>',
				"sZeroRecords": '<div class="text-center">' + window.lang['string']['datatableNoData'] + '</div>',
				"beforeLoad": '<div class="text-center">' + window.lang['string']['datatableBeforeLoad'] + '</div>'
			},
			"serverSide": true,
			"ajax": {
				"url": '',
				"type": 'POST',
				"cache": false,
				"async": true,
				"data": self.params(),
				"dataType": 'json',
				"dataSrc": function(json){
					if(typeof window.console != 'undefined' && typeof window.console.log != 'undefined'){
						if(json.isDebug){
							console.log(json);
						}
					}

					if(json.error == 0){
						self.pageItems(json.data.length);

						if(typeof options.fnDataRebuild == "function"){
							for(var i = 0; i < json.data.length; i++){
								json.data[i] = options.fnDataRebuild(json.data[i]);
							}
						}
					}else{
						console.log('error!!');
					}

					return json.data;
				}
			},
			"createdRow": false,
			"rowCallback": false,
			"footerCallback": false,
			"drawCallback": false,
			"order": [],
			"columns": []
		};


		/*
		 * custom options
		 */
		// paging
		if(typeof options.paging == "boolean"){
			self.options.paging = options.paging;
		}

		// pagingType
		if(typeof options.pagingType == "string"){
			self.options.pagingType = options.pagingType;
		}

		// autoWidth
		if(typeof options.autoWidth == "boolean"){
			self.options.autoWidth = options.autoWidth;
		}

		// searching
		if(typeof options.searching == "boolean"){
			self.options.searching = options.searching;
		}

		// ordering
		if(typeof options.ordering == "boolean"){
			self.options.ordering = options.ordering;
		}

		// orderMulti
		if(typeof options.orderMulti == "boolean"){
			self.options.orderMulti = options.orderMulti;
		}

		// language
		if(typeof options.language == "object"){
			self.options.language = options.language;
		}

		// serverSide
		if(typeof options.serverSide == "boolean"){
			self.options.serverSide = options.serverSide;
		}

		// ajax
		if(typeof options.ajax == "boolean" || typeof options.ajax == "object"){
			self.options.ajax = options.ajax;
		}

		// ajax url
		if(typeof options.url == "string"){
			self.options.ajax.url = options.url;
		}

		// json data
		if(typeof options.data == "object"){
			self.options.data = options.data;
		}

		// row callback(html)
		if(typeof options.createdRow == "function"){
			self.options.createdRow = options.createdRow;
		}

		// row callback(function)
		if(typeof options.rowCallback == "function"){
			self.options.rowCallback = options.rowCallback;
		}

		// footer callback(function)
		if(typeof options.footerCallback == "function"){
			self.options.footerCallback = options.footerCallback;
		}

		// footer callback(function)
		if(typeof options.drawCallback == "function"){
			self.options.drawCallback = options.drawCallback;
		}



		/*
		 * custom settings
		 */
		// using auto load
		if(typeof options.autoLoad == "boolean"){
			self.settings.autoLoad = options.autoLoad;
		}

		// using checkbox
		if(typeof options.useCheck == "boolean"){
			self.settings.useCheck = options.useCheck;
		}

		// using setting buttons
		if(typeof options.useButtons == "boolean"){
			self.settings.useButtons = options.useButtons;
		}

		// useSetPage
		if(typeof options.useSetPage == "boolean"){
			self.settings.useSetPage = options.useSetPage;
		}

		// useDownload
		if(typeof options.useDownload == "boolean"){
			self.settings.useDownload = options.useDownload;
		}

		// using setting buttons
		if(typeof options.useSetPage == "boolean"){
			self.settings.useSetPage = options.useSetPage;
		}
	};


	/*
	 * select rows
	 */
	self.checkAll = ko.observable(false);
	self.checkIdx = ko.observableArray([]);

	// check css class
	self.checkClass = function(ele){
		var idx = self.element.find('.btn-checkbox').index($(ele).parent());
		var rowIndex = idx - 1;
		var css = '';

		if(self.checkAll() || self.checkIdx().length == self.pageSize()){
			css = 'active';
		}else{
			css = (self.checkIdx.indexOf(rowIndex) > -1) ? 'active' : '';
		}

		return css;
	};

	// select all function
	self.fnCheckAll = function(type){
		self.checkIdx.removeAll();

		self.checkAll(type);

		if(type){
			for(var i = 0; i < self.pageSize(); i++){
				self.checkIdx.push(i);
			}

			self.element.find('tbody tr').each(function(){
				if($(this).hasClass('active') == false){
					$(this).addClass('active');
				}
			});
		}else{
			self.element.find('tbody tr').removeClass('active');
		}

		var checked = false;
		var checkBox = self.element.find('.btn-checkbox');

		for (var i=0; i<checkBox.length; i++){
			if ($(checkBox).eq(i).find('a').hasClass('active')){
				checked = true;
				break;
			}
		}

		var transfer = $("#btnPlayersTransfer");

		if(!isEmpty(transfer)){
			transfer.addClass('hidden')

		}

		var rakeback = $("#btnPlayersRakeBack");
		if(!isEmpty(rakeback)){
			rakeback.addClass('hidden')
		}
	};

	// get selected rows data
	self.getCheckRows = function(){
		var data = self.oTable.data();
		var result = [];

		$.each(self.checkIdx(), function(i, row){
			if (!isEmpty(data[row])){
				result.push(data[row]);
			}
		});

		return result;
	};

	// row select
	self.rowCheck = function(viewModel, e){
		var idx = self.element.find('.btn-checkbox').index($(e.currentTarget).parent());
		var rowIndex = idx - 1;

		if(idx == 0){
			if(self.checkAll()){
				self.fnCheckAll(false);
			}else{
				self.fnCheckAll(true);
			}
		}else{
			if(self.checkAll()){
				self.checkAll(false);
			}

			if(self.checkIdx.indexOf(rowIndex) > -1){
				self.checkIdx.remove(rowIndex);
			}else{
				self.checkIdx.push(rowIndex);
			}
		}

		var checked = false;
		var checkBox = self.element.find('.btn-checkbox');

		for (var i=0; i<checkBox.length; i++){
			if ($(checkBox).eq(i).find('a').hasClass('active')){
				checked = true;
				break;
			}
		}

		var transfer = $("#btnPlayersTransfer");

		if(!isEmpty(transfer)){
			if (checked == true){
				transfer.removeClass('hidden');
			} else {
				transfer.addClass('hidden')
			}
		}

		var rakeback = $("#btnPlayersRakeBack");
		if(!isEmpty(rakeback)){
			if (checked == true){
				rakeback.removeClass('hidden');
			} else {
				rakeback.addClass('hidden')
			}
		}
	};


	/*
	 * pagination
	 */
	self.setPageSize = function(p){
		if(self.pageSize() == p) return;

		self.pageSize(p);
		self.load();
	};
	self.pageSelectorClass = function (num) {
		return (self.pageSize() == num) ? 'active' : '';
	};

	/*
	 * show/hide columns
	 */
	self.columnShowChecked = function(idx){
		return (in_array(idx, self.selectedColumns())) ? 'active' : '';
	};
	self.toggleShowColumn = function(key, showHide){
		var idx = self.getColumnIndex(key);
		var toggle;

		if(self.selectedColumns.indexOf(key) > -1){
			self.selectedColumns.remove(key);
			toggle = false;
		}else{
			self.selectedColumns.push(key);
			toggle = true;
		}

		self.oTable.column(idx).visible(toggle);
	};


	// save settings
	self.saveSetting = function(ele){
		$(ele).parents('.btn-group.dropdown').removeClass('open');
	};


	/*
	 * data download
	 */
	self.download = function(){
		var params = self.oTable.ajax.params();
		var orderParam = self.oTable.order();
		var order;
		var columns = self.columns();
		params.csv = true;
		$.ajaxSetup({cache: false, async: true});

		var url = self.options.ajax.url + '/download';
		var paramsX = json_encode(params);

		var filename = window.vm.nav.pageId() + '.';
		if(!isEmpty(self.parent.tabSelected)){
			filename += self.parent.tabSelected() + '.';
		}
		if(!isEmpty(self.parent.group)){
			filename += self.parent.group() + '.';
		}
		if(!isEmpty(self.parent.params().startDate)){
			var startDate = convertDate(self.parent.params().startDate, 'YYYYMMDD');
			var endDate = convertDate(self.parent.params().endDate, 'YYYYMMDD');
			filename += startDate;
			if(startDate != endDate) filename += endDate;
		}else{
			filename += (new Date()).getTime();
		}
		filename += '.csv';
		filename = filename.toLowerCase();

		downloadCsv(url, paramsX, filename);
	};


	// render buttons html
	self.renderSetPage = function(){
		var lang = self.settings.language;
		var html = '\
			<div class="datatable-buttons"  data-bind="visible: isVisible()">\
				<!-- ko if: settings.useButtons -->\
				<div class="btn-group dropdown hidden">\
					<a class="btn btn-flat btn-info dropdown-toggle dropdown-static" data-toggle="dropdown">\
						<i class="fa fa-cog"></i>\
						<span>' + lang.columns + '</span>\
					</a>\
					<ul class="dropdown-menu pull-right checkbox btn-checkbox" role="menu" style="margin-top: 3px;">\
						<!-- ko foreach: columns-->\
						<li>\
							<a data-bind="click: function(){ $root.toggleShowColumn(name); }, css: $root.columnShowChecked(name)">\
								<i class="fa"></i>\
								<span data-bind="text: strip_tags(title)"></span>\
							</a>\
						</li>\
						<!-- /ko -->\
						<li class="divider"></li>\
						<li class="text-center" style="padding: 0 5px 5px;">\
							<button class="btn btn-flat btn-default btn-block btn-sm" data-bind="click: function(){ saveSetting($element); }">' + lang.save + '</button>\
						</li>\
					</ul>\
				</div>\
				<div class="btn-group dropdown" data-bind="visible: isVisible()">\
					<a class="btn btn-flat btn-sm btn-default dropdown-toggle" data-toggle="dropdown">\
						<i class="fa fa-list-ol"></i>\
						<span class="hidden">' + lang.rows + '</span>\
					</a>\
					<!-- ko if: settings.useDownload -->\
					<a class="btn btn-flat btn-sm btn-default" data-bind="click: function(){ download($element); }">\
						<i class="fa fa-download fa-fw"></i>\
						<span class="hidden">' + lang.download + '</span>\
					</a>\
					<!-- /ko -->\
					<ul class="dropdown-menu pull-right checkbox btn-checkbox" role="menu" style="margin-top: 3px;">\
						<!-- ko foreach: settings.paging-->\
						<li>\
							<a data-bind="click: function(){ $root.setPageSize(size); }, css: $root.pageSelectorClass(size)">\
								<i class="fa"></i>\
								<span data-bind="text: title"></span>\
							</a>\
						</li>\
						<!-- /ko -->\
					</ul>\
				</div>\
				<!-- /ko -->\
			</div>\
		';

		window.bindTo(self, self.pageId + "_table_setting", self.pageObject, '.datatable-setting', html);
	};


	// datatables initialisation
	self.init = function(element, config, isRedraw){

		if(typeof isRedraw != "boolean"){
			isRedraw = false;
		}

		// set config
		self.config = config;

		// set options
		var url = '';
		var order = [];
		if(isRedraw){
			url = self.options.ajax.url;
			order = self.options.order;
		}
		self.setOptions();
		if(isRedraw){
			self.options.ajax.url = url;
			options.order = order;
		}

		self.element = isRedraw ? element : $(element);

		self.setProcessing();

		// rows count by page
		self.pageSize(self.config.PageSize);
		self.options.pageLength = self.pageSize();

		// table contents
		self.tableHeader(isEmpty(self.config.tableHeader) ? false : self.config.tableHeader);
		self.tableFooter(isEmpty(self.config.tableFooter) ? false : self.config.tableFooter);

		if(self.tableHeader() !== false){
			if(self.element.find('thead').length < 1){
				self.element.append('<thead></thead>');
			}

			self.element.find('thead').html(self.tableHeader());
		}

		if(self.tableFooter() !== false){
			if(self.element.find('tfoot').length < 1){
				self.element.append('<tfoot></tfoot>');
			}

			self.element.find('tfoot').html(self.tableFooter());
		}

		// set columns
		self.columns(self.config.Columns);
		self.defaultColumn(self.config.DefaultColumn);

		self.options.columns = [];

		if(self.settings.useCheck){
			$('#' + self.pageId + '_DT_checkbox').remove();

			var checkboxHtml = '\
				<div class="btn-checkbox">\
					<a class="text-muted" data-bind="css: checkClass($element), click: function(data, event){ rowCheck(data, event); }">\
						<i class="fa"></i>\
					</a>\
				</div>\
			';
			window.templateEngine.addTemplate(self.element.parent(), self.pageId + "_DT_checkbox", checkboxHtml);

			// checkbox column
			self.options.columns.push({
				"name": 'checkbox',
				"data": 'checkbox',
				"render": function ( data, type, row, meta ){
					return '<div class="btn-checkbox"></div>';
				},
				"title": '<div class="btn-checkbox"></div>',
				"className": 'text-center',
				"orderable": false,
				"width": '30px',
				"type": "html",
				"visible": true
			});

			//self.options.stateSave = true;
			var draw = self.options.drawCallback;
			self.options.drawCallback = function(settings){
				var container = self.element.find('.btn-checkbox');

				$.each(container, function(i, row){
					ko.renderTemplate(self.pageId + "_DT_checkbox", self, {templateEngine: window.templateEngine}, row, "replaceNode");
				});

				// reset selected
				self.fnCheckAll(false);

				// selected rows css class
				self.element.on('click', 'tbody tr .btn-checkbox a', function(){
					if($(this).hasClass('active')){
						$(this).parents('tr').addClass('active');
					}else{
						$(this).parents('tr').removeClass('active');
					}
				});

				if (draw){
					draw();
				}
			};
		}
		self.selectedColumns([]);
		$.each(self.columns(), function(i, col){
			if(col.visible){
				self.selectedColumns.push(col.name);
			}

			self.options.columns.push(self.setColumn(col));
		});

		// set order option
		if(is_array(options.order)){
			self.options.order = self.setSortColumns(options.order);
		}

		// render setting bottons
		if(self.settings.useSetPage && !isRedraw){
			self.renderSetPage();
		}

		// loading html
		self.loadingHtml = '\
				<tr>\
					<td class="text-center" colspan="999" style="padding: 20px 0;">\
						' + self.options.language.processing + '\
					</td>\
				</tr>\
			';
		self.readyHTML = '\
				<tr>\
					<td class="text-center" colspan="999" style="padding: 20px 0;">\
						' + self.options.language.beforeLoad + '\
					</td>\
				</tr>\
			';
		// redraw
		if(isRedraw || self.settings.autoLoad){
			self.element.find('tbody').html(self.loadingHtml);
			self.load();
		}else{
			self.element.find('thead tr:gt(0)').hide();
			self.element.find('tbody').html(self.readyHTML);
			self.element.find('tfoot').hide();
		}
	};


	// datatables load
	self.load = function(){
		if(self.button.status()) return;
		self.element.find('thead tr:gt(0)').show();
		self.element.find('tfoot').show();

		if($.fn.DataTable.isDataTable(self.element)){
			// checkbox
			if(self.settings.useCheck){
				self.fnCheckAll(false);
			}

			// paging
			self.oTable.page(0);
			self.oTable.page.len(self.pageSize());

			// sorting
			self.oTable.order(self.setSortColumns(self.options.order));

			// ajax url
			if(self.options.serverSide && self.options.ajax !== false){
				self.oTable.ajax.url(self.options.ajax.url);
			}

			// table redraw
			self.oTable.draw();
		}else{
			self.oTable = self.element.DataTable(self.options);
		}

		if(self.settings.useCheck){
			self.playersTransferRakeBack();
		}

		self.isVisible(true);
	};

	self.reload = function(){
		if(self.button.status()) return;
		self.oTable.ajax.reload(null, false);
	};

	// datatable redraw
	self.redraw = function(config){
		if(self.button.status()) return;
		self.oTable = self.oTable.clear();
		self.oTable = self.oTable.destroy();

		if(self.settings.useCheck){
			self.playersTransferRakeBack();
		}

		// html reset
		self.element.empty().html('<thead></thead><tbody></tbody>');

		// table initialisation
		self.init(self.element, config, true);
	};

	self.playersTransferRakeBack = function(){
		var transfer = $("#btnPlayersTransfer");
		if (!transfer.hasClass('hidden')){
			transfer.addClass('hidden');
		}

		var rakeback = $("#btnPlayersRakeBack");
		if (!rakeback.hasClass('hidden')){
			rakeback.addClass('hidden');
		}
	};

	self.setProcessing = function(){
		if(self.isSetLoading == false){
			self.element.off('preXhr.dt').on('preXhr.dt', function(){
				self.button.load();
			});
			self.element.off('xhr.dt').on('xhr.dt', function(){
				self.button.reset();
			});
			self.isSetLoading = true;
		}
	};
};