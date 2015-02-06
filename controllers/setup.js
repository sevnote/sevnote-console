var express = require('express'),
	app = module.exports = express(),
	common = require('../lib/common'),
	base = require('../lib/base'),
	mysql = require('../lib/mysql'),
	fs = require('fs'),
	shell = require('shelljs'),
	cprocess = require('child_process'),
	validator = require('validator'),
	mail = require('../lib/mailer'),
	util = require('util');
	rest = require('restler');


app.get('/setup/import_list', base.Connect(), function(req, res) {
	RENDER.title = "导入数据 | 系统笔记 SEVNOTE.COM";
	RENDER.public_key = req.session.passport.user.public_key
	res.render("setup/import_list", RENDER);
});

app.get('/setup/storage', base.Connect(), function(req, res) {
	var apikey = req.user.private_key;

	var post_data = ({
		ApiKey: apikey
	});

	rest.post('http://api.sevnote.com/GetStorage', {
		data: post_data,
	}).on('complete', function(data, response) {

		var total_size = 0;
		var total_count = 0;
		for(var i in data.Data){
			total_size += data.Data[i].size*1;
			total_count += data.Data[i].count*1;
			var index = data.Data[i].index;
			var index = index.split("-")[2];
            data.Data[i].indexreal = data.Data[i].index;
			data.Data[i].index = index;
		}

		RENDER.title = "存储管理 | 系统笔记 SEVNOTE.COM";
		RENDER.public_key = req.session.passport.user.public_key;
		RENDER.private_key = req.session.passport.user.private_key;
		RENDER.storage = data.Data;
		RENDER.total_size = total_size;
		RENDER.total_count = total_count;
		res.render("setup/storage", RENDER);
	});

});

app.get('/setup/api', base.Connect(), function(req, res) {
	RENDER.title = "API管理 | 系统笔记 SEVNOTE.COM";
	RENDER.public_key = req.session.passport.user.public_key;
	RENDER.private_key = req.session.passport.user.private_key;
	res.render("setup/api", RENDER);
});

app.get('/setup/profile', base.Connect(), function(req, res) {
	RENDER.title = "账户资料 | 系统笔记 SEVNOTE.COM";
	var result = mysql.get_where_in('t_member', {
		'user_id': req.session.passport.user.user_id
	})[0];
	RENDER.public_key = req.session.passport.user.public_key;
	RENDER.private_key = req.session.passport.user.private_key;
	RENDER.user = result;
	res.render("setup/profile", RENDER);
});


app.get('/setup/init', base.Connect(), function(req, res) {

	var result = mysql.get_where_in('t_member', {
		'user_email': req.user.user_email,
	});

	RENDER.public_key = req.user.public_key;
	RENDER.user_phone = result[0].user_phone || "";
	RENDER.company_name = result[0].company_name || "";
	RENDER.user_address = result[0].user_address || "";
	RENDER.user_qq = result[0].user_qq || "";
	RENDER.title = "系统初始化向导 | 系统笔记 SEVNOTE.COM";
	res.render("setup/init", RENDER);
});


app.post('/setup/init_do', base.Connect(), function(req, res) {
	var result = mysql.get_where_in('t_member', {
		'user_email': req.user.user_email,
		'inited': 0
	});

	if (result.length > 0) {
		var public_key = result[0].public_key;
		var user_id = result[0].user_id;

		var update = ({
			'user_phone': req.body.user_phone,
			'company_name': req.body.company_name,
			'user_address': req.body.user_address,
			'user_qq': req.body.user_qq,
			'known_from':req.body.known_from
		});


		if (!validator.isNumeric(req.body.user_phone)) {
			res.json(common.error('联系电话格式错误'));
			return false
		} else if (req.body.user_phone === null || req.body.user_phone === undefined || req.body.user_phone === "") {
			res.json(common.error('联系电话缺失'));
			return false
		} else if (!validator.isNumeric(req.body.user_qq)) {
			res.json(common.error('QQ号码有误?'));
			return false
		}


		mysql.update('t_member', {
			'user_email': req.user.user_email
		}, update);

		fs.mkdirSync('/data/sevnote/logstash/etc/patterns/' + user_id);
		fs.openSync('/data/sevnote/logstash/etc/patterns/' + user_id + '/custom', 'w');
		shell.cp('/data/sevnote/logstash/etc/templates/t.conf', '/data/sevnote/logstash/conf.d/' + user_id + '.conf');
		shell.sed('-i', 'template_uuid', public_key, '/data/sevnote/logstash/conf.d/' + user_id + '.conf');
		shell.sed('-i', 'template_user_id', user_id, '/data/sevnote/logstash/conf.d/' + user_id + '.conf');
		shell.sed('-i', 'template_user_id_tag', user_id, '/data/sevnote/logstash/conf.d/' + user_id + '.conf');
		shell.sed('-i', 'template_user_id_output1', user_id, '/data/sevnote/logstash/conf.d/' + user_id + '.conf');
		shell.sed('-i', 'template_user_id_output2', user_id, '/data/sevnote/logstash/conf.d/' + user_id + '.conf');
		mysql.update('t_member', {
			'user_email': req.user.user_email
		}, {
			'inited': 1
		});

		var init_result = shell.exec('sudo /data/sevnote/logstash/bin/init reload').code;

		if (init_result === 0) {


			var mailOptions = {
				from: 'noreply@sevnote.com',
				to: 'firstsko@126.com',
				subject: '用户' + req.user.user_email + '初始化成功',
				text: '用户' + req.user.user_email + '初始化成功,Logstash正常重启'
			};

			mail.sendMail(mailOptions, function(error, info) {
				if (error) {
					console.log(error);
				} else {
					console.log('Message sent: ' + info.response);
				}
			});

			res.json(common.succeed('初始化成功,正在进入控制面板,请稍后...', '/console/dashboard'));
		} else {
			var mailOptions = {
				from: 'noreply@sevnote.com',
				to: 'firstsko@126.com',
				subject: '用户' + req.user.user_email + '初始化失败',
				text: '用户' + req.user.user_email + '初始化成功,Logstash启动异常！进行已挂死'
			};

			mail.sendMail(mailOptions, function(error, info) {
				if (error) {
					console.log(error);
				} else {
					console.log('Message sent: ' + info.response);
				}
			});

			res.json(common.error('抱歉,初始化失败,我们的技术人员会主动联系您.'));
		}
	} else {
		res.json(common.succeed('已经初始化，无需再次初始化,正在进入控制面板，请稍后...', '/console/dashboard'));
	}

});

app.get('/setup/apikey', base.Connect(), function(req, res) {
	res.send("define({ apikey: function() { return '" + req.session.passport.user.private_key + "' }, api_gateway:function(){ return '"+config.api_gateway+"' } });")
});


