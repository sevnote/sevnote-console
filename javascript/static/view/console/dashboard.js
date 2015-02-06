require.config({
	paths: {
		'amcharts': 'libs/amcharts/amcharts',
		'amcharts.stock': 'libs/amcharts/amstock',
		'amcharts.funnel': 'libs/amcharts/funnel',
		'amcharts.gauge': 'libs/amcharts/gauge',
		'amcharts.pie': 'libs/amcharts/pie',
		'amcharts.radar': 'libs/amcharts/radar',
		'amcharts.serial': 'libs/amcharts/serial',
		'amcharts.xy': 'libs/amcharts/xy',
		'amcharts.theme.light': 'libs/amcharts/themes/light',
	},
	shim: {
		'amcharts.funnel': {
			deps: ['amcharts'],
			exports: 'AmCharts',
			init: function() {
				AmCharts.isReady = true;
			}
		},
		'amcharts.stock': {
			deps: ['amcharts'],
			exports: 'AmCharts',
			init: function() {
				AmCharts.isReady = true;
			}
		},
		'amcharts.gauge': {
			deps: ['amcharts'],
			exports: 'AmCharts',
			init: function() {
				AmCharts.isReady = true;
			}
		},
		'amcharts.pie': {
			deps: ['amcharts'],
			exports: 'AmCharts',
			init: function() {
				AmCharts.isReady = true;
			}
		},
		'amcharts.radar': {
			deps: ['amcharts'],
			exports: 'AmCharts',
			init: function() {
				AmCharts.isReady = true;
			}
		},
		'amcharts.serial': {
			deps: ['amcharts'],
			exports: 'AmCharts',
			init: function() {
				AmCharts.isReady = true;
			}
		},
		'amcharts.xy': {
			deps: ['amcharts'],
			exports: 'AmCharts',
			init: function() {
				AmCharts.isReady = true;
			}
		},
		'amcharts.theme.light': {
			deps: ['amcharts'],
			exports: 'AmCharts',
			init: function() {
				AmCharts.isReady = true;
			}
		},

	}
});


require(['noext!/setup/apikey','moment', 'jquery', 'underscore', 'backbone', 'mustcach', 'nprogress', 'amcharts.serial', 'amcharts.theme.light', 'amcharts.stock', 'pageguide','jquery.highlight'],
	function(config,moment, $, _, b, mustcach, NProgress, amRef) {

		var api_gateway = config.api_gateway();
		var apikey = config.apikey();
		console.log(api_gateway);
		console.log(api_key);
		var now = moment().format('YYYY-MM-DD HH:mm:ss');
		var a_day = moment().subtract('days', '4').format('YYYY-MM-DD HH:mm:ss');
		var type = "syslog";
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
				Type: 'syslog',
			}
		});

		var Init = Backbone.View.extend({
			el: $('body'),
			initialize: function() {
				var post_data = new QueryObj();
				this.Initlog();
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
			Capture: function(e) {
				//绑定回车搜索事件
				if (e.which === 13) {
					var key = $('#capture').val();
					if (key === '') {
						var key = '*';
					}
					var type = $(".current_filter_type").text();
					this.PauseRun();
					this.StartRun(type,key);

					$(".current_filter_key").text("捕捉关键字: " + key);
					return false
				}
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

				if(key === undefined){
					var key = $(".current_filter_key").text().split(":").pop().trim();
					console.log(key)
				}
				if(type === undefined){

					var type = $(".current_filter_type").text();
					console.log(type)
				}

				post_data.set({
					From: dash_from,
					To: dash_now,
					Type: type,
					Key:key,
				});

				console.log(post_data);

				$(".current_filter_count").text("读取到 " + total_count + " 条记录");
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
								$(".current_filter_count").text("读取到 " + total_count + " 条记录");

								$('.old_log').append('<li class="list-group-item" ><a data-toggle="ajaxModal" href="/console/log_modal/' + this._index + '/' + this._type + '/' + this._id + '" ><div class="pull-right ' + priority + ' m-t-sm "><i class="fa fa-circle"></i></div><small class="text-muted log-content-new">[' + timestamp + '] <b style="color: #545ca6;">[' + this._source.host + ']</b> ' + this._source.message + '</small><a></li>');
								$('#dashboard').scrollTop($('#dashboard')[0].scrollHeight);
								jQuery(".list-group-item").highlight(post_data.get('Key'));
							});
						}
						$(".per_event").text("每秒载入: " + per_event + " 次事件");
						window.dash_now = new Date().getTime();
					}
				});
			},
			Initlog: function() {
				$("body").find("[id^='quick_filter']>").remove();
				var type_post = new QueryObj();

				//获得用户所有类型的日志
				$.ajax({
					type: 'POST',
					data: JSON.stringify(type_post),
					contentType: 'application/json',
					url: api_gateway+'/GetUserLogStats',
					success: function(data) {
						//渲染快速过滤类型
						$(data.Data.TypeCount).each(function() {
							if (this.key === 'custom') {
								return true;
							}
							$("#quick_filter_type").append('<li class="active"><a href="#" class="auto add_type_filter"> <i class="fa fa-angle-right text-xs"></i> <span>' + this.key + '</span "style=font-size:10px"> (' + this.doc_count + ')</a></li>');
						});
					}
				});
			},
			MakeChart: function() {
				AmCharts.makeChart("chartdiv", {
						"type": "serial",
						"pathToImages": "",
						"categoryField": "column-1",
						"startDuration": 1,
						"theme": "light",
						"categoryAxis": {
							"autoRotateAngle": 0,
							"autoRotateCount": -1,
							"gridPosition": "start",
							"tickPosition": "start",
							"autoGridCount": false
						},
						"trendLines": [],
						"graphs": [{
							"balloonText": "接收到:[[value]]次事件",
							"bullet": "round",
							"id": "AmGraph-1",
							"title": "graph 1",
							"type": "smoothedLine",
							"valueAxis": "ValueAxis-1",
							"valueField": "column-1"
						}],
						"guides": [],
						"valueAxes": [{
							"id": "ValueAxis-1",
							"title": "Axis title"
						}],
						"allLabels": [],
						"balloon": {},
						"titles": [],
						"dataProvider": [{
							"category": "category 2",
							"column-1": 6
						}, {
							"category": "category 3",
							"column-1": 2
						}, {
							"category": "category 4",
							"column-1": 1
						}, {
							"category": "category 5",
							"column-1": 2
						}, {
							"category": "category 6",
							"column-1": 3
						}, {
							"category": "category 7",
							"column-1": 6
						}]
					});
			}
		});

		return new Init;

	});
