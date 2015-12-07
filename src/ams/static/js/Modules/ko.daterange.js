var DateRangeViewModel = function(params, componentInfo){
	var self = this;

	// html dom element
	self.element = $(componentInfo.element);

	// variable
	self.dateFrom = params.dateFrom;
	self.dateTo = params.dateTo;
	self.placeholder = params.placeholder;
	self.selectedRange = params.selectedRange;
	self.selectedCustom = params.selectedCustom;
	self.custom = (typeof params.options == "object") ? params.options : {};
	self.onlyDate = params.onlyDate;
	self.excludeRange = (isEmpty(params.excludeRange)) ? false : params.excludeRange;

	self.dateLabel = ko.observable(window.lang['calendar']['all']);

	// default options
	self.offset = (typeof self.custom.timeZone == "number") ? self.custom.timeZone : window.userData['timezoneOffset'] / (1000 * 60);

	var thisWeek = [
		(moment().utcOffset(self.offset).format('dddd') == 'Sunday') ? moment().utcOffset(self.offset).day(-6).startOf('day') : moment().utcOffset(self.offset).day("Monday").startOf('day'),
		(moment().utcOffset(self.offset).format('dddd') == 'Sunday') ? moment().utcOffset(self.offset).day("Sunday").startOf('day') : moment().utcOffset(self.offset).day(7).endOf('day')
	];

	var lastWeek = [
		(moment().utcOffset(self.offset).format('dddd') == 'Sunday') ? moment().utcOffset(self.offset).day(-13).startOf('day') : moment().utcOffset(self.offset).day(-6).startOf('day'),
		(moment().utcOffset(self.offset).format('dddd') == 'Sunday') ? moment().utcOffset(self.offset).day(-7).startOf('day') : moment().utcOffset(self.offset).day("Sunday").startOf('day')
	];

	/*
	ranges: {
		'All': ['', ''],
		'Today': [
			moment().utcOffset(self.offset).startOf('day'),
			moment().utcOffset(self.offset).endOf('day')
		],
		'Yesterday': [
			moment().utcOffset(self.offset).subtract(1, 'days').startOf('day'),
			moment().utcOffset(self.offset).subtract(1, 'days').endOf('day')
		],
		'This Week': [
			moment(thisWeek[0]),
			moment(thisWeek[1])
		],
		'Last Week': [
			moment(lastWeek[0]),
			moment(lastWeek[1])
		],
		'This Month': [
			moment().utcOffset(self.offset).startOf('month').startOf('day'),
			moment().utcOffset(self.offset).endOf('month').endOf('day')
		],
		'Last Month': [
			moment().utcOffset(self.offset).subtract(1, 'month').startOf('month').startOf('day'),
			moment().utcOffset(self.offset).subtract(1, 'month').endOf('month').endOf('day')
		],
		'Last 7 Days': [
			moment().utcOffset(self.offset).subtract(7, 'days').startOf('day'),
			moment().utcOffset(self.offset).endOf('day')
		],
		'Last 30 Days': [
			moment().utcOffset(self.offset).subtract(29, 'days').startOf('day'),
			moment().utcOffset(self.offset).endOf('day')
		],
		'Last 90 Days': [
			moment().utcOffset(self.offset).subtract(89, 'days').startOf('day'),
			moment().utcOffset(self.offset).endOf('day')
		]
	},
	*/

	self.setRanges = function(){
		var rst = [];
		var titles = window.calendar.title;
		var ranges = [
			['', ''],
			[
				moment().utcOffset(self.offset).startOf('day'),
				moment().utcOffset(self.offset).endOf('day')
			],
			[
				moment().utcOffset(self.offset).subtract(1, 'days').startOf('day'),
				moment().utcOffset(self.offset).subtract(1, 'days').endOf('day')
			],
			[
				moment(thisWeek[0]),
				moment(thisWeek[1])
			],
			[
				moment(lastWeek[0]),
				moment(lastWeek[1])
			],
			[
				moment().utcOffset(self.offset).startOf('month').startOf('day'),
				moment().utcOffset(self.offset).endOf('month').endOf('day')
			],
			[
				moment().utcOffset(self.offset).subtract(1, 'month').startOf('month').startOf('day'),
				moment().utcOffset(self.offset).subtract(1, 'month').endOf('month').endOf('day')
			],
			[
				moment().utcOffset(self.offset).subtract(6, 'days').startOf('day'),
				moment().utcOffset(self.offset).endOf('day')
			],
			[
				moment().utcOffset(self.offset).subtract(29, 'days').startOf('day'),
				moment().utcOffset(self.offset).endOf('day')
			],
			[
				moment().utcOffset(self.offset).subtract(89, 'days').startOf('day'),
				moment().utcOffset(self.offset).endOf('day')
			]
		];

		for (i=0; i<ranges.length; i++){
			if(isEmpty(self.excludeRange) || (!isEmpty(self.excludeRange) && !in_array(i, self.excludeRange))){
				rst[titles[i]] = ranges[i];
			}
		}

		return rst;
	}

	var ranges = self.setRanges('range');

	self.format = isEmpty(self.onlyDate) ? 'YYYY-MM-DDTHH:mm:ssZ': 'YYYY-MM-DD';
	self.options = {
		startDate: '',
		endDate: '',
		timeZone: self.offset,
		timePicker: false,
		timePickerIncrement: 1,
		timePicker12Hour: false,
		showDropdowns: true,
		opens: 'right',
		drops: 'down',
		format: self.custom.timePicker ? 'YYYY-MM-DD, HH:mm:ss' : 'YYYY-MM-DD',
		ranges: ranges,
		locale: { firstDay: 1 }
	};

	// set custom label
	self.setCustomLabel = function(){
		if(isEmpty(self.custom.locale)){
			self.dateLabel(window.lang['calendar']['customRange']);
		}else{
			if(isEmpty(self.custom.locale.customRangeLabel)){
				self.dateLabel(window.lang['calendar']['customRange']);
			}else{
				self.dateLabel(self.custom.locale.customRangeLabel);
			}
		}
	};

	// selectedRange
	if(typeof self.selectedRange == "number"){
		var i = 0;
		for(label in self.options.ranges){
			if(i == self.selectedRange){
				self.custom.startDate = function(){
					return self.options.ranges[label][0];
				};
				self.custom.endDate = function(){
					return self.options.ranges[label][1];
				};
				self.selectedLabel = label;
				self.dateLabel(label);
				break;
			}
			i++;
		}
		var idx = self.element.index('date-range');
	}

	// select Range
	if (typeof self.selectedCustom == 'number'){
		var i = 0;
		for(label in self.options.ranges){
			if(i == self.selectedCustom){
				self.custom.startDate = function(){
					return self.options.ranges[label][0];
				};
				self.custom.endDate = function(){
					return self.options.ranges[label][1];
				};
				self.selectedLabel = label;
				self.dateLabel(label);
				break;
			}
			i++;
		}
	}

	// startDate
	if(typeof self.custom.startDate == "function"){
		self.options.startDate = self.custom.startDate();
		self.dateFrom(moment(self.custom.startDate()).utcOffset(self.offset).format(self.format));
		if(isEmpty(self.selectedLabel)) self.setCustomLabel();
	}

	// endDate
	if(typeof self.custom.endDate == "function"){
		self.options.endDate = self.custom.endDate();
		self.dateTo(moment(self.custom.endDate()).utcOffset(self.offset).format(self.format));
		if(isEmpty(self.selectedLabel)) self.setCustomLabel();
	}

	// timeZone
	if(typeof self.custom.timeZone == "number"){
		self.options.timeZone = self.custom.timeZone;
	}

	// timePicker
	if(typeof self.custom.timePicker == "boolean"){
		self.options.timePicker = self.custom.timePicker;
	}

	// format
	if(typeof self.custom.format == "string"){
		self.options.format = self.custom.format;
	}

	// opens
	if(typeof self.custom.opens == "string"){
		self.options.opens = self.custom.opens;
	}

	// drops
	if(typeof self.custom.drops == "string"){
		self.options.drops = self.custom.drops;
	}

	// ranges
	if(typeof self.custom.ranges == "object"){
		self.options.ranges = self.custom.ranges;
	}

	// locale
	if(typeof self.custom.locale == "object"){
		self.options.locale = self.custom.locale;
	}

	// display string
	self.DisplayDate = ko.computed(function(){
		var str;
		var start = self.dateFrom();
		var end = self.dateTo();
		var placeholder = self.placeholder;

		if(isEmpty(start)){
			str = (placeholder) ? placeholder : window.lang['columns']['date'];
		}else if(start == end){
			str = moment(start).format(self.options.format);
		}else{
			start = moment(start).utcOffset(self.offset).format(self.options.format);
			end = moment(end).utcOffset(self.offset).format(self.options.format);

			str = start == end ? start: start + ' ~ ' + end;
		}

		return str;
	});

	// element css class
	self.dateClass = ko.computed(function() {
		return isEmpty(self.dateFrom()) ? '' : 'has-success';
	});
	self.buttonClass = ko.computed(function(){
		return isEmpty(self.dateFrom()) ? 'btn-default' : 'btn-success';
	});

	var daterangepicker = self.element.daterangepicker(self.options, function(start, end, label){
		self.dateLabel(label);

		if(isEmpty(start) || isEmpty(end)){
			self.dateFrom('');
			self.dateTo('');
		}else{
			self.dateFrom(start.format(self.format));
			self.dateTo(end.format(self.format));
		}
	});

	return self;
};

ko.components.register('date-range', {
	viewModel: {
		createViewModel: function(params, componentInfo) {
			return new DateRangeViewModel(params, componentInfo);
		}
	},
	template: '\
		<div class="input-group">\
			<span class="form-control">\
				<i class="fa fa-calendar"></i>\
				<span data-bind="text: DisplayDate()"></span>\
			</span>\
			<div class="input-group-btn">\
				<button type="button" class="btn btn-flat btn-default">\
					<span data-bind="text: dateLabel()"></span>\
					<b class="caret"></b>\
				</button>\
			</div>\
		</div>\
	'
});