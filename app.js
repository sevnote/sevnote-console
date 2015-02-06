var fibers = require("fibers");
var fs = require('fs');
var express = require('express');
var http = require('http');
var path = require('path');
var app = express();
var RedisStore = require('connect-redis')(express);
var cors = require('cors');
var common = require('./lib/common');
var http = require('http').Server(app);
var passport = require('passport');
var passoort = require('./lib/passport')(passport);
io = require('socket.io')(http);
moment = require('moment');
config = require("./config/config.json")[app.get("env")];
upload = require('jquery-file-upload-middleware');
$ = require('jQuery');
moment = require('moment');
_ = require('underscore');

//Https
/*var https = require('https');
var privateKey  = fs.readFileSync('key/ssl.key', 'utf8');
var certificate = fs.readFileSync('key/ssl.crt', 'utf8');
var credentials = {key: privateKey, cert: certificate};*/

// all environments
app.set('port', config.app_port);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('FhDIjP5784Us9M1V'));
app.use(express.session({
    store: new RedisStore(config.redis_store),
    secret: 'FhDIjP5784Us9M1V4s32',
    cookie: {
        maxAge: 6000000
    }
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'javascript')));
app.use(app.router);


app.all("*", function(req, res, next) {
    fibers(function() {
        next();
    }).run();
});


//Upload Function
app.use('/upload', function(req, res, next) {
    // imageVersions are taken from upload.configure()
    upload.fileHandler({
        uploadDir: function() {
            return 'public/uploads'
        }
    })(req, res, next);
});

//Upload Finish Event
upload.on('end', function(fileInfo) {
    var extension = common.extension(fileInfo.originalName);
    var target_path = __dirname + '/public/uploads/' + fileInfo.filename + '.jpeg';
    // Move File
    var tmp_path = __dirname + '/public/uploads/' + fileInfo.originalName;

    fs.rename(tmp_path, target_path, function(err) {
        if (err) throw err;
        fs.unlink(tmp_path, function() {
            if (err) throw err;
        });
    });

});


//Reg Controllers;
var function_controllers = require('./controllers/function');
var analyze_controllers = require("./controllers/analyze");
var console_controllers = require("./controllers/console");
var audited_controllers = require("./controllers/audited");
var setup_controllers = require("./controllers/setup");
var alert_controllers = require("./controllers/alert");
var module_controllers = require("./controllers/module");
var message_controllers = require("./controllers/message");

app.use(function_controllers);
app.use(console_controllers);
app.use(audited_controllers);
app.use(analyze_controllers);
app.use(setup_controllers);
app.use(alert_controllers);
app.use(module_controllers);
app.use(message_controllers);


http.listen(app.get('port'), function() {
    console.info("listening :" + app.get("port"));
});
