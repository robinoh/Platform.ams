var Today = function(){
	var self = this;

	self.today = null;

	$.ajaxSetup({cache: false, async: false});
	$.post("/Ajax/nowDate", function(now){
		self.today =  convertDate(now);
	}, 'json');

	return self.today;
};

// get utc time
var UtcNow = function(){
	var self = this;

	self.d = null;

	$.ajaxSetup({cache: false, async: false});
	$.post("/Ajax/nowDate", function(now){
		self.d = moment.utc(now);
	}, 'json');

	return self.d;
};

// get now time
var NowTime = function(){
	var d = new UtcNow();
	var offset = int2Time();

	return d.add(offset);
};

// unix timestamp
var GetTimestamp = function(){
	var self = this;

	self.offset = int2Time();
	self.d = null;
	self.nowTime = null;

	$.ajaxSetup({cache: false, async: false});
	$.post("/Ajax/nowDate", function(now){
		self.d = moment(now);
	}, 'json');

	self.nowTime = self.d.add(self.offset);

	self.time = function(){
		return moment(self.nowTime).unix();
	};
};

function int2Time(num, ms){
	num = (isEmpty(num)) ? window.userData['timezoneOffset'] : num;
	ms = (isEmpty(ms)) ? true : ms;

	var divider = {"h": (60*60), "m": 60};
	var time = {"hours": 0, "minutes": 0, "seconds": 0};
	var h, m, s;
	var offset = (ms) ? num / 1000 : num;

	// hours
	h = offset / divider.h;
	h = Math.floor(h);

	// minutes
	m = (offset - (h * divider.h)) / divider.m;
	m = Math.floor(m);

	// minutes
	s = (offset - (h * divider.h) - (m * divider.m));

	time.hours = h;
	time.minutes = m;
	time.seconds = s;

	return time;
}

// convert datetime
function convertDate(val, format, nonFix){
	var str = val;
	var offset = int2Time();

	if(!isEmpty(str)){
		format = (isEmpty(format)) ? 'YYYY-MM-DD HH:mm:ss' : format;

		if(nonFix){
			str = moment.utc(val).format(format);
		}else{
			str = moment.utc(val).add(offset).format(format);
		}
		//str = moment.utc(val).format(format);
	}

	return str;
}