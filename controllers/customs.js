var express = require('express'),
    app = module.exports = express(),
    base = require('../lib/base'),
    common = require('../lib/common'),
    smtpTransport = require('../lib/mailer'),
    online_mysql = require('../lib/online_mysql'),
    local_mysql = require('../lib/local_mysql'),
    admin_mysql = require('../lib/admin_mysql'),
    rest = require('../lib/restclient'),
    translate = require('../lib/translate');

//客户列表
app.get('/custom/list', base.Connect(), function(req, res) {
    var data = ({
        'account': req.session.cas_user,
    });
    
    if (role === 'manager') {
        res.render('custom/list_for_manager', data);
    } else {
        res.render('custom/list', data);
    }
});


//客户列表datatables
app.post('/custom/datatable', base.Connect(), function(req, res) {
    var user = req.session.cas_user;
    var search_value = req.body.search.value;
    var limit_start = (req.body.start) * 1;
    if(req.body.length === '-1'){
        var limit_count = 200;
    }else{
        var limit_count = (req.body.length) * 1;
    }

    //Filter
    var filter_array = []
    for (var i in req.body.columns) {
        if (req.body.columns[i].search.value !== '') {
            var filter_columns = req.body.columns[i].data;
            if (filter_columns === 'bill_status') {
                var bill_status_filter = req.body.columns[i].search.value;
                continue;
            }
            var filter_value = req.body.columns[i].search.value;
            var filter = filter_columns + " like '" + filter_value + "%'"
            filter_array.push(filter);
        }
    }
    if (filter_array.length === 0) {
        var filter = "";
    } else {
        var filter = filter_array.join(' AND ') + " AND";
    }


    switch (req.body.order[0].column) {
        case '1':
            var order_action = "online_id " + req.body.order[0].dir;
            break;
        case '4':
            var order_action = "level " + req.body.order[0].dir;
            break;
        case '5':
            var order_action = "type " + req.body.order[0].dir;
            break;
        case '6':
            var order_action = "industry " + req.body.order[0].dir;
            break;
        case '7':
            var order_action = "audited " + req.body.order[0].dir;
            break;
        case '8':
            var order_action = "created " + req.body.order[0].dir;
            break;
    }

    var condition = " online_id = top_organization_id AND " + filter + " (manager  like '" + search_value + "%' or email like '" + search_value + "%' or name like '%" + search_value + "%' or online_id = '" + search_value + "')";

    if (role === 'admin' || role === 'developer' || role === 'assistant') {

        var data = local_mysql.datatable('custom', condition, limit_count, limit_start, order_action);
        var countNum = local_mysql.datatable_count('custom', condition, limit_count, limit_start, order_action);

    } else {
        //客户经理判断属组
        //如果是区域经理，判断下属
        if (role === 'director') {
            var user = local_mysql.get_where_in('user', {
                'master': user
            });

            var user_array = []
            for (var i in user) {
                user_array.push(user[i].email);
            }

            var where_master = local_mysql.get_where_in('relation', 'master', user_array);

        } else {

            var where_master = local_mysql.get_where_in('relation', {
                'master': user
            });
        }

        var in_master_array = []
        for (var i in where_master) {
            in_master_array.push(where_master[i].online_id);
        }

        var in_master_array = _.uniq(in_master_array);

        var where_slave = local_mysql.get_where_in('relation', {
            'slave': user
        });

        var in_slave_array = []
        for (var i in where_slave) {
            in_slave_array.push(where_slave[i].online_id);
        }
        var in_slave_array = _.uniq(in_slave_array);
        var data_array = "(" + in_master_array.concat(in_slave_array).join(',') + ")";

        var sql = "SELECT * FROM custom WHERE online_id = top_organization_id AND  " + filter + " (" + condition + ") AND  online_id IN " + data_array + " ORDER BY " + order_action + " LIMIT " + limit_count + " OFFSET " + limit_start;
        var countsql = "SELECT count(id) FROM custom WHERE " + filter + " online_id IN " + data_array;
        var data = local_mysql.query(sql)
        var countNum = local_mysql.query(countsql)[0]['count(id)'];
    }

    var ps = [];
    for (var i in data) {
        var summary = "<a href='/custom/view/" + data[i].online_id + "'  >" + data[i].name + "</a>";
        var action = "<div class='btn-group'><button class='btn btn-default dropdown-toggle btn-xs' data-toggle='dropdown'>操作 <span class='caret'></span></button><ul class='dropdown-menu'> \
        <li><a  href='/custom/remark_modal/" + data[i].online_id + "/" + data[i].id + "'' data-toggle='ajaxModal' class='btn-flat inverse' ><icon class='fa fa-ellipsis-h'></icon> 备注信息</a></li> \
        <li><a  href='/audit/changeaudit_modal/" + data[i].online_id + "'' data-toggle='ajaxModal' class='btn-flat inverse' ><icon class='fa fa-long-arrow-down'></icon> 取消审核</a></li> \
        <li><a  href='/custom/vipmark_modal/" + data[i].online_id + "/" + data[i].id + "'' data-toggle='ajaxModal' class='btn-flat inverse' ><icon class='fa fa-exclamation'></icon> 标记大客户</a></li> \
        <li><a  href='/custom/transfer_modal/" + data[i].online_id + "/" + data[i].id + "'' data-toggle='ajaxModal' class='btn-flat inverse' ><icon class='fa fa-paper-plane'></icon> 转移客户经理</a></li> \
        <li><a  href='/custom/notice_modal/" + data[i].online_id + "'' data-toggle='ajaxModal' class='btn-flat inverse' ><icon class='fa fa-bullhorn'></icon> 设置是否通知</a></li> \
        <li><a  href='/custom/emu_modal/" + data[i].online_id + "'' data-toggle='ajaxModal' class='btn-flat inverse' ><icon class='fa fa-child'></icon> 模拟客户身份</a></li> \
        <li><a  href='/custom/dev_modal/" + data[i].online_id + "'' data-toggle='ajaxModal' class='btn-flat inverse' ><icon class='fa fa-leaf'></icon> 设置灰度发布</a></li></ul></div>";


        //线上ID
        var online_id = "<a href='/custom/view/" + data[i].online_id + "'  >" + data[i].online_id + "</a>";
        var level = translate.level_display(data[i].level);
        var industry = translate.industry_display(data[i].industry);
        var type = translate.type_display(data[i].type);
        var bill_status = translate.nonone_display(data[i].bill_status);
        //var bill_status = translate.bill_display(data[i].bill_status);
        var phone = translate.nonone_display(data[i].phone);
        var known_from = translate.nonone_display(data[i].known_from);
        var email = translate.nonone_display(data[i].email);
        var remark = translate.nonone_display(data[i].remark);
        var created = moment.unix(data[i].created).format("YY-MM-DD");
        //Manager
        if (data[i].manager === '') {
            var manager = "";
        } else {
            //manager
            var managers = local_mysql.get_where_in('relation', {
                'online_id': data[i].online_id
            });
            var manager_array = [];
            for (var i in managers) {
                manager_array.push(managers[i].master.replace(new RegExp('@ucloud.cn', 'gm'), ''))
                manager_array.push(managers[i].slave.replace(new RegExp('@ucloud.cn', 'gm'), ''))
            }
            var manager = _.uniq(manager_array)
        }
        ps.push({
            action: action,
            online_id: online_id,
            name: summary,
            email: email,
            level: level,
            type: type,
            industry: industry,
            phone: phone,
            ps: remark,
            known_from: known_from,
            create_date: created,
            manager: manager,
            bill_status: bill_status,
        });

    };


    res.json({
        "draw": req.body.draw,
        "recordsTotal": countNum,
        "recordsFiltered": countNum,
        data: ps
    });

});


