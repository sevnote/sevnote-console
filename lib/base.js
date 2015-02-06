var common = require('../lib/common');
var fibers = require("fibers");
var mysql = require('../lib/mysql');
var moment = require('moment');


exports.Connect = function() {
	return function(req, res, next) {

		var path = req.route.path;
		if(req.path.split('/').length>1){
			var controller = req.path.split('/')[1];
		}else{
			var controller = 'root';
		}
		req.path = path;
		if (!req.isAuthenticated()) {
			res.redirect('/');
		} else {
			var result = mysql.get_where_in('t_member', {
				'user_id': req.user.user_id
			})[0];
			RENDER = ({
				'path': req.path,
				'controller':controller,
				'account': req.session.passport.user.user_email,
				'avatars': result.avatars
			})
			console.log(RENDER);
			next();
		}
	}
}
