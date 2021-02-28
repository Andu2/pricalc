<script>
	import { lookupRows, UNLOCKED_UNITS } from "@src/data/priconnedb";
	import DopeAssTable from "@src/components/DopeAssTable.svelte";
	import Doughnut from "svelte-chartjs/src/Doughnut.svelte";

	let unlockedIds = UNLOCKED_UNITS.map(function(unitData) {
		return unitData.unit_id;
	})

	let profiles = lookupRows("unit_profile", {});
	// This actually changes the underlying data, but this is the only place that it is used so I say it's fine
	profiles.forEach(function(profile) {
		profile.birth_date = getMonth(profile.birth_month) + " " + profile.birth_day;
		profile.race = profile.race.slice(0, 1).toUpperCase() + profile.race.slice(1);

		var unitIdString = profile.unit_id + "";
		var unitIdWithRarity = unitIdString.slice(0, 4) + "3" + unitIdString.slice(-1); 
		var charImg = "images/unit/unit_icon_unit_" + unitIdWithRarity + ".png";

		profile.icon = "<img class=\"table-icon\" src=\"" + charImg + "\" />";
	});

	profiles = profiles.filter(function(profile) {
		return (unlockedIds.indexOf(profile.unit_id) > -1)
	}).sort(function(a, b) {
		if (a.unit_name > b.unit_name) return 1;
		else if (a.unit_name < b.unit_name) return -1;
		else return 0;
	});

	let columns = [{
		attr: "icon",
		displayName: "Icon",
		html: true,
		sort: null
	}, {
		attr: "unit_name",
		displayName: "Character",
		sort: "default"
	}, {
		attr: "age",
		displayName: "Age",
		sort: function(row1, row2) {
			let row1Numeric = row1.age * 1;
			let row2Numeric = row2.age * 1;
			if (row1Numeric < row2Numeric) return -1;
			else if (row1Numeric > row2Numeric) return 1;
			else return birthdaySort(row1, row2);
		}
	}, {
	// 	attr: "guild",
	// 	displayName: "Guild",
	// 	sort: "default"
	// }, {
		attr: "race",
		displayName: "Race",
		sort: "default"
	}, {
		attr: "height",
		displayName: "Height",
		sort: "numeric",
		displayValue: function(row) {
			return convertCmToFeetString(row.height);
		}
	}, {
		attr: "weight",
		displayName: "Weight",
		sort: "numeric",
		displayValue: function(row) {
			return convertKgToPoundsString(row.weight);
		}
	}, {
		attr: "birth_date",
		displayName: "Birthday",
		sort: birthdaySort
	}, {
		attr: "blood_type",
		displayName: "Blood Type",
		sort: "default"
	}, {
		attr: "catch_copy",
		displayName: "Description",
		sort: "default"
	}];

	function convertCmToFeetString(cm) {
		let inches = Math.round(cm / 2.54);
		let feet = Math.floor(inches / 12);
		let leftoverInches = inches - feet * 12;
		return Math.round(cm) + "cm (" + feet + "'" + leftoverInches + "\")";
	}

	function convertKgToPoundsString(kg) {
		return Math.round(kg) + "kg (" + Math.round(kg * 2.20462) + " pounds)";
	}

	function birthdaySort(row1, row2) {
		let sortVal1 = getBirthdaySortVal(row1);
		let sortVal2 = getBirthdaySortVal(row2);
		if (sortVal1 < sortVal2) return -1;
		else if (sortVal1 > sortVal2) return 1;
		else return 0;
	}

	function getBirthdaySortVal(row) {
		let sortVal = "";
		if (row.birth_month.length < 2) {
			sortVal += "0"
		}
		sortVal += row.birth_month;
		if (row.birth_day.length < 2) {
			sortVal += "0"
		}
		sortVal += row.birth_day;
		return sortVal;
	}

	function getMonth(monthNum) {
		let monthLookup = {
			1: "Jan",
			2: "Feb",
			3: "Mar",
			4: "Apr",
			5: "May",
			6: "Jun",
			7: "Jul",
			8: "Aug",
			9: "Sep",
			10: "Oct",
			11: "Nov",
			12: "Dec"
		}
		return monthLookup[monthNum] || "???";
	}

	function getAverage(data, attr) {
		let sum = 0;
		let validValues = 0;
		data.forEach(function(row) {
			let numericVal = row[attr] * 1;
			if (!isNaN(numericVal)) {
				sum += numericVal;
				validValues++;
			}
		});
		return sum / validValues;
	}

	function getCount(data, attr) {
		let counts = {};
		data.forEach(function(row) {
			if (counts[row[attr]] === undefined) {
				counts[row[attr]] = 0;
			}
			counts[row[attr]]++;
		});
		return counts;
	}

	let averageAge = getAverage(profiles, "age");
	let averageHeight = getAverage(profiles, "height");
	let averageWeight = getAverage(profiles, "weight");
	let raceCount = getCount(profiles, "race");
	let bloodCount = getCount(profiles, "blood_type");

	let colors = [
		"rgba(255, 50, 50, 0.5)", 
		"rgba(50, 255, 50, 0.5)",
		"rgba(50, 50, 255, 0.5)",
		"rgba(255, 255, 50, 0.5)"
	]

	let raceChartData = {
		datasets: [{
			data: [],
			backgroundColor: colors
		}],
		labels: []
	};
	for (var race in raceCount) {
		raceChartData.datasets[0].data.push(raceCount[race]);
		raceChartData.labels.push(race);
	}
	let raceChartOptions = {
		title: {
			display: true,
			text: "Race"
		}
	};

	let bloodChartData = {
		datasets: [{
			data: [],
			backgroundColor: colors
		}],
		labels: []
	};
	for (var blood in bloodCount) {
		bloodChartData.datasets[0].data.push(bloodCount[blood]);
		bloodChartData.labels.push(blood);
	}
	let bloodChartOptions = {
		title: {
			display: true,
			text: "Blood Type"
		}
	};
</script>

<div class="table-wrap">
	<DopeAssTable data={profiles} columns={columns} />
</div>
<h2>Statistics</h2>
<p>
	Average age: {Math.round(averageAge * 100) / 100} <br />
	Average height: {convertCmToFeetString(averageHeight)} <br />
	Average weight: {convertKgToPoundsString(averageWeight)}
</p>

<table class="charts"><tr>
	<td>
		<Doughnut data={raceChartData} options={raceChartOptions} />
	</td>
	<td>
		<Doughnut data={bloodChartData} options={bloodChartOptions} />
	</td>
</tr></table>

<style>
table.charts {
	table-layout: fixed;
	width: 80%;
}
</style>
