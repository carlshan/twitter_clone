'use strict'

var mysql = require('mysql');
var express = require('express');
var bodyParser = require('body-parser');
var moment = require('moment');

var app = express();
var connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',
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

// Creating a Tweet and inserting it into the mysql database.
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

// Allowing the editing of Tweets
app.get('/tweets/:id([0-9]+)/edit', function(req, res) {
    var query = 'SELECT * from Tweets WHERE id = ?';
    var tweet_id = req.params.id;

    connection.query(query, [tweet_id], function(err, results) {
	if(err || results.length === 0) {
	    console.log(err || 'No Tweets found!');
	    res.redirect('/');
	    return;
	}

	var tweet = results[0]
	tweet.time_from_now = moment(tweet.created_at).fromNow();

	res.render('edit-tweet', { tweet: tweet });
    }); 
});

// Updating the database with the edited Tweet
app.post('/tweets/:id([0-9]+)/update', function(req, res) {
    var updateQuery = 'UPDATE Tweets SET body = ?, handle = ? WHERE id = ?';
    var deleteQuery = 'DELETE FROM Tweets WHERE id = ?';
    var tweet_id = req.params.id;
    var body = req.body.body;
    var handle = req.body.handle;
    var isDelete = req.body.delete_button !== undefined;
    var queryCallback = function(err) {
	if(err){
	    console.log(err);
	}
	res.redirect('/');
    };

    if(isDelete) {
	connection.query(deleteQuery, [tweet_id], queryCallback);
    } else {
	connection.query(updateQuery, [body, handle, tweet_id], queryCallback);
    }
});
