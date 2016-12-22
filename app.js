'use strict'

var mysql = require('mysql');
var express = require('express');
var bodyParser = require('body-parser');
var moment = require('moment');

var app = express();
var connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '4Brothers',
    database: 'twitter'
});

connection.connect(function(err) {
    if(err) {
	console.log(err);
	return err;
    }
    console.log('Connected to the database.');
    app.listen(8080, function() {
	console.log("Web server is listening on port 8080");
    });
});

app.set('view engine', 'ejs');
app.set('views', './views');

// Specifying where .css files will be
app.use(express.static('./public'));
app.use(bodyParser.urlencoded({ extended: true }));

// Home 
app.get('/', function(req, res) {
    var query = 'SELECT * FROM Tweets ORDER BY created_at DESC';

    connection.query(query, function(err, results) {
	if(err) {
	    console.log(err)
	}

	for(var i =0; i < results.length; i++) {
	    var tweet = results[i];
	    results[i].time_from_now = moment(tweet.created_at).fromNow();
	}

	res.render('tweets', { tweets: results } );
    });
});

// Creating a Tweet
app.post('/tweets/create', function(req, res) {
    var query = 'INSERT INTO Tweets(handle, body) VALUES(?, ?)';
    var handle = req.body.handle;
    var body = req.body.body;

    connection.query(query, [handle, body], function(err) {
	if(err) {
	    console.log(err);
	}
    res.redirect('/');
    });
});

