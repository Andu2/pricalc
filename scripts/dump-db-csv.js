// CSV import should be smaller since we don't have to store header data in every row
// TODO: fix line breaks

const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');

var dumpTables = require("./dump-table-list");

var sqlite3 = require("sqlite3");
var client = new sqlite3.Database("./src/data/master.db")

client.all("SELECT name FROM sqlite_master WHERE type='table'", function (err, result) {
	result.forEach(function(row) {
		if (dumpTables.indexOf(row.name) > -1) {
			client.all("SELECT * FROM " + row.name, function(err, result) {
				if (result.length > 0) {
					var filePath = "./src/data/tables/" + row.name + ".csv"
					var headers = Object.keys(result[0]);
					var fileData = headers.join(",") + "\n";
					result.forEach(function(row) {
						var nextRow = [];
						headers.forEach(function(header) {
							let dataVal = row[header] + "";
							nextRow.push("\"" + dataVal.replace(/"/g, "\"\"") + "\"");
						});
						fileData += nextRow.join(",") + "\n";
					});
					fs.writeFile(filePath, fileData, function (writeErr) {
						if (writeErr) console.error(writeErr);
					})
				}
			});
		}
	});
});

// dumpTables.forEach(function(table) {
// 	exporter.save(table, "./src/data/" + table + ".json", function(){});
// });