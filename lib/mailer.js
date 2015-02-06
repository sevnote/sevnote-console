var nodemailer = require("nodemailer");
var transporter = nodemailer.createTransport({
    service: 'QQex',
    auth: {
        user: 'noreply@sevnote.com',
        pass: 'tu75fed3'
    }
});
module.exports = transporter;

