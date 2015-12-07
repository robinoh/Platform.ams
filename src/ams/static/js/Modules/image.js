var Dropper = function(options){
	var self = this;

	self.ModalAlert = options.ModalAlert;

	self.id = options.id;
	self.element = $("#" + self.id);
	self.options = {
		action: options.action,
		label: options.label,
		maxQueue: options.maxQueue,
		maxSize: 2097152,
		postKey: options.postKey
	};

	self.status = ko.observable(false);

	self.imageData = ko.observable('');
	self.cropData = ko.observable({});

	self.fnImageSize = function(data){
		var html = '<div class="image-cropper">{image}</div>';
		var img = '<img src="{src}" width="{width}" height="{height}"{style}>';
		var width = data.width;
		var height = data.height;
		var areaWidth = self.element.width();
		var areaHeight = self.element.height();
		var areaRatio = areaWidth / areaHeight;
		var imgRatio = width / height;
		var dstWidth = areaWidth;
		var dstHeight = areaHeight;
		var inlineStyle = '';

		if(areaRatio > imgRatio){
			dstWidth = parseInt((width / height) * areaHeight);
			dstHeight = areaHeight;
		}

		if(areaRatio < imgRatio){
			dstWidth = areaWidth;
			dstHeight = parseInt((height / width) * areaWidth);

			inlineStyle = ' style="margin-top: ' + parseInt((areaHeight - dstHeight) / 2) + 'px"';
		}

		img = img.replace('{src}', data.src);
		img = img.replace('{width}', dstWidth);
		img = img.replace('{height}', dstHeight);
		img = img.replace('{style}', inlineStyle);

		html = html.replace('{image}', img);

		self.element.html(html);

		self.element.find('.image-cropper > img').cropper({
			aspectRatio: 1,
			guides: false,
			dragCrop: false,
			zoomable: false,
			mouseWheelZoom: false,
			touchDragZoom: false,
			rotatable: false,
			responsive: false,
			strict: false,
			crop: function(data) {
				self.cropData(data);
			}
		});

		self.status(false);
	};

	self.dropperLoad = function(){
		self.element.find('.image-dropper').dropper(
			self.options
		).on('fileComplete.dropper', function(e, file, data){
			data = debugLog(data);

			if(data.error == 0){
				self.imageData(data.body.base64);
				self.cropData({});

				self.fnImageSize(data.body.imgInfo);
			}else{
				self.ModalAlert.show(0, data);
			}
		}).on('fileError.dropper', function(e, file, data){
			var body, comment;

			if(file.size > self.options.maxSize){
				body = 'INVALID_FILE_SIZE';
				comment = self.options.maxSize / 1024 / 1024;

				self.ModalAlert.show(0, {
					"error": 500,
					"body": body,
					"comment": comment
				});
			}
		});
	};

	self.renderHtml = function(){
		var html = '\
			<div class="image-dropper ' + ((window.location.pathname == '/users/profile') ? 'users-profile' : '') + '"></div>\
		';
		self.element.html(html);

		self.dropperLoad();
	};

	self.renderHtml();
};