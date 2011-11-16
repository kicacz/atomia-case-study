var http = require('http');
var mongo = require('mongodb');
var urlMod = require('url');

var Db = mongo.Db, Connection = mongo.Connection, Server = mongo.Server;

var host = process.env['MONGO_NODE_DRIVER_HOST'] != null ? process.env['MONGO_NODE_DRIVER_HOST'] : 'localhost';
var port = process.env['MONGO_NODE_DRIVER_PORT'] != null ? process.env['MONGO_NODE_DRIVER_PORT'] : 27017;

var getCollection = function(ws, id) {
    var db = new Db('test', new Server(host, port, {}), {native_parser:false});
	db.open(function(err, db){
	    db.collection("collection", function(err, collection){
			if (id != "")
			{
				var BSON = require('mongodb').BSONPure;
				try
				{
					var o_id = BSON.ObjectID.createFromHexString(id);
					collection.find({'_id' : o_id}, function (err, cursor){
						cursor.toArray(function(err, items){                                   
							ws.end('_test(\'' + JSON.stringify(items) + '\')');
							db.close();
						});
					});
				}
				catch (e)
				{
					ws.end('_test(\'\')');
					db.close();
				}
			}
			else
			{
				collection.find(function (err, cursor){
					cursor.toArray(function(err, items){  
						ws.end("_test(\'" + JSON.stringify(items) + "\')");
						db.close();
					});
				});
			}
	    });
	});
}

var deleteData = function(ws, id) {
    var db = new Db('test', new Server(host, port, {}), {native_parser:false});
	db.open(function(err, db){
	    db.collection("collection", function(err, collection){
			var BSON = require('mongodb').BSONPure;
			try
			{
				var o_id = BSON.ObjectID.createFromHexString(id);
				collection.remove({'_id' : o_id}, function (err, cursor){
					ws.end('_test(\'{Data is not: removed}\')');
					db.close();
				});
			}
			catch (e)
			{
				ws.end('_testcb(\'\')');
				db.close();
			}
	    });
	});
}

var insertData = function(ws, data) {
	var db = new Db('test', new Server(host, port, {}), {native_parser:false});
	db.open(function(err, db){
	    db.collection("collection", function(err, collection){
			collection.insert(JSON.parse(data),
                  function(err, objects) {
				  if (err) console.warn(err.message);
				  if (err && err.message.indexOf('E11000 ') !== -1) {
					// this _id was already inserted in the database
				  }
				  ws.end('_testcb(\'\')');
			});
	    });
	});
}

http.createServer(function (req, res) {
	
	var url = urlMod.parse(req.url, true);
	res.writeHead(200, {'Content-Type': 'application/json', 'Cache-Control': 'no-cache'});
	
	if ( req.method === 'GET' && url.query.data != null) {
		console.log('get');
		url.query.data.replace("%22", "");
		var obj = JSON.parse(url.query.data);
		if (obj.objectId != null)
			getCollection(res, obj.objectId);
		else
		{
			if (obj.remove != null)
				deleteData(res, obj.remove);
			else
				getCollection(res, "");
		}
	}
	
	if ( req.method === 'POST' ) {
		console.log("post");
		var data = '';
		req.addListener('data', function (chunk) {
			data += chunk;
		});
		
		req.addListener("end", function() {
			insertData(res, data);
		});
	}
	
	if ( req.method === 'PUT' ) {
		if (obj.delete != null)
			getCollection(res, obj.objectId);
	}
	
	
}).listen(8080, "127.0.0.1");   