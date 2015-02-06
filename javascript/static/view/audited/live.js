require(['noext!/setup/apikey','moment', 'jquery', 'underscore', 'backbone', 'mustcach', 'nprogress','pageguide','jquery.highlight'],
	function(config,moment, $, _, b, mustcach, NProgress, amRef) {
		
		var api_gateway = config.api_gateway();
		var apikey = config.apikey();
		var now = moment().format('YYYY-MM-DD HH:mm:ss');
		var a_day = moment().subtract('days', '4').format('YYYY-MM-DD HH:mm:ss');
		var type = "bash";
		window.start_page_time = new Date(); //开始时间
		window.end_page_time = new Date(); //结束时间
		window.dash_now = new Date().getTime();
		window.dash_from = new Date().getTime();
		window.total_count = 0;
		window.key = '*';


		var QueryObj = Backbone.Model.extend({
			defaults: {
				ApiKey: apikey,
			}
		});

		var FieldObj = Backbone.Model.extend({
			defaults: {
				ApiKey: apikey,
				Type: 'bash',
			}
		});

		var Init = Backbone.View.extend({
			el: $('body'),
			initialize: function() {
				var post_data = new QueryObj();
				this.PageGuide();
				this.InitRender();
				this.StartRun(type);
			},
			events: {
				"keyup #capture": "Capture",
				"click .current_filter": "DingOn",
				"dblclick .current_filter": "DingOff",
				"click .add_filter": "OnFilterKey",
				"contextmenu.del_filter": "OffFilterKey",
				"click .add_type_filter": "OnFilterType",
				"click .start_run": "StartRun",
				"click .pause_run": "PauseRun",
			},
			StartRun: function(e,type,key) {
				$('.start_run').addClass('pause_run');
				$('.start_run').removeClass('start_run');
				$('.pause_run>i').addClass('fa-pause').css("color", "white");
				$('.pause_run').removeClass('btn-warning');
				$('.pause_run').addClass('btn-success');
				$('.pause_run>i').removeClass('fa-play');

				var that = this;
				window.time_intervarval = setInterval(function() {
					window.end_page_time = new Date();
					that.ShowTime(start_page_time, end_page_time);
					that.UpdateLog(dash_from, dash_now, total_count, type,key);
				}, 1000);
			},
			PauseRun: function() {
				$('.pause_run').addClass('start_run');
				$('.pause_run').removeClass('pause_run');
				$('.start_run').removeClass('btn-success');
				$('.start_run').addClass('btn-warning');
				$('.start_run>i').removeClass('fa-pause');
				$('.start_run>i').addClass('fa-play').css("color", "black")
				clearInterval(time_intervarval);
				$("#time_elapsed").html("<font style='color:black'>暂停中</font>");

			},
			ShowTime: function(start_page_time, end_page_time) {
				var page_time = end_page_time.getTime() - start_page_time.getTime() //时间差的毫秒数
				//计算出相差天数
				var days = Math.floor(page_time / (24 * 3600 * 1000))

				//计算出小时数
				var only_seconds = page_time % (24 * 3600 * 3600 * 60 * 1000);
				window.only_seconds = Math.floor(only_seconds / 1000);

				var leave1 = page_time % (24 * 3600 * 1000) //计算天数后剩余的毫秒数
				var hours = Math.floor(leave1 / (3600 * 1000))
				//计算相差分钟数
				var leave2 = leave1 % (3600 * 1000) //计算小时数后剩余的毫秒数
				var minutes = Math.floor(leave2 / (60 * 1000))

				//计算相差秒数
				var leave3 = leave2 % (60 * 1000) //计算分钟数后剩余的毫秒数
				var seconds = Math.round(leave3 / 1000)

				var time_render = "运行中: " + hours + ':' + minutes + ':' + seconds;
				$("#time_elapsed").text(time_render);
			},
			InitRender: function() {
				//加载类型过滤
				$("#field_filter").append('<li class="active filter_type"> <a href="#" class="auto"> <span class="pull-right text-muted"> <i class="fa fa-angle-left text"></i> <i class="fa fa-angle-down text-active"></i> </span><span>类型</span> </a><ul class="nav dk text-sm" id="quick_filter_type"></ul></li>');
			},
			PageGuide: function() {
				var simpleGuide = {
					id: 'simple',
					'title': '如何使用实时日志控制台',
					steps: [{
						target: '#dashboard',
						content: '实时滚动显示当前生成的日志',
						direction: 'left'
					}, {
						target: '.nav-primary',
						content: '快速过滤菜单，可以根据当前显示的内容快速过滤需要搜索的条件',
						direction: 'right',
						margin: {
							top: 200
						}
					}]
				}

				$.pageguide(simpleGuide);
			},
			OnFilterType: function(e) {
				var filter_value = $(e.currentTarget).children('span').text();
				this.PauseRun();
				this.StartRun(e,filter_value,key);
			},
			UpdateLog: function(dash_from, dash_now, total_count, type,key) {
				var post_data = new QueryObj();

				post_data.set({
					From: dash_from,
					To: dash_now,
					Type: 'bash',
					Key:'*',
				});

				$(".current_filter_count").text("读取到 " + total_count + " 次操作");
				$(".current_filter_type").text(type);

				var per_event = total_count / only_seconds * 1
				var per_event = per_event.toFixed(1);

				$.ajax({
					type: 'POST',
					data: JSON.stringify(post_data),
					contentType: 'application/json',
					url: api_gateway+'/GetHistogram',

					success: function(data) {
						if (data.Data.ClassCount.histogram.length !== 0) {
							$('#loading').remove();
							$('.log-content-new').addClass('log-content');
							$('.log-content').removeClass('log-content-new');

							window.total_count = total_count + data.Data.LogSets.length;
							window.dash_to = new Date().getTime();
							window.dash_from = new Date().getTime();

							$(data.Data.LogSets).each(function() {
								switch (this._source.priority) {
									case 'alert':
										var priority = 'text-danger';
										break;
									case 'crit':
										var priority = 'text-danger';
										break;
									case 'err':
										var priority = 'text-danger';
										break;
									case 'warning':
										var priority = 'text-warning';
										break;
									case 'notice':
										var priority = 'text-dark';
										break;
									case 'info':
										var priority = 'text-info';
										break;
								}
								var timestamp = moment(this._source['@timestamp']).format('YY-MM-DD HH:mm:ss');
								$(".current_filter_count").text("读取到 " + total_count + " 次操作");

								var message = this._source.message.replace('USER=', '操作用户:');
								var message = message.replace('PWD=', '操作目录:');
								var message = message.replace('CMD=', '操作内容:');

								$('.old_log').append('<li class="list-group-item" ><a data-toggle="ajaxModal" href="/console/log_modal/' + this._index + '/' + this._type + '/' + this._id + '" ><div class="pull-right ' + priority + ' m-t-sm "><i class="fa fa-circle"></i></div><small class="text-muted log-content-new">[' + timestamp + '] <b style="color: #545ca6;">[' + this._source.host + ']</b> ' + message + '</small><a></li>');
								$('#dashboard').scrollTop($('#dashboard')[0].scrollHeight);
							});
						}
						window.dash_now = new Date().getTime();
					}
				});
			}
		});

		return new Init;

	});
