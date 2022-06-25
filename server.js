
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mysql = require('mysql');
var mail = require("./mail");
var path = require('path');

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
    // return res.send({ error: true, message: 'hello' })
    res.sendFile(path.join(__dirname+'/index.html'));
});

// connection configurations
var dbConn = mysql.createConnection({
    host: '13.213.60.83',
    user: 'relearnadmin',
    password: 'gofleet0088',
    database: 'userinfo'
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
    let referral = Math.floor(10000000 + Math.random() * 90000000);
    let password = req.body.password;

    dbConn.query("INSERT INTO users SET ? ",
        {
            nickname: nickname,
            email: email,
            age: age,
            gender: gender,
            grade: grade,
            referral_code: referral_code,
            referral: referral,
            password: password
        }
        , function (error, results, fields) {
            if (error) throw error;

        //    sendEmail(email, referral_code);
        mail.sendEmail(email, referral);

            return res.send({ error: false, data: results, message: 'New user has been created successfully.' });
        });
});


//  Update user with id
app.put('/updateuser', function (req, res) {

    let user_id = req.body.user_id;
    let nickname = req.body.nickname;
    let email = req.body.email;
    let age = req.body.age;
    let gender = req.body.gender;
    let grade = req.body.grade;
    let referral_code = req.body.referral_code;
    let password = req.body.password;
    // let user = req.body.user;

    if (!user_id) {
        return res.status(400).send({ error: user, message: 'Please provide user_id' });
    }

    dbConn.query("UPDATE users SET nickname = ?, email = ?, age = ?, gender = ?, grade = ?, referral_code = ?, password = ? WHERE id = ?", 
            [nickname, email, age, gender, grade, referral_code, password, user_id],
             function (error, results, fields) {
        if (error) throw error;
        return res.send({ error: false, data: results, message: 'user has been updated successfully.' });
    });
});


//  Delete user
app.delete('/deleteuser', function (req, res) {

    let user_id = req.body.user_id;

    if (!user_id) {
        return res.status(400).send({ error: true, message: 'Please provide user_id' });
    }
    dbConn.query('DELETE FROM users WHERE id = ?', [user_id], function (error, results, fields) {
        if (error) throw error;
        return res.send({ error: false, data: results, message: 'User has been deleted successfully.' });
    });
});

// set port
app.listen(3000, function () {
    console.log('Relearn Node app is running on port 3000');
});



module.exports = app;