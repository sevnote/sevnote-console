var express = require('express'),
	app = module.exports = express(),
	common = require('../lib/common'),
	base = require('../lib/base'),
	mysql = require('../lib/mysql'),
	rest = require('restler'),
	util = require('util'),
	rest = require('restler');

app.get('/analyze/logs', base.Connect(), function(req, res) {
	RENDER.title = "日志分析 | 系统笔记 SEVNOTE.COM";
	res.render('analyze/logs', RENDER);
});

app.get('/analyze/log_modal/:index/:type/:id', base.Connect(), function(req, res) {
	var apikey = req.user.private_key;
	var index = req.params.index;
	var type = req.params.type;
	var id = req.params.id;

	var post_data = ({
		ApiKey: apikey,
		Index: index,
		Type: type,
		Id: id
	});

	rest.post('http://api.sevnote.com/GetLogInfo', {
		data: post_data,
	}).on('complete', function(data, response) {

		switch (data.Data.LogSet['_source'].priority) {
			case 'alert':
				data.Data.LogSet['_source'].priority = 'text-danger';
				break;
			case 'crit':
				data.Data.LogSet['_source'].priority = 'text-danger';
				break;
			case 'err':
				data.Data.LogSet['_source'].priority = 'text-danger';
				break;
			case 'warning':
				data.Data.LogSet['_source'].priority = 'text-warning';
				break;
			case 'notice':
				data.Data.LogSet['_source'].priority = 'text-dark';
				break;
			case 'info':
				data.Data.LogSet['_source'].priority = 'text-info';
				break;
		}

		data.Data.LogSet['_source']['@timestamp'] = moment(data.Data.LogSet['_source']['@timestamp']).format('YYYY-MM-DD HH:mm:ss');
		RENDER.type = data.Data.LogSet['_source'].type;
		RENDER.data = data.Data.LogSet['_source'];
		res.render('analyze/log_modal', RENDER);
	});
});


app.get('/analyze/log_snapshot', base.Connect(), function(req, res) {
	var apikey = req.user.private_key;
	var post_data = ({
		ApiKey: apikey,
	})

	rest.post('http://api.sevnote.com/GetSnapshotList', {
		data: post_data,
	}).on('complete', function(data, response) {
		var result = [];
		for (var i in data.Data.SnapshotList) {

			var filter_json = JSON.parse(data.Data.SnapshotList[i].filter);
			var key = filter_json.Key;
			var type = filter_json.Type;
			var start_time = filter_json.From;
			var end_time = filter_json.To;
			var size = filter_json.Size;

			var filter_filter = filter_json.Filter || "无";
			var filter_conntent = util.format("关键字:%s, 类型:%s, 开始时间:%s, 结束时间:%s, 搜索大小:%s ,过滤条件: %s", key, type, start_time, end_time, size, filter_filter);

			console.log(data.Data.SnapshotList[i].createdate);
			var json = ({
				'id':data.Data.SnapshotList[i].id,
				'name': data.Data.SnapshotList[i].name,
				'filter': filter_conntent,
				'description': data.Data.SnapshotList[i].description,
				'createdate': moment(data.Data.SnapshotList[i].createdate,'X').format('YYYY-MM-DD'),
			})
			result.push(json);
		}

		RENDER.result = result;
		RENDER.title = "日志快照 | 系统笔记 SEVNOTE.COM";
		res.render('analyze/log_snapshot', RENDER);
	});
});

app.get('/analyze/log_snapshot_modal', base.Connect(), function(req, res) {
	res.render('analyze/log_snapshot_modal', RENDER);
});


app.get('/analyze/log_filter_modal', base.Connect(), function(req, res) {
	res.render('analyze/log_filter_modal', RENDER);
});

app.get('/analyze/filter_view_modal/:filter', base.Connect(), function(req, res) {
	var apikey = req.user.private_key;

	res.render('analyze/filter_view_modal', RENDER);

});