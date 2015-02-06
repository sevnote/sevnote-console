var Future = require('fibers/future');

var DbActiverecord = require('mysql-activerecord');

var db = new DbActiverecord.Adapter(config.mysql);

exports.query = function(sql) {
    var f = new Future;
    db.query(sql, function(err, results){
        if(err){
            console.info(err);
            f.return(false); 
        }else{
            f.return(results);
        }
    });
    return f.wait();
}

exports.select = function(field,table) {
    var f = new Future;
    db.select(field)
        .get(table, function(err, results){
        if(err){
            console.info(err);
            f.return(false); 
        }else{
            f.return(results);
        }
    });
    return f.wait();
}

exports.get = function(table_name) {
    var f = new Future;
    db.get(table_name, function(err, results){
        if(err){
            console.info(err);
            f.return(false); 
        }else{
            f.return(results);
        }
    });
    return f.wait();
}


exports.delete = function(table_name,conditions) {
    var f = new Future;
    if(conditions === undefined){
        console.log(err);
        f.return(false);
    }
    db  .where(conditions)
        .delete(table_name, function(err, results){
        if(err){
            console.info(err);
            f.return(false); 
        }else{
            f.return(results);
        }
    });
    return f.wait();
}

exports.datatable = function(table_name,conditions,limit_count,limit_start,order_action) {
    var f = new Future;
    db  .where(conditions)
        .limit(limit_count, limit_start)
        .order_by(order_action)
        .get(table_name, function(err, results){
        if(err){
            console.info(err);
            f.return(false);
        }else{
            f.return(results);
        }
    });
    return f.wait();
}

exports.datatable_count = function(table_name,conditions,limit_count,limit_start,order_action) {
    var f = new Future;
    db  .where(conditions)
        .limit(limit_count, limit_start)
        .order_by(order_action)
        .count(table_name, function(err, results){
        if(err){
            console.info(err);
            f.return(false);
        }else{
            f.return(results);
        }
    });
    return f.wait();
}

exports.countAll = function(table_name) {
    var f = new Future;
    db.count(table_name, function(err, results){
        if(err){
            console.info(err);
            f.return(false);
        }else{
            f.return(results);
        }
    });
    return f.wait();
}



exports.insert = function(table_name, data){
    var f = new Future;
    db.insert(table_name, data, function(err, info){
        if(err){
            console.info(err);
            f.return(false); 
        }else{
        
            f.return(info);
        }
    });
    return f.wait();
}

exports.update = function(table_name, where, data){
    var f = new Future;
    db.where(where).update(table_name, data, function(err){
        if(err){
            console.info(err);
            f.return(false); 
        }else{
            f.return(true);
        }
    });
    return f.wait();
}

exports.get_where_in = function(table_name, field, conditions) {
    var f = new Future;
    db.where(field, conditions).get(table_name, function(err, rows, fields) {
        if (err) {
            console.log(err);
            f.return(false);
        } else {
            f.return(rows);
        }
    });
    return f.wait();
}





