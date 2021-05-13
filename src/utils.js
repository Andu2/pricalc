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

export function commaNumber(number) {
	let stringNumber = number + "";
	let commaSegments = [];
	do {
		commaSegments.unshift(stringNumber.slice(-3));
		stringNumber = stringNumber.slice(0, -3);
	} while (stringNumber.length > 0);
	return commaSegments.join(",");
}

export function shortNumber(number) {
	let abbrevs = ["", "k", "M", "G"];
	let shortenedNumber = number;
	let index = 0;
	while (shortenedNumber >= 1000 && index < abbrevs.length - 1) {
		shortenedNumber /= 1000;
		index++;
	}
	// We're rounding to three decimals; 
	// if the abbreviation is k, it doesn't make any sense to abbreviate unless there are no decimals
	if (index === 1 && Math.round(shortenedNumber) !== shortenedNumber) {
		return number + "";
	}
	return (Math.round(shortenedNumber * 1000) / 1000) + abbrevs[index];
}

export function round(number, decimalPlaces) {
	let multFactor = Math.pow(10, decimalPlaces);
	return Math.round(number * multFactor) / multFactor;
}

export function escAttr(attrValue) {
	return attrValue.replace(/'/g, "&#x27;").replace(/"/g, "&#x22;")
}