//客户详细页面
app.get('/custom/view/:online_id', base.Connect(), function(req, res) {
    var online_id = req.params['online_id'];
    var data = {};

    var condition = ({
        'online_id': online_id
    })

    var online_id = local_mysql.get_where_in('custom', condition)[0].online_id;
    var custom_name = local_mysql.get_where_in('custom', condition)[0].name;
    var top_organization_id = local_mysql.get_where_in('custom', condition)[0].top_organization_id;

    var condition_custom = ({
        'online_id': online_id
    })

    var condition_opportunity = ({
        'organization_id': top_organization_id
    })

    var condition_contact = ({
        'organization_id': top_organization_id
    })

    var custom_data = local_mysql.get_where_in('custom', condition_custom)[0];
    var contact_data = local_mysql.get_where_in('contact', condition_contact);
    var opportunity_data = local_mysql.get_where_in('opportunity', condition_opportunity);

    for (var i in opportunity_data) {
        opportunity_data[i].close_date = common.data('y-m-d H:m', opportunity_data[i].close_date);
    }

    var contact_length = contact_data.length;
    var opportunity_length = opportunity_data.length;

    //历史订单
    var params = ({
        Action: 'GetHistoryOrder',
        AccountId :online_id
    });
    var history_order_count = rest.post(params).TotalCount;


    //账户余额
    var params = ({
        Action: 'GetAccountsMoney',
        AccountId :online_id
    });
    var accounts_money = rest.post(params).MoneySets[0];
    accounts_money.amount = accounts_money.Amount / 100;
    accounts_money.amount_free = accounts_money.AmountFree / 100;
    accounts_money.amount_credit = accounts_money.AmountCredit / 100;


    //充值消费总额
    var params = ({
        Action: 'GetPayAmount',
        AccountId :online_id
    });
    var pay_amount = rest.post(params);

    var data = ({
        'charge_amount': common.money_format(pay_amount.PaySet.ChargeAmount),
        'pay_amount': common.money_format(pay_amount.PaySet.PaidAmount),
        'accounts_money': accounts_money,
        'history_order_count': history_order_count,
        'account': req.session.cas_user,
        'custom': custom_data,
        'contact': contact_data,
        'opportunity': opportunity_data,
        'contact_length': contact_length,
        'opportunity_length': opportunity_length
    })

    res.render('custom/view', data);

});



