
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mysql = require('mysql');
var mail = require("./mail");
var path = require('path');
const { exit } = require('process');

const jwt = require('jsonwebtoken');
require('dotenv').config();
const fsPromises = require('fs').promises;

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
    res.sendFile(path.join(__dirname + '/index.html'));
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

// Retrieve all kids 
app.get('/kids', function (req, res) {
    dbConn.query('SELECT * FROM kids', function (error, results, fields) {
        if (error) throw error;
        return res.send({ error: false, data: results, message: 'kids list.' });
    });
});

// Add a new kid  
app.post('/addkid', function (req, res) {
    //kids info
    let kidsName = req.body.kidsName;
    let nickname = req.body.nickname;
    let gender = req.body.gender;
    let birthdate = req.body.kids.birthdate;
    let age = req.body.age;
    let grade = req.body.grade;
    let password = req.body.password;

    //checking of duplicate email and nickname
    dbConn.query('SELECT * FROM kids where nickname=?', nickname,
        function (error, results, fields) {
            if (error) throw error;
            if (results.length > 0 && !res.headersSent) {
                res.status(409).send({ error: true, message: 'Your kids nickname is not available. Please provide a new one.' });
                return;
            } else {
                //to be set once login is done
                let parentId = 1;

                //kids info
                dbConn.query("INSERT INTO kids SET ? ",
                    {
                        parent_id: parentId,
                        kids_name: kidsName,
                        nickname: nickname,
                        gender: gender,
                        birthdate: birthdate,
                        age: age,
                        grade: grade,
                        password: password,
                    },
                    function (error, results, fields) {
                        if (error) throw error;
                        return res.send({ error: false, data: results, message: 'New kid has been created successfully.' });
                    });
            }
        });


});

//parent login 
app.post('/parentlogin', function (req, res) {
    let email = req.body.email;
    let password = req.body.password;

    //checking if user exist via login
    dbConn.query(`SELECT * FROM parent WHERE email="${email}" AND password="${password}";`,
        function (error, results, fields) {
            if (error) throw error;

            console.log(results);
            if (results.length > 0) {
                // create JWTs
                const accessToken = jwt.sign(
                    { "email": email },
                    process.env.ACCESS_TOKEN_SECRET,
                    { expiresIn: '30s' }
                );
                const refreshToken = jwt.sign(
                    { "email": email },
                    process.env.REFRESH_TOKEN_SECRET,
                    { expiresIn: '1d' }
                );

                res.cookie('jwt', refreshToken, { httpOnly: true, sameSite: 'None', secure: true, maxAge: 24 * 60 * 60 * 1000 });
                // res.json({ accessToken });
                return res.send({ error: false, userData: results[0], accessToken: accessToken, message: 'Successfully login.' });
            }

            res.status(409).send({ error: true, message: 'Invalid username and password!' });
        });
});

//kids login
app.post('/kidslogin', function (req, res) {
    let nickname = req.body.nickname;
    let password = req.body.password;

    //checking if user exist via login
    dbConn.query(`SELECT * FROM kids WHERE nickname="${nickname}" AND password="${password}";`,
        function (error, results, fields) {
            if (error) throw error;

            console.log(results);
            if (results.length > 0) {
                // create JWTs
                const accessToken = jwt.sign(
                    { "nickname": nickname },
                    process.env.ACCESS_TOKEN_SECRET,
                    { expiresIn: '30s' }
                );
                const refreshToken = jwt.sign(
                    { "nickname": nickname },
                    process.env.REFRESH_TOKEN_SECRET,
                    { expiresIn: '1d' }
                );

                res.cookie('jwt', refreshToken, { httpOnly: true, sameSite: 'None', secure: true, maxAge: 24 * 60 * 60 * 1000 });
                // res.json({ accessToken });
                return res.send({ error: false, userData: results[0], accessToken: accessToken, message: 'Successfully login.' });
                //return res.send({ error: false, data: results[0], message: 'Successfully login.' });
            }

            res.status(409).send({ error: true, message: 'Invalid username and password!' });
        });
});

// Add a new user  
app.post('/createuser', function (req, res) {
    //parent info
    let name = req.body.parent.name;
    let email = req.body.parent.email;
    let password = req.body.parent.password;
    let referral_code = req.body.parent.referral_code;
    let referral = Math.floor(10000000 + Math.random() * 90000000);

    //kids info
    let kidsName = req.body.kids.kidsName;
    let nickname = req.body.kids.nickname;
    let gender = req.body.kids.gender;
    let birthdate = req.body.kids.birthdate;
    let age = req.body.kids.age;
    let grade = req.body.kids.grade;
    let kidsPassword = req.body.kids.kidsPassword;

    //checking of duplicate email and nickname
    dbConn.query('SELECT * FROM parent where email=?', email,
        function (error, results) {
            if (error) throw error;
            if (results.length > 0) {
                return res.status(409).send({ error: true, message: 'Your email is not available. Please provide a new one.' });
            } else {
                dbConn.query('SELECT * FROM kids where nickname=?', nickname,
                    function (error, results, fields) {
                        if (error) throw error;
                        if (results.length > 0 && !res.headersSent) {
                            return res.status(409).send({ error: true, message: 'Your kids nickname is not available. Please provide a new one.' });
                        } else {
                            console.log("success");
                            //parent info
                            dbConn.query("INSERT INTO parent SET ? ",
                                {
                                    name: name,
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
                                                kids_name: kidsName,
                                                nickname: nickname,
                                                gender: gender,
                                                birthdate: birthdate,
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
                        }
                    });
            }
        });

});

// Retrieve all schools 
app.get('/schools', function (req, res) {
    dbConn.query('SELECT * FROM schools', function (error, results, fields) {
        if (error) throw error;
        return res.send({ error: false, data: results, message: 'schools list.' });
    });
});

// set port
app.listen(3000, function () {
    console.log('Relearn Node app is running on port 3000');
});

module.exports = app;