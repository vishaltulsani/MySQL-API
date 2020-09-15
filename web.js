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
    var auth_token = request.param('auth_token');
    var table_name = request.param('table_name');
    if(auth_token === 'd821906933427295856ef9ed170e385c'){
    connection.query('SELECT * from ' + table_name, function(err, rows, fields) {
        if (err) {
	    response.json({"success" : 0,
		       "Message" : err.message
		       });
            throw err;
        }
        response.json({"success" : 1,
		       "data" : rows
		       });
    });
    }
	else{
		response.json({"success" : 0,
		       "Message" : "Please enter the correct API Auth-token in parameters."
		       });
	}
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
    console.log("Listening on " + port);
});
