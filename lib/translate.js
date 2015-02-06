//去空
exports.nonone_display = function(code) {
	if(code === ''){
		return ""
	}else{
		return code;
	}
}

//翻译行业代码显示
exports.industry_display = function(code) {
	var industry_type = ({
		"1000": "电子商务",
		"2000": "手游",
		"3000": "页游",
		"4000": "数据分析",
		"5000": "移动APP",
		"6000": "网站",
		"7000": "SAAS",
		"8000": "端游",
		"9000": "工具软件",
		"10000": "教育培训",
		"11000": "金融服务",
		"12000": "生活娱乐",
		"13000": "智能硬件",
		"14000": "旅游户外",
		"15000": "广告营销",
		"16000": "媒体资讯",
		"17000": "社交网络",
		"18000": "传统行业"
	});

	if (industry_type.hasOwnProperty(code)) {
		return industry_type[code];
	}else{
		return '未归类'
	}
}

//客户级别显示
exports.level_display = function(code) {
	var level = ({
		"1": "大客户",
		"0": "普通客户",
	});
	if (level.hasOwnProperty(code)) {
		return level[code];
	}else{
		return '未定义'
	}
}


//是否邮件激活
exports.activate_display = function(code) {
	var activate = ({
		"0": "未激活",
		"1": "已激活",
	});
	if (activate.hasOwnProperty(code)) {
		return activate[code];
	}else{
		return '未定义'
	}
}

 //是否手机激活
exports.phone_active_display = function(code) {
	var activate = ({
		"0": "未激活",
		"1": "已激活",
	});
	if (activate.hasOwnProperty(code)) {
		return activate[code];
	}else{
		return '未定义'
	}
}
    
//个人企业类型显示
exports.type_display = function(code) {
	var type = ({
		"1": "个人",
		"0": "企业",
	});

	if (type.hasOwnProperty(code)) {
		return type[code];
	}else{
		return '未定义'
	}
}

//审核状态显示
exports.audited_display = function(code) {
	var audited = ({
		"1": "通过审核",
		"0": "未审核",
		"2": "已拒绝",
	});

	if (audited.hasOwnProperty(code)) {
		return audited[code];
	}else{
		return '未定义'
	}
}