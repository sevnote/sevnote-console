var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var GitHubStrategy = require('passport-github').Strategy;
var mysql = require('../lib/mysql');
var sha1 = require('sha1');
var fibers = require("fibers");
var rand = require("random-key");
var uuid = require('node-uuid');
var commom = require('./common.js');

module.exports = function(passport) {

	passport.serializeUser(function(user, done) { //保存user对象
		done(null, user); //可以通过数据库方式操作
	});

	passport.deserializeUser(function(user, done) { //删除user对象
		done(null, user); //可以通过数据库方式操作
	});

	passport.use('local', new LocalStrategy(
		function(username, password, done) {
			fibers(function() {

				if (username === undefined || password === undefined) {
					return done(null, false, {
						message: '请输入登录凭据'
					});
				}

				var result = mysql.get_where_in('t_member', {
					'user_email': username
				})[0];

				if (result === undefined) {
					return done(null, false, {
						message: '不存在的用户名'
					});
				}

				var user = ({
					'user_id': result.user_id,
					'user_email': result.user_email,
					'user_name': result.user_name,
					'private_key': result.private_key,
					'public_key': result.public_key
				})


				if (sha1(password) !== result.user_pwd) {
					return done(null, false, {
						message: '密码错误,请重新输入'
					});
				}

				return done(null, user);
			}).run();
		}
	));

	passport.use('github', new GitHubStrategy({
			clientID: 'ae46ecc6dbc7e7f9ae2c',
			clientSecret: 'c6bc6a3de213e5724dcc707ac50f48fdaeab412e',
			callbackURL: "https://console.sevnote.com/auth/github/callback"
		},
		function(accessToken, refreshToken, profile, done) {
			fibers(function() {
				var username = profile.emails;

				if (username === undefined) {
					return done(null, false, {
						message: '请输入登录凭据'
					});
				}

				var result = mysql.get_where_in('t_member', {
					'user_email': profile.emails[0].value
				});


				if (result.length === 0) {
					var create_user = ({
						'user_email': profile.emails[0].value,
						'user_name': 'github_' + profile.username + profile.id,
						'public_key': uuid.v4(),
						'private_key': rand.generate(),
						'created': commom.nowstamps(),
						'updated': commom.nowstamps(),
						'company_website': profile._json.blog,
						'user_address': profile._json.location,
						'avatars': 'https://avatars.githubusercontent.com/u/4372169?v=2',
					})
					mysql.insert('t_member', create_user);

					var result = mysql.get_where_in('t_member', {
						'user_email': profile.emails[0].value
					})[0];
				} else {
					var result = result[0];
					var user = ({
						'user_id': result.user_id,
						'user_email': result.user_email,
						'user_name': result.user_name,
						'private_key': result.private_key,
						'public_key': result.public_key
					});
				}

				return done(null, user);
			}).run();

		}
	));


}
