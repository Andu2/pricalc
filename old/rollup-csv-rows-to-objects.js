export default function rowsToObjects(csvRows) {
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
