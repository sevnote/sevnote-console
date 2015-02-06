var express = require('express'),
	app = module.exports = express(),
	common = require('../lib/common'),
	base = require('../lib/base'),
	mysql = require('../lib/mysql'),
	rest = require('restler');


app.get('/audited/history', base.Connect(), function(req, res) {

	var apikey = req.user.private_key;
	var end_time = moment().format('YYYY-MM-DD HH:mm:ss');
	var start_time = moment().subtract('days', '30').format('YYYY-MM-DD HH:mm:ss');

	var post_data = ({
		ApiKey: apikey,
		Key: '*',
		Type: 'bash',
		From: start_time,
		To: end_time,
		Size: '500',
	})

	rest.post('http://api.sevnote.com/GetSearchResult', {
		data: post_data,
	}).on('complete', function(data, response) {
		var result = [];
		for(var i in data.Data.LogSets){
			var time = moment(data.Data.LogSets[i]._source['@timestamp']).format('YYYY-MM-DD HH:mm:ss');
			var json = ({
				'time' : time,
				'user' : data.Data.LogSets[i]._source.user,
				'path' : data.Data.LogSets[i]._source.path,
				'cmd'  : data.Data.LogSets[i]._source.cmd
			})
			result.push(json);			
		}
		RENDER.result = result;
		RENDER.title = "操作记录 | 系统笔记 SEVNOTE.COM";
		res.render('audited/history', RENDER);
	});
	
});

app.get('/audited/live', base.Connect(), function(req, res) {
	RENDER.title = "实时操作监控 | 系统笔记 SEVNOTE.COM";
	res.render('audited/live', RENDER);
});