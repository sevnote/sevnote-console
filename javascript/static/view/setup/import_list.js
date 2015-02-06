require(['moment', 'jquery', 'underscore', 'backbone', 'mustcach'], function(moment, $, _, Backbone, mustcach) {
	var Init = Backbone.View.extend({
		el: $('body'),
		events: {
			"click #syslog": "SyslogSetup",
			"click #eventlog": "EventlogSetup",
			"click #bash": "BashSetup",
			"click #custom": "CustomSetup",
			"click #web" : "WebSetup",
		},
		SyslogSetup: function() {
			$(".setup_tutorial").hide().slideUp("slow");
			$("#syslog_setup").show().slideDown("slow");
		},
		BashSetup: function() {
			$(".setup_tutorial").hide().slideUp("slow");
			$("#bash_setup").show().slideDown("slow");
		},
		EventlogSetup: function() {
			$(".setup_tutorial").hide().slideUp("slow");
			$("#eventlog_setup").show().slideDown("slow");
		},
		WebSetup: function() {
			$(".setup_tutorial").hide().slideUp("slow");
			$("#web_setup").show().slideDown("slow");
		},
		CustomSetup: function() {
			$(".setup_tutorial").hide().slideUp("slow");
			$("#custom_setup").show().slideDown("slow");
		}
	});

	return new Init;
});