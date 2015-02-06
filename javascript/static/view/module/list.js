require(['noext!/setup/apikey', 'moment', 'jquery', 'underscore', 'backbone', 'mustcach', 'nprogress', 'datatables'],
	function(config, moment, $, _, b, mustcach, NProgress ) {

		$.extend($.fn.dataTable.defaults, {
		"autoWidth": false,
		"iDisplayLength": 25,
		"aLengthMenu": [
			[25, 50, 100, 10000],
			[25, 50, 100, "所有"]
		],
		//"dom": 'T<"clear"><"toolbar">Clfrtip',
		//"tableTools": {
		//	"sSwfPath": "/js/datatables/tabletools/swf/copy_csv_xls_pdf.swf"
		//},
		//"stateSave": true,
		//"processing": true,
		//"serverSide": true,
		"sPaginationType": "full_numbers",
		'language': {
			"emptyTable": "表单中没有有效的数据",
			"info": "从 _START_ 到 _END_ /共 _TOTAL_ 条数据",
			"infoEmpty": "显示 0 到 0 总共 0 的数据",
			"infoFiltered": "(在 _MAX_ 数量中过滤出)",
			"infoPostFix": "",
			"thousands": ",",
			"lengthMenu": "每页显示 _MENU_ 条记录",
			"loadingRecords": "载入中...",
			"processing": "<img src='/images/datatable_loading.gif'>    数据装载中...",
			"search": "模糊查找 ",
			"zeroRecords": "没有检索到数据",
			"paginate": {
				"first": "首页",
				"last": "尾页",
				"next": "后一页",
				"previous": "前一页"
			},
			"aria": {
				"sortAscending": ": 激活升序排列",
				"sortDescending": ": 激活降序排列"
			}
		}
	});


		var Init = Backbone.View.extend({
			el: $('body'),
			initialize: function() {
				this.RenderDatatables();
			},
			RenderDatatables: function() {
					$("#datatables").dataTable();
			}
		});

		return new Init;

	});