//客户转移弹出层
app.get('/custom/transfer_modal/:online_id/:local_id', base.Connect(),function(req, res) {

    var online_id = req.param('online_id');
    var local_id = req.param('local_id');

    var condition = ({
        id: local_id
    })

    var result = local_mysql.get_where_in('custom', condition)[0];
    var info = ({
        'online_id': online_id,
        'local_id': local_id,
        'manager': result.manager
    });

    var results = local_mysql.query("SELECT * FROM `user` WHERE role='manager' or role='assistant'");

    var data = ({
        'info': info,
        'user_list': results
    })
    res.render('custom/transfer_modal', data);
});

//客户转移操作
app.post('/custom/transfer_do', base.Connect(),function(req, res) {

    var local_condition = ({
        'online_id': req.body.online_id
    })

    var online_condition = ({
        'user_id': req.body.online_id
    })

    var relation_condtion = ({
        'online_id': req.body.online_id
    })

    var master = req.body.master;
    var slave = req.body.slave;

    if (slave === undefined) {
        var slave = '';
    } else {
        var slave = slave
    }

    var online_local_data = ({
        'manager': master
    })

    var relation_data = ({
        'master': master,
        'slave': slave
    })


    //更新线上总表
    online_mysql.update('t_member', online_condition, online_local_data)
    //更新本地客户表
    local_mysql.update('custom', local_condition, online_local_data);
    //更新本地联系人
    local_mysql.update('contact', local_condition, online_local_data);
    //更新本地关系
    local_mysql.update('relation', relation_condtion, relation_data);

    res.json({
        ret_code: 0
    })
});


//备注信息弹出层
app.get('/custom/remark_modal/:online_id/:local_id', base.Connect(),function(req, res) {
    var online_id = req.param('online_id');
    var local_id = req.param('local_id');

    var condition = ({
        id: local_id
    })

    var result = local_mysql.get_where_in('custom', condition)[0];
    var data = ({
        'online_id': online_id,
        'local_id': local_id,
        'remark': result.remark
    });
    res.render('custom/remark_modal', data);
});

app.post('/custom/remark_do', base.Connect(),function(req, res) {
    var online_id = req.body.online_id;
    var local_id = req.body.local_id;
    var remark = req.body.remark;

    var local_condition = ({
        id: local_id
    })

    var online_condition = ({
        user_id: online_id
    })

    //update online
    online_mysql.update('t_member', online_condition, {
        'remark': remark
    });
    //update local
    local_mysql.update('custom', local_condition, {
        'remark': remark
    });

    res.json({
        ret_code: 0
    })

});


//VIP客户标记
app.get('/custom/vipmark_modal/:online_id/:local_id', base.Connect(),function(req, res) {
    var online_id = req.param('online_id');
    var local_id = req.param('local_id');

    var condition = ({
        user_id: online_id
    })

    var result = online_mysql.get_where_in('t_member', condition)[0];
    var data = ({
        'online_id': online_id,
        'local_id': local_id,
        'vip_mark': result.vip_mark
    });
    res.render('custom/vipmark_modal', data);
});

