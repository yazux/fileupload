var mongoose = require('mongoose');
mongoose.connect(
	'mongodb://yazu:Bb103ecc@yazucluster-shard-00-00-emzkb.mongodb.net:27017,yazucluster-shard-00-01-emzkb.mongodb.net:27017,yazucluster-shard-00-02-emzkb.mongodb.net:27017/test?ssl=true&replicaSet=YazuCluster-shard-0&authSource=admin',
	{ useMongoClient: true, promiseLibrary: global.Promise }
);

var db;

exports.init = function init() {
	db = mongoose.connection;
	db.on('error', function(error) {
		console.log('DB connection error: ' + error);
	});
	db.once('open', function() {
	  console.log('DB connection success open');
	});
}


//var fileSchema = mongoose.Schema({});