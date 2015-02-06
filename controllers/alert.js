var express = require('express'),
	app = module.exports = express(),
	common = require('../lib/common'),
	base = require('../lib/base'),
	mysql = require('../lib/mysql'),
	rest = require('restler');

app.get('/alert/list', base.Connect(), function(req, res) {
	RENDER.title = "告警系统 | 系统笔记 SEVNOTE.COM";
	res.render('alert/list', RENDER);
});

app.get('/alert/create_alert_modal', base.Connect(), function(req, res) {
	res.render('alert/create_alert_modal', RENDER);
});