//VIP客户标记操作
app.post('/custom/vipmark_do', base.Connect(),function(req, res) {
    var local_id = req.body.local_id;
    var online_id = req.body.online_id;
    var vip_mark = req.body.vip_mark;
    var reason = req.body.reason;

    //Check Vaild
    if (reason === undefined) {
        res.json({
            ret_code: 1000,
            error_field: ['reason'],
            error_message: '操作理由不能为空'
        })
        return
    }

    var update_local = {
        'level': vip_mark
    };

    var update_online = {
        'vip_mark': vip_mark
    }

    if (vip_mark === '1') {
        var mark_display = "大客户";
    } else {
        var mark_display = "普通客户";
    }

    var condition_local = ({
        'id': local_id
    });

    var condition_online = ({
        'user_id': online_id
    });


    var result = local_mysql.get_where_in('custom', condition_local)[0];

    var update1 = local_mysql.update('custom', condition_local, update_local);
    var update2 = online_mysql.update('t_member', condition_online, update_online);

    // send mail
    var mailOptions = {
        from: "ucrm@ucloud.cn",
        to: "huakun@ucloud.cn,tuhui@ucloud.cn,caoyu@ucloud.cn, guopeng@ucloud.cn, zhouhaocheng@ucloud.cn, lixinran@ucloud.cn",
        cc: req.session.cas_user,
        subject: "UCRM客户" + result.name + "标记变更",
        html: "客户:" + result.name + "&nbsp;&nbsp;<br/>公司帐号:" + result.email + "&nbsp;&nbsp;<br/>客户标记变为:&nbsp;&nbsp;" + mark_display + "&nbsp;&nbsp;<br/>操作者:" + req.session.cas_user + "<br/>操作理由:" + reason
    }

    smtpTransport.sendMail(mailOptions, function(error, response) {
        if (error) {
            console.log(error);
        } else {
            console.log("Message sent: " + response.message);
        }
    });

    res.json({
        ret_code: 0
    })
});


//灰度发布列表
app.get('/custom/dev_list', base.Connect(),function(req, res) {

    var data = ({
        'account': req.session.cas_user
    })
    res.render('custom/dev_list', data);

});


//灰度发布datatables
app.get('/custom/dev_datatable', base.Connect(),function(req, res) {

    var query_array = online_mysql.query("SELECT account_id from t_member_extend_info WHERE attribute ='locked' OR attribute ='version'");

    var account_array = [];
    for (var i in query_array) {
        account_array.push(query_array[i].account_id);
    }
    var account_array = _.uniq(account_array);

    var data = online_mysql.get_where_in('t_member', 'user_id', account_array);

    for (var i in data) {
        data[i].action = "<div class='btn-group'><button class='btn btn-default dropdown-toggle btn-xs' data-toggle='dropdown'>操作 <span class='caret'></span></button><ul class='dropdown-menu'><li><a  href='/custom/dev_modal/" + data[i].user_id + "'' data-toggle='ajaxModal' class='btn-flat inverse' ><icon class='fa fa-leaf'></icon> 设置灰度发布</a></li></ul></div>"
    }

    res.json({
        data: data
    })
});

//设置灰度发布弹出层
app.get('/custom/dev_modal/:online_id', base.Connect(),function(req, res) {
    var online_id = req.param('online_id');

    var condition_version = ({
        'account_id': online_id,
        'attribute': 'version'
    })


    var condition_locked = ({
        'account_id': online_id,
        'attribute': 'locked'
    })

    var version = online_mysql.get_where_in('t_member_extend_info', condition_version)[0];
    var locked = online_mysql.get_where_in('t_member_extend_info', condition_locked)[0];

    if (version === undefined) {
        var version = '未设置';
    } else {
        var version = version.value;
    }

    if (locked === undefined) {
        var locked = '';
    } else {
        var locked = locked.value;
    }

    var info = ({
        'online_id': online_id,
        'version': version,
        'locked': locked
    });

    var data = ({
        'info': info
    })

    res.render('custom/dev_modal', data);
});


