var fibers = require("fibers");
GLOBAL.config = require("../config/config.json")['production'];
var mysql = require('../lib/mysql');

//获取文件后缀
exports.extension = function(filename) {
	var i = filename.lastIndexOf('.');
	return (i < 0) ? '' : filename.substr(i);
}

//判断是否在数组中
exports.inArray = function in_array(stringToSearch, arrayToSearch) {
	for (s = 0; s < arrayToSearch.length; s++) {
		thisEntry = arrayToSearch[s].toString();
		if (thisEntry == stringToSearch) {
			return true;
		}
	}
	return false;
}

//人民币格式化
exports.money_format = function money_format(pay_amount) {
	return Math.abs(pay_amount).toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
}

//人民币大小写转换
exports.upDigit = function upDigit(n) {
	var fraction = ['角', '分'];
	var digit = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'];
	var unit = [
		['元', '万', '亿'],
		['', '拾', '佰', '仟']
	];
	var head = n < 0 ? '欠' : '';
	n = Math.abs(n);

	var s = '';

	for (var i = 0; i < fraction.length; i++) {
		s += (digit[Math.floor(n * 10 * Math.pow(10, i)) % 10] + fraction[i]).replace(/零./, '');
	}
	s = s || '整';
	n = Math.floor(n);

	for (var i = 0; i < unit[0].length && n > 0; i++) {
		var p = '';
		for (var j = 0; j < unit[1].length && n > 0; j++) {
			p = digit[n % 10] + unit[1][j] + p;
			n = Math.floor(n / 10);
		}
		s = p.replace(/(零.)*零$/, '').replace(/^$/, '零') + unit[0][i] + s;
	}
	return head + s.replace(/(零.)*零元/, '元').replace(/(零.)+/g, '零').replace(/^整$/, '零元整');
}

//记录操作日志
exports.log_user_action = function(userlog) {

	fibers(function() {
		var today = new Date();
		var date = today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
		var time = today.toLocaleTimeString();

		var data = {
			"action_user": userlog.username,
			"action_time": date + " " + time,
			"action_info": userlog.loginfo
		};

		var result = local_mysql.insert('user_action_log', data);

	}).run();
}

//获取数组中重复的值的Count
exports.compressArray = function compressArray(original) {

	var compressed = [];
	// make a copy of the input array
	var copy = original.slice(0);

	// first loop goes over every element
	for (var i = 0; i < original.length; i++) {

		var myCount = 0;
		// loop over every element in the copy and see if it's the same
		for (var w = 0; w < copy.length; w++) {
			if (original[i] == copy[w]) {
				// increase amount of times duplicate is found
				myCount++;
				// sets item to undefined
				delete copy[w];
			}
		}

		if (myCount > 0) {
			var a = new Object();
			a.date = original[i];
			a.value = myCount;
			compressed.push(a);
		}
	}

	return compressed;
};

//获取今天0点的unix时间戳
exports.todaystart = function() {
	var now = new Date();
	var startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	var timestamp = startOfDay / 1000;
	return timestamp;
}

//获取当前时间
exports.now = function(format) {
	var today = new Date();
	var date = today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
	var time = today.toLocaleTimeString();
	if (format === "date") {
		return date;
	}
	if (format === "time") {
		return time;
	}
}

//获取当前unix时间戳
exports.nowstamps = function() {
	return Math.round(new Date().getTime() / 1000);
}


//格式化显示unix时间戳
/**
 * @param  {string} format    格式
 * @param  {int}    timestamp 要格式化的时间 默认为当前时间
 * @return {string}           格式化的时间字符串
 */
