// calendar
ko.extenders.calendar = function(target, option) {
	target.today = moment();

	target.startDate = ko.computed(function(){
		var val = target();

		if(isEmpty(val)){
			return '';
		}else{
			return moment(val, 'YYYY MMM D').format('YYYY-MM-DD') + 'T00:00:00Z';
		}
	});

	target.endDate = ko.computed(function(){
		var val = target();

		if(isEmpty(val)){
			return '';
		}else{
			return moment(val, 'YYYY MMM D').format('YYYY-MM-DD') + 'T23:59:59Z';
		}
	});

	return target;
};