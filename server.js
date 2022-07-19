
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
app.get('/kids', function (req, res) {
    dbConn.query('SELECT * FROM kids', function (error, results, fields) {
        if (error) throw error;
        return res.send({ error: false, data: results, message: 'kids list.' });
    });
});


// Add a new user  
app.post('/createuser', function (req, res) {
    //parent info
    let email = req.body.parent.email;
    let password = req.body.parent.password;
    let referral_code = req.body.parent.referral_code;
    let referral = Math.floor(10000000 + Math.random() * 90000000);

    //kids info
    let nickname = req.body.kids.nickname;
    let gender = req.body.kids.gender;
    let age = req.body.kids.age;
    let grade = req.body.kids.grade;
    let kidsPassword = req.body.kids.kidsPassword;

    //checking of duplicate email and nickname
    dbConn.query('SELECT * FROM parent where email=?', email, function (error, results, fields) {
        if (error) throw error;
        if (results.length > 0) {
            res.status(409).send({ error: true, message: 'Your email is not available. Please provide a new one.' });
            return;
        } 
    });

    dbConn.query('SELECT * FROM kids where nickname=?', nickname, function (error, results, fields) {
        if (error) throw error;
        if (results.length > 0 && !res.headersSent) {
            res.status(409).send({ error: true, message: 'Your kids nickname is not available. Please provide a new one.' });
            return;
        }
    });

    //parent info
    dbConn.query("INSERT INTO parent SET ? ",
        {
            email: email,
            password: password,
            referral_code: referral_code,
            referral: referral
        }, 
        function (error, results, fields) {

        let parentId = results.insertId;
        
        //kids info
        if (error == null) {
            dbConn.query("INSERT INTO kids SET ? ",
            {
                parent_id: parentId,
                nickname: nickname,
                gender: gender,
                age: age,
                grade: grade,
                password: kidsPassword,
            },
            function (error, results, fields) {
                if (error) throw error;
        
                mail.sendEmail(email, referral);
        
                return res.send({ error: false, data: results, message: 'New user has been created successfully.' });
            });
        }
    });
});

// set port
app.listen(3000, function () {
    console.log('Relearn Node app is running on port 3000');
});

module.exports = app;