//灰度发布设置操作
app.post('/custom/dev_do', base.Connect(),function(req, res) {
    var online_id = req.body.online_id;
    var local_id = req.body.local_id;
    var version = req.body.version;
    var locked = req.body.locked;


    var result_version = online_mysql.query("SELECT * from t_member_extend_info WHERE account_id='" + online_id + "' AND attribute='version'");
    var result_locked = online_mysql.query("SELECT * from t_member_extend_info WHERE account_id='" + online_id + "' AND attribute='locked'");


    //检查并且更新version字段
    if (result_version.length === 0) {
        var version_data_insert = ({
            'id': '',
            'account_id': online_id,
            'attribute': 'version',
            'value': version
        })
        online_mysql.insert('t_member_extend_info', version_data_insert);
    } else {
        var condition_version = ({
            'account_id': online_id,
            'attribute': 'version'
        })

        var version_data_update = ({
            'attribute': 'version',
            'value': version
        })
        online_mysql.update('t_member_extend_info', condition_version, version_data_update)
    }

    //检查并且更新locked字段
    if (result_locked.length === 0) {
        var version_data_locked = ({
            'id': '',
            'account_id': online_id,
            'attribute': 'locked',
            'value': locked
        })
        online_mysql.insert('t_member_extend_info', version_data_locked);
    } else {
        var condition_locked = ({
            'account_id': online_id,
            'attribute': 'locked'
        })

        var locked_data_update = ({
            'attribute': 'locked',
            'value': locked
        })
        online_mysql.update('t_member_extend_info', condition_locked, locked_data_update)
    }

    res.json({
        ret_code: 0
    })

});



//大客户维护
app.get('/custom/vip_list', base.Connect(),function(req, res) {
    var data = ({
        'account': req.session.cas_user
    })

    res.render('custom/vip_list', data);
});

//大客户QQ群维护弹出层
app.get('/custom/qq_modal/:id', base.Connect(),function(req, res) {
    var id = req.param('id');
    var condition = ({
        account_id: id
    });

    var results = online_mysql.get_where_in('t_member_extend_info', condition);

    if (results.length === 1) {
        var value = results[0].value;
        var account_id = results[0].account_id;
    } else {
        var value = "";
        var account_id = id
    }

    var data = ({
        account_id: account_id,
        qqgroup: value
    });

    res.render('custom/qq_modal', data);
});

//客户QQ添加修改操作
app.post('/custom/qqadd_do', base.Connect(),function(req, res) {
    var qqgroup = req.body.qqgroup;
    var account_id = req.body.account_id;
    var data = {
        'account_id': account_id,
        'attribute': 'qq_group',
        'value': qqgroup
    };


    var condition = ({
        account_id: account_id
    });


    var results = online_mysql.get_where_in('t_member_extend_info', condition);

    if (results.length === 1) {
        online_mysql.update('t_member_extend_info', condition, data);
        res.json({
            ret_code: 0
        });
    } else {
        online_mysql.insert('t_member_extend_info', data);
        res.json({
            ret_code: 0
        });
    }
});



//客户QQ群datatables
app.post('/custom/vip_datatables', base.Connect(),function(req, res) {
    var data = online_mysql.query('SELECT t_member_extend_info.account_id,t_member.user_name,t_member.user_position,t_member.user_id, t_member.user_type, t_member.user_email, t_member.user_phone, t_member.vip_mark, t_member.parent_id, t_member.industry_type, t_member.company_name, t_member_extend_info.`value` FROM t_member LEFT JOIN t_member_extend_info ON t_member_extend_info.account_id = t_member.user_id WHERE t_member.vip_mark = 1 AND t_member.parent_id = 0');

    var ps = [];
    for (var i in data) {

        var summary = "<a href='/custom/qqmodal/" + data[i].user_id + "'  >" + data[i].company_name + "</a>";
        var action = "<div class='btn-group'><button class='btn btn-default dropdown-toggle btn-xs' data-toggle='dropdown'>操作 <span class='caret'></span></button><ul class='dropdown-menu'><li><a  href='/custom/qq_modal/" + data[i].user_id + "'' data-toggle='ajaxModal' class='btn-flat inverse' ><icon class='fa fa-qq'></icon> 编辑QQ群</a></li></ul></div>"

        if (data[i].parent_id === 0) {
            var account_type = "<span class='label btn-success'>主帐号</span>";
        } else {
            var account_type = "<span class='label btn-info'>子帐号</span>";
        }

        var industry = translate.industry_display(data[i].industry_type);
        var type = translate.type_display(data[i].user_type);

        //console.log(data[i].value);
        if (data[i].value != null) {
            var value = data[i].value;
        } else {
            var value = '';
        }


        ps.push({
            name: summary,
            email: data[i].user_email,
            account_type: account_type,
            type: type,
            industry: industry,
            user_name: data[i].user_name,
            phone: data[i].user_phone,
            user_position: data[i].user_position,
            qq: value,
            action: action
        });
    };

    res.json({
        data: ps
    });
});

