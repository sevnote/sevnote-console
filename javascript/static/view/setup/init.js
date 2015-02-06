require.config({
	paths: {
		'validator': 'libs/validator/validator.min',
		'wizard': 'libs/wizard/jquery.bootstrap.wizard',
		'select2': 'libs/select2/select2.min',
	},
	shim: {
		'wizard': {
			deps: ['jquery'],
			exports: 'jquery'
		},
		'select2': {
			deps: ['jquery'],
			exports: 'jquery'
		}
	}
});

require(['validator','underscore', 'backbone', 'jquery', 'wizard','select2'], function(validator,_, Backbone, jQuery) {

	var Init = Backbone.View.extend({
		el: $('body'),
		events: {
			"click #finish": "Finish",
		},
		initialize: function() {
			this.Init();
		},
		Init: function() {
			$(".select2").select2();

			$("select[name='select_type']")
				.on("change", function(e) {
					$('.initpre').hide();
					$("#" + e.val).show();
				})

			$('#wizardform').bootstrapWizard({
				'lastSelector': '.btn-primary',
				'tabClass': 'nav nav-tabs',
				'onNext': function(tab, navigation, index) {
					var user_phone_valid = validator.isNumeric($("input[name='user_phone']").val());

					if($("input[name='user_phone']").val() === null || $("input[name='user_phone']").val() === ""){
						$("input[name='user_phone']").focus();
						noty({
							'text': '请填写手机号码用于验证',
							'type': 'warning',
							'layout': 'bottomRight',
							'timeout': 2000,
						});
						return false;
					}else if($("input[name='company_name']").val() === null ||$("input[name='company_name']").val() === "" ) {
						$("input[name='company_name']").focus();
						noty({
							'text': '请填写公司或者团队名称',
							'type': 'warning',
							'layout': 'bottomRight',
							'timeout': 2000,
						});
						return false;
					}
					else if(!user_phone_valid){
						$("input[name='user_phone']").focus();
						noty({
							'text': '手机号码格式错误',
							'type': 'warning',
							'layout': 'bottomRight',
							'timeout': 2000,
						});
						return false;
					} else{
						return true;
					}

				},
				onTabClick: function(tab, navigation, index) {
					return false;
				},
				onTabShow: function(tab, navigation, index) {
					var total = navigation.find('li').length;
					var current = index + 1;
					var percent = (current / total) * 100;

					$('#wizardform').find('.progress-bar').css({
						width: percent + '%'
					});
		
					if(current >= total) {
						$("#wizardform").find('.next').hide();
						$("#wizardform").find('.last').show();
						$("#wizardform").find('.last').removeClass('disabled');
					}else{
						$("#wizardform").find('.next').show();
						$("#wizardform").find('.last').hide();
					}
				}
			});
		},
		Finish: function() {
			noty({
                'text': '正在进行初始化,请稍后',
                'type': 'information',
                'layout': 'bottomRight'
            });

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

			console.log(obj);

			$.ajax({
				type: 'POST',
				data: JSON.stringify(obj),
				contentType: 'application/json',
				url: '/setup/init_do',
				success: function(data) {
					console.log(data)
					if (data.response == "success") {
						noty({
							'text': data.msg,
							'type': 'success',
							'layout': 'bottomRight',
							'timeout': 2000,
							callback: {
								onShow: function() {},
								afterShow: function() {},
								onClose: function() {
									setTimeout("window.location.href =\"" + data.url + "\"", 1)
								},
								afterClose: function() {}
							},
						});
					}else{
							noty({
							'text': data.msg,
							'type': 'warning',
							'layout': 'bottomRight',
							'timeout': 2000,
						});
					}
				}
			});
			return false;
		}
	});
	return new Init;
});