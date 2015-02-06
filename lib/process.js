var sys = require('sys')
var exec = require('child_process').exec;

function puts(error, stdout, stderr) {
	sys.puts(stdout)
}

//直接调用命令
exports.Exec = function(cmd) {
	exec(cmd, puts);
}



