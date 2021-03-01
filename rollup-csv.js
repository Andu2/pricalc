// Custom rollup plugin to push CSV -> JSON parsing load from file size to runtime
// The whole reason I switched to CSV was to reduce file size, the rollup dsv plugin just converts to JSON which defeats the purpose
// Code modified from rollup-dsv plugin: https://github.com/rollup/plugins/blob/master/packages/dsv/src/index.js

import { extname } from 'path';
import { createFilter } from '@rollup/pluginutils';
import toSource from 'tosource';
import { csvParseRows, autoType } from 'd3-dsv';

function rowsToObjects(csvRows) {
	let headers = csvRows[0];
	let returnObjects = [];
	for (var i = 1; i < csvRows.length; i++) {
		let rowObject = {};
		headers.forEach(function(header, j) {
			rowObject[header] = csvRows[i][j];
		});
		returnObjects.push(rowObject);
	}
	return returnObjects;
}

export default function dsv(options = {}) {
	const filter = createFilter(options.include, options.exclude);

	return {
		name: 'rollup-csv',

		transform(code, id) {
			if (!filter(id)) return null;

			const ext = extname(id);
			if (ext !== ".csv") return null;

			let rows = csvParseRows(code, autoType);

			let newCode = "const csvData = " + toSource(rows) + ";\n";
			newCode += "const rowsToObjects = " + toSource(rowsToObjects) + ";\n";
			newCode += "export default rowsToObjects(csvData);\n"

			return {
				code: newCode,
				map: { mappings: '' }
			};
		}
	};
}