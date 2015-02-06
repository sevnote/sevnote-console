var express = require('express'),
	app = module.exports = express(),
	common = require('../lib/common'),
	base = require('../lib/base'),
	mysql = require('../lib/mysql'),
	rest = require('restler'),
	util = require('util'),
	rest = require('restler');

app.get('/message/list', base.Connect(),function(req, res) {
	var result = mysql.get_where_in('t_message',{'user_id':req.user.user_id});

	for(var i in result){
		result[i].sender = mysql.get_where_in('t_member',{'user_id':result[i].sender_id})[0].user_name;
		var date = moment(result[i].created,'X').format('YYYY-MM-DD HH:mm');
		result[i].created = date;
	}
	RENDER.result = result;
	RENDER.title = "通知 | 系统笔记 SEVNOTE.COM";
	res.render('message/list', RENDER);
});

app.get('/message/send_modal', base.Connect(),function(req, res) {
	res.send('message');
});


app.post('/message/send_do', base.Connect(),function(req, res) {
	var to = req.body.to;
	if(req.body.priority === '1'){
		var type = 'warning';
	}else{
		var type = 'information';
	}

	if(to === 'all'){
		io.sockets.emit('boardcast', {'type':type,'content':req.body.content});
	}
	res.json({
		ret_code: 0
	})

});