//是否通知弹出层
app.get('/custom/notice_modal/:online_id', base.Connect(),function(req, res) {
    var online_id = req.param('online_id');

    var condition_notice = ({
        'account_id': online_id,
    })

    var notice1 = admin_mysql.get_where_in('t_expired_black_list_sms',{'account_id':online_id});
    var notice2 = admin_mysql.get_where_in('t_expired_cdn_black_list',{'account_id':online_id});


    if(notice1.length !== 0 || notice2.length !== 0){
        var noticed = '1';
    }else{
        var noticed = '0';
    }

    var data = ({
        'account_id':online_id,
        'notice': noticed
    })

    res.render('custom/notice_modal', data);
});


//设置是否通知操作
app.post('/custom/notice_do', base.Connect(),function(req, res) {
    var online_id = req.body.online_id;

    var notice1 = admin_mysql.get_where_in('t_expired_black_list_sms',{'account_id':online_id});
    var notice2 = admin_mysql.get_where_in('t_expired_cdn_black_list',{'account_id':online_id});

    if(notice1.length !== 0 || notice2.length !== 0){
        admin_mysql.delete('t_expired_black_list_sms',{'account_id':online_id});
        admin_mysql.delete('t_expired_cdn_black_list',{'account_id':online_id});
    }else{
        admin_mysql.insert('t_expired_black_list_sms',{'account_id':online_id});
        admin_mysql.insert('t_expired_cdn_black_list',{'account_id':online_id});
    }


    res.json({
        ret_code: 0
    })
});


//模拟客户身份弹出层
app.get('/custom/emu_modal/:online_id', base.Connect(),function(req, res) {
    var user = req.session.cas_user;
    var online_id = req.params['online_id'];

    var custom_result = online_mysql.get_where_in('t_member', {
        'user_id': online_id
    })[0];
    var own_result = online_mysql.get_where_in('t_member', {
        'user_email': user
    })[0];

    if (custom_result.top_organization_id === own_result.top_organization_id && custom_result.organization_id === own_result.top_organization_id) {
        var emu = 'enabled';
    } else {
        var emu = 'disabled';
    }

    var data = ({
        online_id: online_id,
        emu: emu
    })

    res.render('custom/emu_modal', data);
});

//模拟客户身份弹出层
app.post('/custom/emu_do', base.Connect(),function(req, res) {
    var user = req.session.cas_user;
    var online_id = req.body.online_id;
    var emu = req.body.emu;

    if (emu === '1') {
        var custom_result = online_mysql.get_where_in('t_member', {
            'user_id': online_id
        })[0];

        var custom_top_organization_id = custom_result.top_organization_id;
        var custom_organization_id = custom_result.organization_id;

        var online_update = ({
            'top_organization_id': custom_top_organization_id,
            'organization_id': custom_organization_id

        })

        online_mysql.update('t_member', {
            'user_email': user
        }, online_update);

    } else {

        var own = local_mysql.get_where_in('user', {
            'email': user
        })[0];
        var own_top_organization_id = own.top_organization_id;
        var own_organization_id = own.organization_id;

        var online_update = ({
            'top_organization_id': own_top_organization_id,
            'organization_id': own_organization_id

        })

        online_mysql.update('t_member', {
            'user_email': user
        }, online_update);
    }
    res.json({
        ret_code: 0
    })
});


//编辑基本信息弹出层
app.get('/custom/edit_modal/:online_id', base.Connect(),function(req, res) {
    var online_id = req.params['online_id'];
    var result = local_mysql.get_where_in('custom', {
        'online_id': online_id
    })[0];
    res.render('custom/edit_modal', result);
});

//编辑基本信息
app.post('/custom/edit_do', base.Connect(),function(req, res) {
    var online_id = req.body.online_id;

    var update_local = {
        'known_from': req.body.known_from,
        'industry': req.body.industry,
        'type': req.body.type,
        'remark': req.body.remark
    }

    var update_online = {
        'known_from': req.body.known_from,
        'industry_type': req.body.industry,
        'user_type': req.body.type,
        'remark': req.body.remark
    }

    local_mysql.update('custom', {
        'online_id': online_id
    }, update_local);
    online_mysql.update('t_member', {
        'user_id': online_id
    }, update_online);

    res.json({
        ret_code: 0
    })
});