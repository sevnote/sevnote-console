var express = require('express'),
	app = module.exports = express(),
	common = require('../lib/common'),
	base = require('../lib/base'),
	mysql = require('../lib/mysql'),
	rest = require('restler');

app.get('/module/list', base.Connect(), function(req, res) {
	var user_id = req.user.user_id;
	RENDER.result = mysql.get_where_in('custom_logtype',{'user_id':user_id});
	RENDER.title = "数据模型 | 系统笔记 SEVNOTE.COM";
	res.render('module/list', RENDER);
});

app.get('/module/create_module', base.Connect(), function(req, res) {
	RENDER.title = "创建自定义数据模型 | 系统笔记 SEVNOTE.COM";
	res.render("module/create_module", RENDER);
});

app.get('/module/list_all_custom', base.Connect(), function(req, res) {
	res.render("module/list_all_custom", RENDER);
});
