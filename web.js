var express = require("express");
var mysql = require('mysql');
var app = express();
app.use(express.logger());

var db_config = {
    host: 'remotemysql.com',
    user: '4pDgcFhLfr',
    password: '15FdGZppny',
    database: '4pDgcFhLfr'
};

var connection;

function handleDisconnect() {
    console.log('1. connecting to db:');
    connection = mysql.createConnection(db_config); // Recreate the connection, since
													// the old one cannot be reused.

    connection.connect(function(err) {              	// The server is either down
        if (err) {                                     // or restarting (takes a while sometimes).
            console.log('2. error when connecting to db:', err);
            setTimeout(handleDisconnect, 1000); // We introduce a delay before attempting to reconnect,
        }                                     	// to avoid a hot loop, and to allow our node script to
    });                                     	// process asynchronous requests in the meantime.
    											// If you're also serving http, display a 503 error.
    connection.on('error', function(err) {
        console.log('3. db error', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') { 	// Connection to the MySQL server is usually
            handleDisconnect();                      	// lost due to either server restart, or a
        } else {                                      	// connnection idle timeout (the wait_timeout
            throw err;                                  // server variable configures this)
        }
    });
}

handleDisconnect();

app.get('/', function(request, response) {
    connection.query('SELECT * from tutorials_tbl', function(err, rows, fields) {
        if (err) {
            console.log('error: ', err);
            throw err;
        }
        response.json({"success" : 1,
		       "data" : rows
		       });
    });
});

app.get('/data', function(request, response) {
    let Auth_Key = req.query.Auth_Key;
    let Table_Name = req.query.Table_Name;
    response.json({"success" : 1,
		       "Auth_Key" : Auth_Key,
		       "Table_Name": Table_Name
		       });
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
    console.log("Listening on " + port);
});
