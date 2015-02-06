var express = require('express'),
	app = module.exports = express(),
	common = require('../lib/common'),
	base = require('../lib/base'),
	mysql = require('../lib/mysql');


app.get('/console/dashboard', base.Connect(),function(req, res) {
	RENDER.title = "实时日志数据 | 系统笔记 SEVNOTE.COM";
	res.render('console/dashboard', RENDER);
});

