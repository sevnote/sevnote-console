require.config({
	paths: {
		'amcharts': 'libs/amcharts/amcharts',
		'amcharts.funnel': 'libs/amcharts/funnel',
		'amcharts.gauge': 'libs/amcharts/gauge',
		'amcharts.pie': 'libs/amcharts/pie',
		'amcharts.radar': 'libs/amcharts/radar',
		'amcharts.serial': 'libs/amcharts/serial',
		'amcharts.xy': 'libs/amcharts/xy',
		'amcharts.theme.light': 'libs/amcharts/themes/light',
		'helper': 'libs/helper',
	},
	shim: {
		'amcharts.funnel': {
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


require(['helper', 'noext!/setup/apikey', 'moment', 'jquery', 'underscore', 'backbone', 'mustcach', 'nprogress', 'amcharts.serial', 'amcharts.pie', 'amcharts.theme.light', 'pageguide', 'jquery.highlight', 'select2', 'datepicker'],
	function(helper, config, moment, $, _, b, mustcach, NProgress, amRef) {

		var api_gateway = config.api_gateway();
		var apikey = config.apikey();
		console.log(api_gateway);
		console.log(apikey);
		var end_date = moment().format('YYYY-MM-DD HH:mm:ss');
		var start_date = moment().subtract('days', '4').format('YYYY-MM-DD HH:mm:ss');

		var QueryObj = Backbone.Model.extend({
			defaults: {
				ApiKey: apikey,
				Key: '*',
				Type: 'syslog',
				From: start_date,
				To: end_date,
				Size: '300',
				//Filter:'[{"key":"program","value":"sshd"}]'
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
				this.PageGuide();
				this.InitRender();
				this.Loadlog(post_data);
				this.PageGuide();
				this.Datepicker();
			},
			events: {
				"click #daterangersubmit": "SelectDateRanger",
				"click #datepositionsubmit": "SelectDatePosition",
				"keyup #searchinput": "OnSearchKey",
				"click .current_filter": "DingOn",
				"dblclick .current_filter": "DingOff",
				"click .add_filter": "OnFilterKey",
				"contextmenu.del_filter": "OffFilterKey",
				"click .add_type_filter": "OnFilterType",
				"click #prev": "PrevOffset",
				"click #next": "NextOffset",
				"click .pie": "MakePie",
				"click .histogram": "MakeHistogram",
				"click .preinstall": "SelectPreInstall",
			},
			InitRender: function() {
				//加载类型过滤
				$("#field_filter").append('<li class="active filter_type"> <a href="#" class="auto"> <span class="pull-right text-muted"> <i class="fa fa-angle-left text"></i> <i class="fa fa-angle-down text-active"></i> </span><span>类型</span> </a><ul class="nav dk text-sm" id="quick_filter_type"></ul></li>');
			},
			Datepicker: function() {
				jQuery(".select2").select2();

				jQuery("#dtBox").DateTimePicker({
					'dateTimeFormat': "yyyy-MM-dd HH:mm:ss",
					'setButtonContent': '设置',
					'clearButtonContent': '清除',
					'titleContentDateTime': '设置日期时间',
					'shortMonthNames': ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],
					'fullMonthNames': ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],
					'shortDayNames': ["周日", "周1", "周2", "周3", "周4", "周5", "周6"],
				});
			},
			PageGuide: function() {
				var simpleGuide = {
					id: 'simple',
					'title': '指导您如何使用Dashboard',
					steps: [{
						target: '.panel-body',
						content: '根据数据类型显示柱状图，默认为当前时间的7天内的数据',
						direction: 'left'
					}, {
						target: '.nav-primary',
						content: '快速过滤菜单，可以根据当前显示的内容快速过滤需要搜索的条件',
						direction: 'right',
						margin: {
							top: 200
						}
					}, {
						target: '.footer',
						content: '显示当前的的搜索条件，单击标签为"钉住"当前条件,点击鼠标右键为取消过滤当前条件',
						direction: 'top',
					}]
				}
				$.pageguide(simpleGuide);
			},
			SelectPreInstall: function(e) {
				var value = $(e.currentTarget).text();
				switch (value) {
					case "30秒窗口":
						alert("all");
						break;
					case "1分钟窗口":
						alert("30");
						break;
					case "5分钟窗口":
						alert("30");
						break;
					case "30分钟窗口":
						alert("30");
						break;
					case "1小时窗口":
						alert("30");
						break;
					case "今天":
						alert("30");
						break;
					case "昨天迄今":
						alert("30");
						break;
					case "一周迄今":
						alert("30");
						break;
					case "一个月迄今":
						alert("30");
						break;
					case "年度迄今":
						alert("30");
						break;
					case "前一周":
						alert("30");
						break;
					case "上月":
						alert("30");
						break;
					case "前 15 分钟":
						var start_time = moment().subtract('minute', '15').format('YYYY-MM-DD HH:mm:ss');
						var end_time = moment().format('YYYY-MM-DD HH:mm:ss');
						break;
					case "前 60 分钟":
						var start_time = moment().subtract('hours', '1').format('YYYY-MM-DD HH:mm:ss');
						var end_time = moment().format('YYYY-MM-DD HH:mm:ss');
						break;
					case "前 4 小时":
						var start_time = moment().subtract('hours', '4').format('YYYY-MM-DD HH:mm:ss');
						var end_time = moment().format('YYYY-MM-DD HH:mm:ss');
						break;
					case "前 24 小时":
						var start_time = moment().subtract('days', '1').format('YYYY-MM-DD HH:mm:ss');
						var end_time = moment().format('YYYY-MM-DD HH:mm:ss');
						break;
					case "前 7 天":
						var start_time = moment().subtract('days', '7').format('YYYY-MM-DD HH:mm:ss');
						var end_time = moment().format('YYYY-MM-DD HH:mm:ss');
						break;
					case "前 30 天":
						var start_time = moment().subtract('days', '30').format('YYYY-MM-DD HH:mm:ss');
						var end_time = moment().format('YYYY-MM-DD HH:mm:ss');
						break;
					case "所有时间":
						var start_time = moment().subtract('days', '4').format('YYYY-MM-DD HH:mm:ss');
						var end_time = moment().format('YYYY-MM-DD HH:mm:ss');
						break;
				}

				$('#datepickertext').html(value + " <span class='caret'></span>");
				var current_type = $('.current_filter_type').text();
				var exisit_filter = JSON.stringify(this.GetCurrentFilter());

				var post_data = new QueryObj();
				if (exisit_filter !== undefined) {
					post_data.set({
						Type: current_type,
						From: start_time,
						To: end_time,
						Filter: exisit_filter,
					});

				} else {
					post_data.set({
						Type: current_type,
						From: start_time,
						To: end_time,
					});

				}

				this.Loadlog(post_data);
				jQuery('.modal.in').modal('hide');
				return false;
			},
			SelectDatePosition: function(e) {

				var date_prefix = $("select[name='dateprefix']").val();
				var date_suffix = $("input[name='datesuffix']").val();

				if (date_prefix === "" || date_prefix === null || date_prefix === undefined) {
					noty({
						'text': '时间前缀不能为空',
						'type': 'warning',
						'layout': 'bottomRight',
						'timeout': 2000
					});
					return false;
				}

				if (date_suffix === "" || date_suffix === null || date_suffix === undefined) {
					noty({
						'text': '时间值不能为空',
						'type': 'warning',
						'layout': 'bottomRight',
						'timeout': 2000
					});
					return false;
				}

				if (date_prefix === 'before') {
					$('#datepickertext').html(date_suffix + " 之前 " + " <span class='caret'></span>");
					var start_time = moment().subtract('years', '10').format('YYYY-MM-DD HH:mm:ss');
					var end_time = moment(date_suffix).format('YYYY-MM-DD HH:mm:ss');

				} else {
					$('#datepickertext').html(date_suffix + " 之后 " + " <span class='caret'></span>");
					var start_time = moment(date_suffix).format('YYYY-MM-DD HH:mm:ss');
					var end_time = moment().add('years', '10').format('YYYY-MM-DD HH:mm:ss');
				}

				var current_type = $('.current_filter_type').text();
				var exisit_filter = JSON.stringify(this.GetCurrentFilter());

				var post_data = new QueryObj();
				if (exisit_filter !== undefined) {
					post_data.set({
						Type: current_type,
						From: start_time,
						To: end_time,
						Filter: exisit_filter,
					});
				} else {

					post_data.set({
						Type: current_type,
						From: start_time,
						To: end_time,
					});
				}

				this.Loadlog(post_data);
				jQuery('.modal.in').modal('hide');
				return false;
			},
			SelectDateRanger: function(e) {

				var start_time = $("input[name='start_time']").val();
				var end_time = $("input[name='end_time']").val();

				$('#datepickertext').html("从 " + start_time + " 到 " + end_time + " <span class='caret'></span>");

				if (start_time === "" || start_time === null || start_time === undefined) {
					noty({
						'text': '最早时间不能为空',
						'type': 'warning',
						'layout': 'bottomRight',
						'timeout': 2000
					});
					return false;
				}

				if (end_time === "" || start_time === null || start_time === undefined) {
					noty({
						'text': '最后时间不能为空',
						'type': 'warning',
						'layout': 'bottomRight',
						'timeout': 2000
					});
					return false;
				}


				var start_date = moment(start_time).format('YYYY-MM-DD HH:mm:ss');
				var end_date = moment(end_time).format('YYYY-MM-DD HH:mm:ss');

				var current_type = $('.current_filter_type').text();
				var exisit_filter = JSON.stringify(this.GetCurrentFilter());

				var post_data = new QueryObj();
				if (exisit_filter !== undefined) {
					post_data.set({
						Type: current_type,
						From: start_time,
						To: end_time,
						Filter: exisit_filter,
					});
				} else {

					post_data.set({
						Type: current_type,
						From: start_time,
						To: end_time,
					});
				}

				this.Loadlog(post_data);
				jQuery('.modal.in').modal('hide');
				return false;
			},
			PrevOffset: function(e) {
				var post_data = new QueryObj();
				var current_type = $('.current_filter_type').text();
				if (offset === 0) {
					post_data.set({
						Type: current_type,
						Offset: 0,
					});
				} else {
					post_data.set({
						Type: current_type,
						Offset: offset - 100,
					});
				}
				this.Loadlog(post_data);
				return false
			},
			NextOffset: function(e) {
				var post_data = new QueryObj();
				var current_type = $('.current_filter_type').text();
				post_data.set({
					Type: current_type,
					Offset: offset + 100,
				});
				this.Loadlog(post_data);
				return false
			},
			DingOff: function(e) {
				$(e.currentTarget).removeClass('bg-danger');
				$(e.currentTarget).addClass('bg-dark');
				$(e.currentTarget.children).removeClass('ding_filter');
				$(e.currentTarget.children).addClass('del_filter');
				return false;
			},
			DingOn: function(e) {
				$(e.currentTarget).removeClass('bg-dark');
				$(e.currentTarget).addClass('bg-danger');
				$(e.currentTarget.children).removeClass('del_filter');
				$(e.currentTarget.children).addClass('ding_filter');
				return false;
			},
			OnFilterType: function(e) {
				var filter_value = $(e.currentTarget).children('span').text();
				var post_data = new QueryObj();
				post_data.set({
					Type: filter_value,
				});
				this.Loadlog(post_data);
				return false
			},
			OnFilterKey: function(e) {
				jQuery('.modal.in').modal('hide');
				var filter_key = $(e.currentTarget).parent().parent().children('.filter_key').text();
				var filter_value = $(e.currentTarget).parent().parent().children('.filter_value').text();
				var exisit_filter = this.GetCurrentFilter();
				var current_type = $('.current_filter_type').text();

				var filter = {
					"key": filter_key,
					"value": filter_value
				}

				if (exisit_filter !== undefined) {
					exisit_filter.push(filter)
					var filter = exisit_filter;
				} else {
					var filter = [{
						"key": filter_key,
						"value": filter_value
					}]
				}

				var current_filter = JSON.stringify(filter);
				var post_data = new QueryObj();

				post_data.set({
					Type: current_type,
					Filter: current_filter
				});

				this.Loadlog(post_data);

				return false
			},
			OffFilterKey: function(e) {
				$(".footer>p>span>.ding_filter").remove();
				var post_data = new QueryObj();
				this.Loadlog(post_data);
				return false
			},
			OnSearchKey: function(e) {
				//绑定回车搜索事件
				if (e.which === 13) {
					var key = $('#searchinput').val();
					if (key === '') {
						var key = '*';
					}
					var post_data = new QueryObj();
					post_data.set({
						Key: key
					});
					this.Loadlog(post_data);
					return false
				}
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
			GetCurrentType: function(post_data) {
				var type = post_data.get('Type');
				var get_field_data = new FieldObj();
				get_field_data.set({
					Type: type,
				});
				return get_field_data;
			},
			Loadlog: function(post_data) {
				NProgress.start();
				var self = this;
				$("#piechart").hide();
				$('.filter-modal').remove();
				$("#histogramchart").hide();
				$('#quick_filter_type>li').remove();
				//$('.filter_body>tr').remove();
				//$('.add_type_filter').remove();
				//$("body").find("[id^='quick_filter']>").remove();

				var type_post = ({
					ApiKey: apikey,
				});

				//获得用户所有类型的日志
				$.ajax({
					type: 'POST',
					data: JSON.stringify(type_post),
					contentType: 'application/json',
					url: api_gateway+'/GetUserLogStats',
					success: function(data) {
						//渲染快速过滤类型
						$(data.Data.TypeCount).each(function() {
							if (this.key === 'custom' || this.key === 'bash') {
								return true;
							}
							$("#quick_filter_type").append('<li class="active"><a href="#" class="auto add_type_filter"> <i class="fa fa-angle-right text-xs"></i> <span>' + this.key + '</span "style=font-size:10px"> (' + this.doc_count + ')</a></li>');
						});
					}
				});

				//获得当前Field
				var field_data_post = this.GetCurrentType(post_data);
				$.ajax({
					type: 'POST',
					data: JSON.stringify(field_data_post),
					contentType: 'application/json',
					url: api_gateway+'/GetTypeFields',

					success: function(data) {
						$("#field_filter").children().not(".filter_type,.filter-title").remove();
						window.typefield = [];
						$(data.Data.TypeFields).each(function() {
							typefield.push(this.toString());
							$("#field_filter").append('<li ><a href="#"  data-toggle="modal" data-target="#' + this + '"" class="auto"> <span class="pull-right text-muted"> <i class="fa fa-angle-left text"></i> <i class="fa fa-angle-down text-active"></i> </span><span class="filter">' + this + '</span> </a><ul class="nav dk text-sm" id="quick_filter_' + this + '"></ul></li>')
						})
					}
				});


				var size = post_data.get('Size') * 1;

				//获得日志主体
				$.ajax({
					type: 'POST',
					data: JSON.stringify(post_data),
					contentType: 'application/json',
					url: api_gateway+'/GetSearchResult',
					success: function(data) {
						console.log(data);

						if (data.Data.LogSets.length === 0) {
							noty({
								'text': '没有数据,请重新搜索',
								'type': 'information',
								'layout': 'center',
								//'timeout': 2000
							});
						}

						//MakeChart
						self.makeChart(data);;
			
						$("#chart").show();
						window.offset = data.Data.Offset;
						NProgress.done();
						//Remove Old
						$(".log-list").remove();
						$(".footer>p>span>.del_filter").remove();

						//Render Filter Bar
						$(".current_filter_count").text("查找到 " + data.Data.TotalCount + " 条记录");
						$(".current_filter_key").text("关键字: " + post_data.get('Key'));
						$(".current_filter_type").text(post_data.get('Type'));

						if (post_data.get('Filter') !== undefined) {
							var filter = JSON.parse(post_data.get('Filter'));
							var length = filter.length - 1;
							var key = JSON.parse(post_data.get('Filter'))[length].key;
							var value = JSON.parse(post_data.get('Filter'))[length].value;
							//var filter_value = '{"' + key + '":"'+ value + '"}';
							var filter_value = '<font style="color:#333333">' + key + '</font> : ' + value
							$(".footer>p").append("<span class='label bg-info current_filter'><a href='#' class='del_filter'>" + filter_value + "</a></span> ");
						}

						//加载Facet(如果ES分词效果错误)
						/*						$(typefield).each(function() {
							var key = this.toString();
							var id = "#quick_filter_" + key;
							$(data.Data.ClassCount[key]).each(function() {
								$(id).append('<li class="active"><a href="#" class="auto add_filter" > <i class="fa fa-angle-right text-xs"></i> <span>' + this.key.trim() + '</span></a></li>');
							});
						});*/

						var result = [];
						var count = 0
						$(data.Data.LogSets).each(function() {
							count += 1;
							if (count === 101) {
								return true;
							}
							result.push(this._source);
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
							$('.old_log').append('<li class="list-group-item log-list" ><a data-toggle="ajaxModal"  href="/analyze/log_modal/' + this._index + '/' + this._type + '/' + this._id + '" ><div class="pull-right ' + priority + ' m-t-sm "><i class="fa fa-circle"></i></div><small class="text-muted log-content">[' + timestamp + '] <b style="color: #545ca6;">[' + this._source.host + ']</b> ' + this._source.message + '</small><a></li>');
							jQuery(".log-list").highlight(post_data.get('Key'));
						});


						//RENDER FACET
						var filter_array = [];
						$('.filter').each(function() {
							filter_array.push($(this).text());
						});

						_.templateSettings = {
							interpolate: /\{\{(.+?)\}\}/g
						};

						var facets = [];
						for (var i in filter_array) {
							var facet_filter = _.groupBy(result, filter_array[i]);
							facets.push(facet_filter);
							var template = _.template($("#filter-modal").html());
							$("#main").append(template({
								filter: filter_array[i]
							}));
							var facet_key = _.keys(facet_filter);

							$(facet_filter).each(function() {
								//console.log(this)
								var facet_key = _.keys(this);
								for (var y in facet_key) {
									var key = facet_key[y];
									var that = this;
									var count = that[key].length;
									var percent = count / size * 100;
									$('#' + filter_array[i] + ' .filter_body').append('<tr><td style="word-break:break-all;width:75%" class="filter_value">' + facet_key[y] + '</td><td hidden  class="' + filter_array[i] + '-hidden filter_hidden">' + facet_key[y] + '_' + count + '</td><td hidden class="filter_key">' + filter_array[i] + '</td><td><div class="progress-bar bg-success" data-toggle="tooltip" data-original-title="' + percent + '%" style="color:#ccc;text-indent:4px;width: ' + percent + '%">' + count + '/' + size + '</div></td><td class="text-right"> <a href="#" class="add_filter"><i class="fa fa-search"></i></a></td></tr>');
								}
							});
						}

					}
				});
				return false;
			},
			makeChart: function(data) {
				var self = this;
				var dataProvider = data.Data.ClassCount.histogram;
				var chart = AmCharts.makeChart("chart", {
					"type": "serial",
					"pathToImages": "/public/images/",
					"categoryField": "key_as_string",
					"mouseWheelScrollEnabled": true,
					"mouseWheelZoomEnabled": true,
					"startDuration": 1,
					"theme": "light",
					"categoryAxis": {
						'parseDates': true,
						'minPeriod': "HH",
						"autoRotateAngle": 0,
						"autoRotateCount": 0,
						"boldPeriodBeginning": false,
						"centerLabelOnFullPeriod": false,
						"equalSpacing": true,
						"firstDayOfWeek ": 1,
						"gridPosition": "start",
						"axisAlpha": 0.29,
						"axisThickness": 2,
						"dashLength": 1,
						"fillAlpha": 0.35,
						"gridCount": 4,
						"minHorizontalGap": 100,
						"minorGridAlpha": 0.31,
						"minVerticalGap": 50,
						"offset": 6,
						"showFirstLabel": true,
						"showLastLabel": true,
						"tickLength": 1
					},
					"chartCursor": {},
					"chartScrollbar": {},
					"trendLines": [],
					"graphs": [{
						"fillAlphas": 1,
						"id": "AmGraph-1",
						"title": "graph 1",
						"type": "column",
						"balloonFunction": adjustBalloonText,
						"valueField": "doc_count"
					}],
					"guides": [],
					"valueAxes": [{
						"id": "ValueAxis-2",
						"position": "right",
						"autoGridCount": false
					}],
					"allLabels": [],
					"balloon": {},
					"dataProvider": dataProvider
				});

				function adjustBalloonText(graphDataItem, graph) {
					var key = moment(graphDataItem.category).format('YYYY-MM-DD HH:mm');
					var value = graphDataItem.values.value;
					return key + "<br><b>(数据量:" + value + "条)</b>";
				}

				chart.addListener("zoomed", handleZoom);

				function handleZoom(event) {
					var post_data = new QueryObj();
					var from = new Date(event.startDate).getTime();
					var to = new Date(event.endDate).getTime();
					var type = $('.current_filter_type').text();
					end_date = moment(to).format('YYYY-MM-DD HH:mm:ss');
					start_date = moment(from).format('YYYY-MM-DD HH:mm:ss');
					post_data.set({
						Type: type,
						From: start_date,
						To: end_date
					})
					self.Loadlog(post_data);
				}
			},
			MakePie: function(e) {
				jQuery('.modal.in').modal('hide');

				$("#piechart").show();
				$("#chart").hide();
				$("#histogramchart").hide();
				var filter = $(e.currentTarget).attr('id').split('-').shift();
				var filter_hidden = filter + '-hidden';
				var chart_data = [];

				$('.' + filter_hidden).each(function() {
					var key = $(this).text().split('_').shift();
					var value = $(this).text().split('_').pop();
					var data = {};
					data.key = key;
					data.value = value
					chart_data.push(data);
				});


				chart_data.sort(helper.sort_by('value', true, parseInt));
				var chart_data = chart_data.slice(0, 9);

				var chart = AmCharts.makeChart("piechart", {
					"type": "pie",
					"theme": "light",
					"titles": [{
						"text": filter + ' TOP 10数据量分析',
						"size": 13
					}],
					"legend": {
						"markerType": "circle",
						"position": "right",
						"marginRight": 80,
						"autoMargins": false
					},
					"dataProvider": chart_data,
					"valueField": "value",
					"titleField": "key",
				});
				return false;
			},
			MakeHistogram: function(e) {
				jQuery('.modal.in').modal('hide');

				$("#histogramchart").show();
				$("#chart").hide();
				$("#piechart").hide();
				var filter = $(e.currentTarget).attr('id').split('-').shift();
				var filter_hidden = filter + '-hidden';
				var chart_data = [];

				$('.' + filter_hidden).each(function() {
					var key = $(this).text().split('_').shift();
					var value = $(this).text().split('_').pop();
					var data = {};
					data.key = key;
					data.value = value
					chart_data.push(data);
				});

				var color_array = ["#7EB26D", "#C8C8C8", "#6ED0E0", "#D6B198", "#D97A75", "#1F78C1", "#C075B4", "#705DA0", "#333333", "#E24D42"];

				chart_data.sort(helper.sort_by('value', true, parseInt));
				var chart_data = chart_data.slice(0, 9);

				for (var i in chart_data) {
					chart_data[i].color = helper.randArray(color_array, 1)[0];
				}

				var chart = AmCharts.makeChart("histogramchart", {
					"type": "serial",
					"theme": "light",
					"dataProvider": chart_data,
					"startDuration": 1,
					"titles": [{
						"text": filter + ' TOP 10数据量分析',
						"size": 13
					}],
					"graphs": [{
						"balloonText": "<b>[[category]] 数量:[[value]]</b>",
						"colorField": "color",
						"fillAlphas": 0.9,
						"lineAlpha": 0.2,
						"type": "column",
						"valueField": "value"
					}],
					"chartCursor": {
						"categoryBalloonEnabled": false,
						"cursorAlpha": 0,
						"zoomable": false
					},
					"categoryField": "key",
					"categoryAxis": {
						"gridPosition": "start",
						"labelRotation": 0
					},
					"amExport": {}

				});
				return false;
			}
		});

		return new Init;

	});
