//backend script to run when the data changes
var dumpTables = require("./dump-table-list");

// Note: Originally used "sqlite-json", found that package had a bug. Discovered this package was more popular.
// var sqliteJson = require("sqlite-to-json");

const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');

// Copied the code from sqlite-to-json package and editing so I can pretty print my JSON
// const SqliteToJson = module.exports = function SqliteToJson(opts) {
const SqliteToJson = function SqliteToJson(opts) {
	opts = opts || {};
	if (!opts.client) {
		throw new Error('No sqlite3 client provided.');
	}
	this.client = opts.client;
};

SqliteToJson.prototype.tables = function (cb) {
	var query = "SELECT name FROM sqlite_master WHERE type='table'";
	this.client.all(query, function (err, tables) {
		if (err) {
			return cb(err);
		}
		cb(null, tables.map(function (result) {
			return result.name;
		}));
	});
};

SqliteToJson.prototype.save = function (table, dest, cb) {
	if (typeof cb !== 'function') {
		throw new Error('No callback specified.');
	}
	if (!dest) {
		return cb(new Error('No destination file specified.'));
	}
	this._dataFor(table, function (dataErr, tableData) {
		if (dataErr) {
			cb(dataErr);
		} else {
			fs.writeFileSync(dest, JSON.stringify(tableData, null, "\t"));
			cb(true);
		}
	});
};

SqliteToJson.prototype.all = function(cb) {
	var self = this;
	this.tables(function (err, tables) {
		if (err) return cb(err);
		var ret = {};
		function loop (i) {
			if (i === tables.length) cb(null, ret);
			else self._dataFor(tables[i], function (dataErr, tableData) {
				if (dataErr) cb(dataErr);
				else loop(i + 1, ret[tables[i]] = tableData);
			})
		}
		loop(0);
	})
};

SqliteToJson.prototype._dataFor = function (table, cb) {
	// apparently you can't used named params for table names?
	this.client.all('SELECT * FROM '+table, cb);
};

var sqliteJson = SqliteToJson;
var sqlite3 = require("sqlite3");

let servers = fs.readdirSync("./static/data");
servers.forEach(function(server) {
	let versions = fs.readdirSync("./static/data/" + server);
	versions.forEach(function(version) {
		console.log("Dumping JSON for " + server + " master db version " + version);
		var exporter = new sqliteJson({
			client: new sqlite3.Database("./static/data/" + server + "/" + version + "/master")
		});

		//dumpTables.forEach(function(table) {
		exporter.tables(function(error, tables) {
			tables.forEach(function(table) {
				let tablePath = "./static/data/" + server + "/" + version + "/" + table + ".json";
				console.log("writing " + tablePath)
				exporter.save(table, tablePath, function(){});
			});
		})
	})
});
