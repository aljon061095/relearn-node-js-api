var nodemailer = require('nodemailer');

module.exports = {
    sendEmail: function(email, referral_code) {
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'aquiambao061095@gmail.com',
                pass: 'jmrttbcrjqoohjqh'
            }
        });
    
        var mailOptions = {
            from: 'aquiambao061095@gmail.com',
            to: email,
            subject: 'Welcome onBoarding ReLearn',
            html: '<div style="border: 2px solid blue; border-radius: 5px;width: 50%; text-align: center;"><h2>Welcome onBoarding ReLearn!</h2><p>Join our referral program kindly share your referral code to others!</p><h3><b>ST' +  referral_code + '</b></h3></div>'
        };
    
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });
    }
};