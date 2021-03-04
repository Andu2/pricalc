export function sortByAttr(attr) {
	return function(a, b) {
		if (a[attr] > b[attr]) return 1;
		else if (a[attr] < b[attr]) return -1;
		else return 0;
	}
}