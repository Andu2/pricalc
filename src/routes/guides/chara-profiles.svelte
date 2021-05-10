<script>
	import { lookupRows, getTable } from "@src/data/priconnedb";
	import { getUnlockedUnits } from "@src/logic/unit";
	import { getUnitImg } from "@src/logic/ui";
	import DopeAssTable from "@src/components/DopeAssTable.svelte";
	import Doughnut from "svelte-chartjs/src/Doughnut.svelte";
	import DataComponent from "@src/components/DataComponent.svelte";

	const requiredTables = [ "unit_data", "unit_profile" ];

	let profileData = [];

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
			else return birthdaySort(row2, row1);
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
		if (row.birth_month < 10) {
			sortVal += "0"
		}
		sortVal += row.birth_month;
		if (row.birth_day < 10) {
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

	let averageAge = 1;
	let averageHeight = 1;
	let averageWeight = 1;
	let raceCount = {};
	let bloodCount = {};

	let colors = [
		"rgba(255, 50, 50, 0.5)", 
		"rgba(50, 210, 210, 0.5)",
		"rgba(50, 50, 255, 0.5)",
		"rgba(210, 50, 255, 0.5)"
	]

	let raceChartData = {
		datasets: [{
			data: [],
			backgroundColor: colors
		}],
		labels: []
	};
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
	let bloodChartOptions = {
		title: {
			display: true,
			text: "Blood Type"
		}
	};

	function onDataReady() {
		let unlockedIds = getUnlockedUnits().map(function(unitData) {
			return unitData.unit_id;
		});

		let profiles = getTable("unit_profile");
		profileData = profiles.map(function(profile) {
			let profileCopy = {...profile};
			profileCopy.birth_date = getMonth(profileCopy.birth_month) + " " + profileCopy.birth_day;
			profileCopy.race = profileCopy.race.slice(0, 1).toUpperCase() + profileCopy.race.slice(1);
			profileCopy.icon = "<img class=\"table-icon\" src=\"" + getUnitImg(profileCopy.unit_id) + "\" />";
			return profileCopy;
		});

		profileData = profileData.filter(function(profile) {
			return (unlockedIds.indexOf(profile.unit_id) > -1)
		}).sort(function(a, b) {
			if (a.unit_name > b.unit_name) return 1;
			else if (a.unit_name < b.unit_name) return -1;
			else return 0;
		});

		averageAge = getAverage(profileData, "age");
		averageHeight = getAverage(profileData, "height");
		averageWeight = getAverage(profileData, "weight");
		raceCount = getCount(profileData, "race");
		bloodCount = getCount(profileData, "blood_type");

		for (var race in raceCount) {
			raceChartData.datasets[0].data.push(raceCount[race]);
			raceChartData.labels.push(race);
		}
		for (var blood in bloodCount) {
			bloodChartData.datasets[0].data.push(bloodCount[blood]);
			bloodChartData.labels.push(blood);
		}
	}

</script>

<DataComponent requiredTables={requiredTables} onDataReady={onDataReady} >
	<h2>Character Profiles</h2>

	<p>Next birthday: </p>

	<div class="table-wrap">
		<DopeAssTable data={profileData} columns={columns} />
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
</DataComponent>

<style>
table.charts {
	table-layout: fixed;
	width: 80%;
}
</style>
