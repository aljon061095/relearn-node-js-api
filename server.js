var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mysql = require('mysql');

//sending email
function sendEmail (email, referral_code) {
    var nodemailer = require('nodemailer');
    
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

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

// Add headers before the routes are defined
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});


// default route
app.get('/', function (req, res) {
    return res.send({ error: true, message: 'hello' })
});

// connection configurations
var dbConn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'test'
});

// connect to database
dbConn.connect();

// Retrieve all users 
app.get('/users', function (req, res) {
    dbConn.query('SELECT * FROM users', function (error, results, fields) {
        if (error) throw error;
        return res.send({ error: false, data: results, message: 'users list.' });
    });
});

// Retrieve user with id 
app.get('/user/:id', function (req, res) {

    let user_id = req.params.id;

    if (!user_id) {
        return res.status(400).send({ error: true, message: 'Please provide user_id' });
    }

    dbConn.query('SELECT * FROM users where id=?', user_id, function (error, results, fields) {
        if (error) throw error;
        return res.send({ error: false, data: results[0], message: 'users list.' });
    });

});


// Add a new user  
app.post('/adduser', function (req, res) {

    //let user = req.body.user;
    let nickname = req.body.nickname;
    let email = req.body.email;
    let age = req.body.age;
    let gender = req.body.gender;
    let grade = req.body.grade;
    let referral_code = req.body.referral_code;
    let password = req.body.password;

    dbConn.query("INSERT INTO users SET ? ",
        {
            nickname: nickname,
            email: email,
            age: age,
            gender: gender,
            grade: grade,
            referral_code: referral_code,
            password: password
        }
        , function (error, results, fields) {
            if (error) throw error;

           sendEmail(email, referral_code);

            return res.send({ error: false, data: results, message: 'New user has been created successfully.' });
        });
});


//  Update user with id
app.put('/updateuser', function (req, res) {

    let user_id = req.body.user_id;
    let user = req.body.user;

    if (!user_id || !user) {
        return res.status(400).send({ error: user, message: 'Please provide user and user_id' });
    }

    dbConn.query("UPDATE users SET user = ? WHERE id = ?", [user, user_id], function (error, results, fields) {
        if (error) throw error;
        return res.send({ error: false, data: results, message: 'user has been updated successfully.' });
    });
});


//  Delete user
app.delete('/user', function (req, res) {

    let user_id = req.body.user_id;

    if (!user_id) {
        return res.status(400).send({ error: true, message: 'Please provide user_id' });
    }
    dbConn.query('DELETE FROM users WHERE id = ?', [user_id], function (error, results, fields) {
        if (error) throw error;
        return res.send({ error: false, data: results, message: 'User has been updated successfully.' });
    });
});

// set port
app.listen(3000, function () {
    console.log('Relearn Node app is running on port 3000');
});



module.exports = app;