var express = require('express'),
    app = module.exports = express(),
    common = require('../lib/common'),
    base = require('../lib/base'),
    mysql = require('../lib/mysql'),
    passport = require('passport'),
    sha1 = require('sha1'),
    rand = require("random-key"),
    validator = require('validator'),
    uuid = require('node-uuid'),
    mail = require('../lib/mailer'),
    fs = require('fs'),
    shell = require('shelljs');

app.get("/", function(req, res, next) {
    res.render("public/login");
});

//Local Login
app.post('/login', function(req, res, next) {
    passport.authenticate('local', function(err, user, info) {
        if (err) {
            return next(err)
        }
        if (!user) {
            res.json({
                response: 'error',
                msg: info.message,
            })
            return false;
        } else {

            req.logIn(user, function(err) {
                if (err) {
                    return next(err);
                }
                var update = ({
                    last_login: common.nowstamps(),
                });

                mysql.update('t_member', {
                    'user_email': user.user_email
                }, update);

                var result = mysql.get_where_in('t_member', {
                    'user_email': user.user_email
                })[0]

                if (result.inited === 0) {
                    res.json({
                        response: 'success',
                        more: '/setup/init'
                    })
                } else {
                    res.json({
                        response: 'success',
                        more: '/analyze/logs'
                    })
                }

            });
        }
    })(req, res, next);
});


app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});


app.get('/download',base.Connect(), function(req, res) {
        var result = mysql.get_where_in('t_member', {
        'user_email': req.user.user_email,
        });

        var public_key = result[0].public_key;
        var private_key = result[0].private_key;
        var user_id = result[0].user_id;
        var access_server = result[0].access_server +'.sevnote.com:514';

        shell.cp('-rf','/data/logstack/sevnote-generic-forward/*', '/data/logstack/download/sevnote-generic-forward-'+user_id);
        shell.sed('-i', 'user_public_key', public_key, '/data/logstack/download/sevnote-generic-forward-'+user_id + '/etc/sevnote-forward.json');
        shell.sed('-i', 'user_private_key', private_key, '/data/logstack/download/sevnote-generic-forward-'+user_id + '/etc/sevnote-forward.json');
        shell.sed('-i', 'access', access_server, '/data/logstack/download/sevnote-generic-forward-'+user_id + '/config/access.conf');

        var init_result = shell.exec("tar zcvf /data/logstack/download/sevnote-generic-forward-"+user_id+".tar.gz /data/logstack/download/sevnote-generic-forward-"+user_id).code;

        res.download('/data/logstack/download/sevnote-generic-forward-'+user_id+'.tar.gz', 'sevnote-generic-forward.tar.gz');
});


