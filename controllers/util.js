var express = require('express');
var app = module.exports = express();

var common = require('../lib/common'),
    async = require('async'),
    mysql = require('../lib/mysql'),
    User = require('../models/user')(orm, db);

app.use('/upload', function(req, res, next) {
    // imageVersions are taken from upload.configure()
    console.log(req.filemanager)
    upload.fileHandler({
        uploadDir: function() {
            return __dirname + '/public/uploads/' + req.sessionID
        },
        uploadUrl: function() {
            return '/uploads/' + req.sessionID
        }
    })(req, res, next);
});


