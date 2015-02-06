var fibers = require("fibers"),
    express = require('express'),
    app = module.exports = express(),
    base = require('../lib/base'),
    common = require('../lib/common'),
    smtpTransport = require('../lib/mailer'),
    online_mysql = require('../lib/online_mysql'),
    local_mysql = require('../lib/local_mysql'),
    translate = require('../lib/translate');


//注册用户分析
app.get('/report/reg', base.Connect(), function(req, res) {
    var data = ({
        'now': common.now('date'),
        'account': req.session.cas_user,
    })
    res.render('report/reg', data);
});

//按照行业注册用户分析数据采集
app.get('/report/by_industry/:start/:end', base.Connect(), function(req, res) {

    var startstamp = req.params['start'];
    var endstamp = req.params['end'];
    var sql = "SELECT * from custom WHERE created BETWEEN " + startstamp + " AND " + endstamp;
    var results = local_mysql.query(sql);

    var count_sql = "SELECT count(id) from custom WHERE created BETWEEN " + startstamp + " AND " + endstamp;
    var count = local_mysql.query(count_sql)[0]['count(id)'];

    var date_array = [];
    for (var i in results) {
        var industry = translate.industry_display(results[i].industry);
        date_array.push(industry);
    }

    var data = common.compressArray(date_array);

    res.json({
        ret_code: 0,
        data: data,
        count: count,
    })

});


//按照类型注册用户分析数据采集
app.get('/report/by_type/:start/:end', base.Connect(),  function(req, res) {

    var startstamp = req.params['start'];
    var endstamp = req.params['end'];
    var sql = "SELECT * from custom WHERE created BETWEEN " + startstamp + " AND " + endstamp;
    var results = local_mysql.query(sql);

    var count_sql = "SELECT count(id) from custom WHERE created BETWEEN " + startstamp + " AND " + endstamp;
    var count = local_mysql.query(count_sql)[0]['count(id)'];

    var date_array = [];
    for (var i in results) {
        var type = translate.type_display(results[i].type);
        date_array.push(type);
    }

    var data = common.compressArray(date_array);

    res.json({
        ret_code: 0,
        data: data,
        count: count,
    })

});

//按照类型注册用户分析数据采集
app.get('/report/by_known_from/:start/:end', base.Connect(), function(req, res) {

    var startstamp = req.params['start'];
    var endstamp = req.params['end'];
    var sql = "SELECT * from custom WHERE created BETWEEN " + startstamp + " AND " + endstamp;
    var results = local_mysql.query(sql);

    var count_sql = "SELECT count(id) from custom WHERE created BETWEEN " + startstamp + " AND " + endstamp;
    var count = local_mysql.query(count_sql)[0]['count(id)'];

    var date_array = [];
    for (var i in results) {
        if (results[i].known_from === null) {
            var known_from = translate.nonone_display(results[i].known_from);
            date_array.push(known_from);
        }
    }
    var data = common.compressArray(date_array);
    res.json({
        ret_code: 0,
        data: data,
        count: count,
    })
});


//按照审核通过和拒绝比例
app.get('/report/by_audited/:start/:end', base.Connect(), function(req, res) {

    var startstamp = req.params['start'];
    var endstamp = req.params['end'];

    var sql = "SELECT * from t_member WHERE created BETWEEN " + startstamp + " AND " + endstamp;
    var results = online_mysql.query(sql);

    var count_sql = "SELECT count(user_id) from t_member WHERE created BETWEEN " + startstamp + " AND " + endstamp;
    var count = online_mysql.query(count_sql)[0]['count(user_id)'];

    var date_array = [];
    for (var i in results) {
        var audited = translate.audited_display(results[i].audited);
        date_array.push(audited);
    }

    var data = common.compressArray(date_array);

    res.json({
        ret_code: 0,
        data: data,
        count: count,
    })
});

//referrer url 来源
app.get('/report/by_referrer_url/:start/:end', base.Connect(),function(req, res) {

    var startstamp = req.params['start'];
    var endstamp = req.params['end'];

    var sql = "SELECT referrer_url from t_member WHERE created BETWEEN " + startstamp + " AND " + endstamp;
    var results = online_mysql.query(sql);

    var count_sql = "SELECT count(user_id) from t_member WHERE created BETWEEN " + startstamp + " AND " + endstamp;
    var count = online_mysql.query(count_sql)[0]['count(user_id)'];

    var date_array = [];
    for (var i in results) {
        if (results[i].referrer_url === '') {
            var referrer_url = '直接访问';
        } else {
            var url = results[i].referrer_url.split('/')[2];
            date_array.push(url);
        }
    }

    var data = common.compressArray(date_array);

    res.json({
        ret_code: 0,
        data: data,
        count: count,
    })

});


//referrer url 来源
app.get('/report/by_referrer_code/:start/:end', base.Connect(),function(req, res) {

    var startstamp = req.params['start'];
    var endstamp = req.params['end'];

    var sql = "SELECT * from t_member WHERE created BETWEEN " + startstamp + " AND " + endstamp;
    var results = online_mysql.query(sql);

    var count_sql = "SELECT count(user_id) from t_member WHERE created BETWEEN " + startstamp + " AND " + endstamp;
    var count = online_mysql.query(count_sql)[0]['count(user_id)'];

    var date_array = [];
    for (var i in results) {
        if (results[i].referrer_code === '') {
            var referrer_code = '无活动码';
        } else {
            var referrer_code = results[i].referrer_code
        }
        date_array.push(referrer_code);
    }

    var data = common.compressArray(date_array);

    res.json({
        ret_code: 0,
        data: data,
        count: count,
    })
});

//注册用户分析
app.get('/report/create', base.Connect(),function(req, res) {
    var data = ({
        'now': common.now('date'),
        'account': req.session.cas_user,
    })
    //Action log
    var userlog = {
        username: req.session.cas_user,
        loginfo: "查看用户注册报表"
    };
    common.log_user_action(userlog);
    res.render('report/create', data);
});

//生成报表
app.post('/report/create_do', base.Connect(),function(req, res) {
    var report_type = req.body.report_type;
    var columns = req.body.columns.join(',');
    var columns_display = [];
    for (var i in req.body.columns) {
        var value = req.body.columns[i].split('.').pop();
        columns_display.push(value);
    }

    //行业过滤
    if ($.isArray(req.body.industry)) {
        var industry_filter = [];
        for (var i in req.body.industry) {
            var value = "industry ='" + req.body.industry[i] + "'";
            industry_filter.push(value);
        }
        var industry_filter = industry_filter.join(' OR ');
    } else {
        var industry_filter = "industry ='" + req.body.industry + "'";
    }
    //类型过滤
    var type_filter = "type ='" + req.body.type + "'";
    //级别够率
    var level_filter = "level ='" + req.body.level + "'";

    var sql = "SELECT " + columns + " FROM contact LEFT JOIN custom ON contact.online_id = custom.online_id WHERE " + industry_filter + " AND " + type_filter + " AND " + level_filter;

    var results = local_mysql.query(sql);

    for (var i in results) {
        results[i].level = translate.level_display(results[i].level);
        results[i].industry = translate.industry_display(results[i].industry);
        results[i].type = translate.type_display(results[i].type);
        results[i].phone = translate.nonone_display(results[i].phone);
        results[i].known_from = translate.nonone_display(results[i].known_from);
        results[i].email = translate.nonone_display(results[i].email);
    }

    var data = ({
        'columns': columns_display,
        'data': results,
        'account': req.session.cas_user
    })

    if (report_type) {
        res.render('report/list', data)
    }
});