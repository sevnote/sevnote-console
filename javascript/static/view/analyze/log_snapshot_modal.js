require.config({
	paths: {
		'select2': 'libs/select2/select2.min',
	},
	shim: {
		'select2': {
			deps: ['jquery'],
			exports: 'jquery'
		}
	}
});


require(['noext!/setup/apikey', 'moment','underscore', 'backbone', 'mustcach', 'select2'], function(config, moment, _, Backbone, mustcach) {
	var apikey = config.apikey();
	var now = moment().format('YYYY-MM-DD HH:mm:ss');
	var a_day = moment().subtract('days', '7').format('YYYY-MM-DD HH:mm:ss');
	$(".select2").select2();

	var Init = Backbone.View.extend({
		el: $('body'),
		events: {
			"click #submit": "Submit",
		},
		initialize: function() {
			var snapshoot_data = JSON.parse(this.DefaultFilter());
			if (this.GetCurrentFilter() !== undefined) {
				snapshoot_data.Filter = JSON.stringify(this.GetCurrentFilter());
			}
			var jsonPretty = JSON.stringify(snapshoot_data, null, 3)
			$('#filter').val(JSON.stringify(snapshoot_data));
			$(".snapshoot_filter").text(jsonPretty);
		},
		DefaultFilter: function() {
			var key = $(".current_filter_key").text().split(":").pop().trim();
			var type = $(".current_filter_type").text();
			var filter = ({
				"Key": key,
				"Type": type,
				"From": a_day,
				"To": now,
				"Size": "500",
			});

			return JSON.stringify(filter);
		},
		GetCurrentFilter: function() {
			if ($(".ding_filter").parent().length > 0) {
				var current_filter = []
				$($(".ding_filter").parent()).each(function() {
					var filter = $(this).text().split(':');
					var key = filter[0].trim();
					var value = filter[1].trim();
					var filter_json = {
						"key": key,
						"value": value
					};
					current_filter.push(filter_json);
				});
				return current_filter
			}
		},
		Submit: function() {
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

			var data = ({
				ApiKey: apikey,
				Name: obj.snapshoot_name,
				Filter: obj.filter
			})
			$.ajax({
				type: 'POST',
				data: JSON.stringify(data),
				contentType: 'application/json',
				url: 'http://api.sevnote.com/AddSnapshot',
				success: function(data) {
					console.log(data)
					if (data.RetCode === 0) {
						noty({
							'text': '快照已添加',
							'type': 'success',
							'layout': 'bottomRight',
							'timeout': 2000
						});
						$('.modal.in').modal('hide');
					}else{
						noty({
							'text': data.ErrorMessage,
							'type': 'warning',
							'layout': 'bottomRight',
							'timeout': 2000
						});
					}


				}
			});
			return false;
		}
	});

	return new Init;
});