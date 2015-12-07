/*
 * DateSelector
 * defaultDate[string]: default date (format=yyyy-mm-dd) (default=today)
 * autoclose[boolean]: if click date then auto close calendar. (default=true)
 * weekStart[integer]: Day of the week start. 0 (Sunday) to 6 (Saturday) (default=1)
 * format[string]: The date format, combination of d, dd, D, DD, m, mm, M, MM, yy, yyyy. (default='yyyy M d')
 *                 http://bootstrap-datepicker.readthedocs.org/en/latest/options.html#format
 * orientation[string]: calendar position auto/top/bottom/left/right (default='top left')
 * todayBtn[boolean, 'linked']: display today button (default='linked')
 * todayHighlight[boolean]: If true, highlights the current date. (default=true)
 */
ko.bindingHandlers.DatePicker = {
	init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
		// mvvm variable
		var date = valueAccessor();

		// options
		var obj = $(element);
		var custom = allBindings.get('DatePickerOptions');

		var options = {
			"defaultDate": new Date(),
			"autoclose": true,
			"weekStart": 1,
			"format": 'yyyy m d',
			"orientation": 'top left',
			"todayBtn": 'linked',
			"todayHighlight": true
		};

		if(typeof custom == "object"){
			// custom default date
			if(typeof custom.defaultDate == "string"){
				options.defaultDate = new Date(custom.defaultDate);
			}

			// autoclose
			if(typeof custom.autoclose == "boolean"){
				options.autoclose = custom.autoclose;
			}

			// weekStart
			if(typeof custom.weekStart == "number"){
				options.weekStart = custom.weekStart;
			}

			// format
			if(typeof custom.format == "string"){
				options.format = custom.format;
			}

			// orientation
			if(typeof custom.orientation == "string"){
				options.orientation = custom.orientation;
			}

			// todayBtn
			if(typeof custom.todayBtn == "boolean" || custom.todayBtn == 'linked'){
				options.todayBtn = custom.todayBtn;
			}

			// todayHighlight
			if(typeof custom.todayHighlight == "boolean"){
				options.todayHighlight = custom.todayHighlight;
			}
		}

		// apply library
		obj.find('input').attr('readonly','true');
		obj.datepicker(options).on('changeDate', function(e){
			date(e.format());
		});

		obj.datepicker('setDate', options.defaultDate);
	},
	update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {

	}
};