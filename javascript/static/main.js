require.config({
	baseUrl: '/static',
	paths: {
		//'jquery': 'libs/jquery/jquery-2.1.1.min',
		'json': 'libs/requirejs/json',
		'noext': 'libs/requirejs/noext',
		'underscore': 'libs/underscore/underscore-min',
		'backbone': 'libs/backbone/backbone-min',
		'mustcach': 'libs/mustcache/mustcache',
		'nprogress': 'libs/nprogress/nprogress',
		'moment': 'libs/moment/moment.min',
		'pageguide': 'libs/pageguide/jquery.pageguide',
		'noty': 'libs/noty/packaged/jquery.noty.packaged.min',
		'noty.themes': 'libs/noty/themes/default',
		'noty.layouts.bottomRight': 'libs/noty/layouts/bottomRight',
		'noty.layouts.center': 'libs/noty/layouts/center',
		'noty.layouts.topRight': 'libs/noty/layouts/topRight',
		'jquery.highlight': 'libs/jquery/jquery.highlight',
		'datatables': 'libs/datatables/jquery.dataTables.min',
		'datepicker' : 'libs/datetimepicker/bootstrap-datetimepicker.min',
		'select2': 'libs/select2/select2.min',
		'app': 'libs/app',
		'custom': 'libs/custom',
		'current_js': 'view' + location.pathname,
	},
	shim: {
		'datatables': {
			deps: ['jquery'],
			exports: 'jquery'
		},
		'datepicker':{
			deps: ['jquery'],
			exports: 'jquery'
		},
		'select2': {
			deps: ['jquery'],
			exports: 'jquery'
		},
		'jquery.highlight': {
			deps: ['jquery'],
			exports: 'jquery'
		},
		'custom': ["jquery"],
		"pageguide": ["jquery"],
		'noty': ['jquery'],
		'noty.themes': {
			deps: ['jquery', 'noty'],
			exports: 'jquery'
		},
		'noty.layouts.bottomRight': {
			deps: ['jquery', 'noty'],
			exports: 'jquery'
		},
		'noty.layouts.center': {
			deps: ['jquery', 'noty'],
			exports: 'jquery'
		},
		'noty.layouts.topRight': {
			deps: ['jquery', 'noty'],
			exports: 'jquery'
		},
	}

});


require(['jquery', 'app', 'custom', 'current_js', 'noty.layouts.bottomRight', 'noty.themes'], function() {

	$.noty.defaults = {
		layout: 'top',
		theme: 'defaultTheme',
		type: 'alert',
		text: '', // can be html or string
		dismissQueue: true, // If you want to use queue feature set this true
		template: '<div class="noty_message"><span class="noty_text"></span><div class="noty_close"></div></div>',
		animation: {
			open: {
				height: 'toggle'
			},
			close: {
				height: 'toggle'
			},
			easing: 'swing',
			speed: 500 // opening & closing animation speed
		},
		timeout: false, // delay for closing event. Set false for sticky notifications
		force: true, // adds notification to the beginning of queue when set to true
		modal: true,
		maxVisible: 5, // you can set max visible notification for dismissQueue true option,
		killer: true, // for close all notifications before show
		closeWith: ['click'], // ['click', 'button', 'hover']
		callback: {
			onShow: function() {},
			afterShow: function() {},
			onClose: function() {},
			afterClose: function() {}
		},
		buttons: false // an array of buttons
	};


	console.log(window.location.pathname);
});