exports.data = function(format, timestamp) {
	var a, jsdate = ((timestamp) ? new Date(timestamp * 1000) : new Date());
	var pad = function(n, c) {
		if ((n = n + "").length < c) {
			return new Array(++c - n.length).join("0") + n;
		} else {
			return n;
		}
	};
	var txt_weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
	var txt_ordin = {
		1: "st",
		2: "nd",
		3: "rd",
		21: "st",
		22: "nd",
		23: "rd",
		31: "st"
	};
	var txt_months = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
	var f = {
		// Day
		d: function() {
			return pad(f.j(), 2)
		},
		D: function() {
			return f.l().substr(0, 3)
		},
		j: function() {
			return jsdate.getDate()
		},
		l: function() {
			return txt_weekdays[f.w()]
		},
		N: function() {
			return f.w() + 1
		},
		S: function() {
			return txt_ordin[f.j()] ? txt_ordin[f.j()] : 'th'
		},
		w: function() {
			return jsdate.getDay()
		},
		z: function() {
			return (jsdate - new Date(jsdate.getFullYear() + "/1/1")) / 864e5 >> 0
		},

		// Week
		W: function() {
			var a = f.z(),
				b = 364 + f.L() - a;
			var nd2, nd = (new Date(jsdate.getFullYear() + "/1/1").getDay() || 7) - 1;
			if (b <= 2 && ((jsdate.getDay() || 7) - 1) <= 2 - b) {
				return 1;
			} else {
				if (a <= 2 && nd >= 4 && a >= (6 - nd)) {
					nd2 = new Date(jsdate.getFullYear() - 1 + "/12/31");
					return date("W", Math.round(nd2.getTime() / 1000));
				} else {
					return (1 + (nd <= 3 ? ((a + nd) / 7) : (a - (7 - nd)) / 7) >> 0);
				}
			}
		},

		// Month
		F: function() {
			return txt_months[f.n()]
		},
		m: function() {
			return pad(f.n(), 2)
		},
		M: function() {
			return f.F().substr(0, 3)
		},
		n: function() {
			return jsdate.getMonth() + 1
		},
		t: function() {
			var n;
			if ((n = jsdate.getMonth() + 1) == 2) {
				return 28 + f.L();
			} else {
				if (n & 1 && n < 8 || !(n & 1) && n > 7) {
					return 31;
				} else {
					return 30;
				}
			}
		},

		// Year
		L: function() {
			var y = f.Y();
			return (!(y & 3) && (y % 1e2 || !(y % 4e2))) ? 1 : 0
		},
		//o not supported yet
		Y: function() {
			return jsdate.getFullYear()
		},
		y: function() {
			return (jsdate.getFullYear() + "").slice(2)
		},

		// Time
		a: function() {
			return jsdate.getHours() > 11 ? "pm" : "am"
		},
		A: function() {
			return f.a().toUpperCase()
		},
		B: function() {
			// peter paul koch:
			var off = (jsdate.getTimezoneOffset() + 60) * 60;
			var theSeconds = (jsdate.getHours() * 3600) + (jsdate.getMinutes() * 60) + jsdate.getSeconds() + off;
			var beat = Math.floor(theSeconds / 86.4);
			if (beat > 1000) beat -= 1000;
			if (beat < 0) beat += 1000;
			if ((String(beat)).length == 1) beat = "00" + beat;
			if ((String(beat)).length == 2) beat = "0" + beat;
			return beat;
		},
		g: function() {
			return jsdate.getHours() % 12 || 12
		},
		G: function() {
			return jsdate.getHours()
		},
		h: function() {
			return pad(f.g(), 2)
		},
		H: function() {
			return pad(jsdate.getHours(), 2)
		},
		i: function() {
			return pad(jsdate.getMinutes(), 2)
		},
		s: function() {
			return pad(jsdate.getSeconds(), 2)
		},
		//u not supported yet

		// Timezone
		//e not supported yet
		//I not supported yet
		O: function() {
			var t = pad(Math.abs(jsdate.getTimezoneOffset() / 60 * 100), 4);
			if (jsdate.getTimezoneOffset() > 0) t = "-" + t;
			else t = "+" + t;
			return t;
		},
		P: function() {
			var O = f.O();
			return (O.substr(0, 3) + ":" + O.substr(3, 2))
		},
		//T not supported yet
		//Z not supported yet

		// Full Date/Time
		c: function() {
			return f.Y() + "-" + f.m() + "-" + f.d() + "T" + f.h() + ":" + f.i() + ":" + f.s() + f.P()
		},
		//r not supported yet
		U: function() {
			return Math.round(jsdate.getTime() / 1000)
		}
	};

	return format.replace(/[\\]?([a-zA-Z])/g, function(t, s) {
		if (t != s) {
			// escaped
			ret = s;
		} else if (f[s]) {
			// a date function exists
			ret = f[s]();
		} else {
			// nothing special
			ret = s;
		}
		return ret;
	});
}

exports.succeed = function(message,url) {
	return {
		response: 'success',
		msg: message,
		url:url
	}
}

exports.error = function(message) {
	return {
		response: 'error',
		msg: message,
	}
}