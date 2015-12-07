ko.bindingHandlers.stopBindings = {
	init: function() {
		return { controlsDescendantBindings: true };
	}
};
ko.virtualElements.allowedBindings.stopBindings = true;

// DataTable
ko.bindingHandlers.DataTable = {
	init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
		var config = valueAccessor();

		viewModel.DT.init(element, config, false);
	},
	update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {

	}
};

// popover
ko.bindingHandlers.popover = {
	init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
		var ele = $(element);
		var allBindings = allBindingsAccessor();

		ele.popover({
			animation: false,
			container: 'body',
			delay: 0,
			placement: valueAccessor(),
			trigger: 'manual'
		});

		ele.on("keyup", function (e){
			var hasError = allBindings.value.hasError();
			var toggle = hasError ? 'show' : 'hide';

			ele.popover(toggle);
		});
	}
};

// key event
ko.bindingHandlers.executeOnEnter = {
	init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
		var allBindings = allBindingsAccessor();
		$(element).keypress(function (e) {
			var keyCode = (e.which ? e.which : e.keyCode);
			if (keyCode === 13) {
				allBindings.executeOnEnter.call(viewModel);
				return false;
			}
			return true;
		});
	}
};
ko.bindingHandlers.executeKeyup = {
	init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
		var allBindings = allBindingsAccessor();
		$(element).keyup(function (e) {
			allBindings.executeKeyup(e, element, viewModel, bindingContext);
			return false;
		});
	}
};
ko.bindingHandlers.executeKeydown = {
	init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
		var allBindings = allBindingsAccessor();
		$(element).keypress(function (e) {
			allBindings.executeKeydown.call(e, element, viewModel, bindingContext);
			return false;
		});
	}
};

// focus event
ko.bindingHandlers.executeFocusIn = {
	init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
		var allBindings = allBindingsAccessor();
		$(element).focus(function () {
			allBindings.executeFocusIn.call(viewModel);
			return false;
		});
	}
};
ko.bindingHandlers.executeFocusOut = {
	init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
		var allBindings = allBindingsAccessor();
		$(element).focusout(function () {
			allBindings.executeFocusOut(element, viewModel, bindingContext);
			return false;
		});
	}
};

// binding custom html
window.templateEngine = new ko.nativeTemplateEngine();
window.templateEngine.addTemplate = function(element, templateName, templateMarkup) {
	$(element).append("<script type='text/html' id='" + templateName + "'>" + templateMarkup + "<" + "/script>");
};

window.bindTo = function (view, name, element, context, html) {
	$('#'+name).remove();
	self.templateEngine.addTemplate(element, name, html);
	var container = $(element).find(context);
	ko.renderTemplate(name, view, { templateEngine: self.templateEngine }, container, "replaceNode");
};