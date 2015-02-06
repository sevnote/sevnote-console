require.config({
	paths: {
		'jquery-ui': 'libs/jqueryui/jquery-ui.min',
	},
	shim: {
		'jquery-ui': ['jquery']
	}
});
require(['moment', 'jquery', 'underscore', 'backbone', 'mustcach', 'jquery-ui'], function(moment, $, _, Backbone, mustcach) {
	var Init = Backbone.View.extend({
		el: $('body'),
		events: {
			"click #register": "Reg",
		},
		initialize: function() {
			this.Render();
		},
		Render: function() {
			$('input').change(function() {
				$("#title").text('');
			});
		},
		Reg: function() {
			var inputs = $("input:radio:checked").add($("input:text")).add($("input:password")).add($("input:hidden")).add($("select")).add($("textarea")).add($('.more-tag:selected')),
				str = "";
			var obj = {};
			$.each(inputs, function(index) {
				if (this.name != '' && this.value != '') {
					var value = this.value;
					if ($(this).attr('class') == 'select2 full-width-fix more-tag select2-offscreen') {
						var foo = [];
						$('.more-tag :selected').each(function(i, selected) {
							foo[i] = $(selected).attr('value');
						});
						var value = foo;
					}
					obj[this.name] = value
				}
			});
			delete obj.undefined;
			console.log(obj)
			$.ajax({
				type: 'POST',
				data: JSON.stringify(obj),
				contentType: 'application/json',
				url: '/back_do',
				success: function(data) {
					console.log(data)
					if (data.response == "success") {
						setTimeout("window.location.href =\"" + data.url + "\"", 1);
					} else {
						$("#title").html(data.msg);
						$("#title").show();
						$("#title").effect("shake", null, "slow");
					}
				}
			});
			return false;
		},
	});
	return new Init;
});