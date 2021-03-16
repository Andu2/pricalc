export function sortByAttr(attr, desc) {
	let direction = 1;
	if (desc) {
		direction = -1;
	}
	return function(a, b) {
		if (a[attr] > b[attr]) return 1 * direction;
		else if (a[attr] < b[attr]) return -1 * direction;
		else return 0;
	}
}