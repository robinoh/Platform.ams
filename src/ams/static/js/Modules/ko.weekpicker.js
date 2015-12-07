var WeekPickerViewModel = function(params, componentInfo){
	var self = this;

	// html dom element
	self.element = $(componentInfo.element);

	// variable
	self.dateFrom = params.dateFrom;
	self.dateTo = params.dateTo;
	self.startDate = '';
	self.endDate = '';
	self.dateLabel = ko.observable('');
	self.isShowing = false;
	self.drops = 'down';

	// default options
	self.offset = 480;
	self.format = 'YYYY MMM D';
	self.weekRanges = [0, 10];
	self.startOfWeek = 1;
	self.parentEl = $('body');

	// set ranges.
	var DRPTemplate = '<div class="daterangepicker dropdown-menu">' +
		'<div class="ranges"></div>' +
		'</div>' +
		'</div>';
	self.container = $(DRPTemplate).appendTo(self.parentEl);

	self.ranges = {};
	for(var i=self.weekRanges[0];i<=self.weekRanges[1];i++){
		var rangeTitle = i + ' Weeks ago';
		if(i == 0){
			rangeTitle = 'This Week';
		}else if(i == 1){
			rangeTitle = 'Last Week';
		}
		self.ranges[rangeTitle] = [
			moment().utcOffset(self.offset).day(-7 + self.startOfWeek + (-7*(i-1))).startOf('day'),
			moment().utcOffset(self.offset).day((-6 - self.startOfWeek) * (i - 1)).endOf('day')
		];
	}
	var list = '<ul>';
	for (range in self.ranges) {
		list += '<li>' + range + '</li>';
	}
	list += '</ul>';
	self.container.find('.ranges ul').remove();
	self.container.find('.ranges').prepend(list);

	// display string
	self.DisplayDate = ko.computed(function(){
		var str;
		str = moment(self.dateFrom()).format(self.format) + ' ~ ' + moment(self.dateTo()).format(self.format);
		return str;
	});

	// element css class
	self.dateClass = ko.computed(function() {
		return isEmpty(self.dateFrom()) ? '' : 'has-success';
	});
	self.buttonClass = ko.computed(function(){
		return isEmpty(self.dateFrom()) ? 'btn-default' : 'btn-success';
	});

	self.clickRange = function (e) {
		var label = e.target.innerHTML;
		var dates = self.ranges[label];

		self.dateLabel(label);
		self.startDate = dates[0];
		self.endDate = dates[1];

		self.dateFrom(moment(dates[0]).utcOffset(self.offset).format('YYYY-MM-DD'));
		self.dateTo(moment(dates[1]).utcOffset(self.offset).format('YYYY-MM-DD'));

		self.updateCalendars();

		self.hide();
	};

	self.move = function () {
		var parentOffset = { top: 0, left: 0 }, containerTop;
		var parentRightEdge = $(window).width();
		if (!self.parentEl.is('body')) {
			parentOffset = {
				top: self.parentEl.offset().top - self.parentEl.scrollTop(),
				left: self.parentEl.offset().left - self.parentEl.scrollLeft()
			};
			parentRightEdge = self.parentEl[0].clientWidth + self.parentEl.offset().left;
		}

		if (self.drops == 'up')
			containerTop = self.element.offset().top - self.container.outerHeight() - parentOffset.top;
		else
			containerTop = self.element.offset().top + self.element.outerHeight() - parentOffset.top;
		self.container[self.drops == 'up' ? 'addClass' : 'removeClass']('dropup');

		self.container.css({
			top: containerTop,
			left: self.element.offset().left - parentOffset.left,
			right: 'auto'
		});
		if (self.container.offset().left + this.container.outerWidth() > $(window).width()) {
			self.container.css({
				left: 'auto',
				right: 0
			});
		}
	};

	self.toggle = function (e) {
		if (self.element.hasClass('active')) {
			self.hide();
		} else {
			self.show();
		}
	};

	self.show = function(e){
		if (self.isShowing) return;

		self.element.addClass('active');
		self.container.show();
		self.move();

		// Create a click proxy that is private to this instance of datepicker, for unbinding
		self._outsideClickProxy = $.proxy(function (e) { self.outsideClick(e); }, this);
		// Bind global datepicker mousedown for hiding and
		$(document)
			.on('mousedown.daterangepicker', self._outsideClickProxy)
			// also support mobile devices
			.on('touchend.daterangepicker', self._outsideClickProxy)
			// also explicitly play nice with Bootstrap dropdowns, which stopPropagation when clicking them
			.on('click.daterangepicker', '[data-toggle=dropdown]', self._outsideClickProxy)
			// and also close when focus changes to outside the picker (eg. tabbing between controls)
			.on('focusin.daterangepicker', self._outsideClickProxy);

		self.isShowing = true;
		self.element.trigger('show.daterangepicker', this);
	};

	self.hide = function () {
		if (!self.isShowing) return;

		$(document)
			.off('.daterangepicker');

		self.element.removeClass('active');
		self.container.hide();

		self.isShowing = false;
		self.element.trigger('hide.daterangepicker', this);
	};

	self.outsideClick = function (e) {
		var target = $(e.target);
		if (
		// ie modal dialog fix
			e.type == "focusin" ||
				target.closest(self.element).length ||
				target.closest(self.container).length ||
				target.closest('.calendar-date').length
			) return;
		self.hide();
	};

	self.updateCalendars = function(){
		self.container.find('.ranges li').removeClass('active');
		var i = 0;
		for (var range in self.ranges) {
			if(self.startDate == self.ranges[range][0] && self.endDate == self.ranges[range][1]){
				self.dateLabel(self.container.find('.ranges li:eq(' + i + ')').addClass('active').html());
			}
			i++;
		}
	};

	//event listeners
	self.container.find('.ranges').on('click.daterangepicker', 'li', $.proxy(self.clickRange, this));
	if (self.element.is('input')) {
		self.element.on({
			'click.daterangepicker': $.proxy(self.show, this),
			'focus.daterangepicker': $.proxy(self.show, this),
			'keyup.daterangepicker': $.proxy(self.updateFromControl, this),
			'keydown.daterangepicker': $.proxy(self.keydown, this)
		});
	} else {
		self.element.on('click.daterangepicker', $.proxy(self.show, this));
	}

	self.container.find('.ranges li:eq(0)').trigger('click');

	return self;
};

ko.components.register('week-picker', {
	viewModel: {
		createViewModel: function(params, componentInfo) {
			return new WeekPickerViewModel(params, componentInfo);
		}
	},
	template: '\
		<div class="input-group" data-bind="css: dateClass()">\
			<span class="input-group-addon">\
				<i class="fa fa-calendar"></i>\
				<span data-bind="text: DisplayDate()"></span>\
			</span>\
			<div class="input-group-btn">\
				<button type="button" class="btn btn-flat" data-bind="css: buttonClass()">\
					<span data-bind="text: dateLabel()"></span>\
					<b class="caret"></b>\
				</button>\
			</div>\
		</div>\
	'
});