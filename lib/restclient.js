var Future = require('fibers/future'),
	Rest = require('restler'),
	ApiUtil = require("./api_util");

var url = config.api_domain;


exports.post = function(params) {
	var public_key = 'ucloudtuhui@ucloud.cn11117919958915962116';
	var private_key = '3dad219fecca35d90ec36c1c0c3d759f'
	var params = ApiUtil.verfyAC(_.extend({}, params, {
		PublicKey: public_key
	}), private_key);
	var response = ApiUtil.request(API_PATH, params);
	return response;
}