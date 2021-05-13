<script>
	import { lookupRows, getTable } from "@src/data";
	import { getUnlockedUnits, getUnitImg, getCharaCards, getUnitIdBase } from "@src/logic";
	import DopeAssTable from "@src/components/DopeAssTable.svelte";
	import Doughnut from "svelte-chartjs/src/Doughnut.svelte";
	import DataComponent from "@src/components/DataComponent.svelte";

	const requiredTables = [ "unit_data", "unit_profile", "chara_story_status" ];

	let profileData = [];
	let nextBirthdayText = "";

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
		attr: "cards",
		displayName: "Num Cards",
		sort: "numeric"
	}, {
		attr: "age",
		displayName: "Age",
		sort: function(row1, row2) {
			let row1Numeric = row1.age * 1;
			let row2Numeric = row2.age * 1;
			if (isNaN(row1Numeric)) row1Numeric = Infinity;
			if (isNaN(row2Numeric)) row2Numeric = Infinity;
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

	let emiliaBringsTheAverageOver18SoWeDontLookLikePedos = false;

	function convertCmToFeetString(cm) {
		if (isNaN(cm * 1)) return cm;
		let inches = Math.round(cm / 2.54);
		let feet = Math.floor(inches / 12);
		let leftoverInches = inches - feet * 12;
		return Math.round(cm) + "cm (" + feet + "'" + leftoverInches + "\")";
	}

	function convertKgToPoundsString(kg) {
		if (isNaN(kg * 1)) return kg;
		return Math.round(kg) + "kg (" + Math.round(kg * 2.20462) + " pounds)";
	}

	// Avoid recalculating repeatedly
	let currentDate = new Date();
	let currentYear = currentDate.getFullYear();
	let currentMonth = currentDate.getMonth();
	let currentDay = currentDate.getDate();

	function birthdaySort(row1, row2) {
		let sortVal1 = getBirthdaySortVal(row1, 0, 1);
		let sortVal2 = getBirthdaySortVal(row2, 0, 1);
		if (sortVal1 < sortVal2) return -1;
		else if (sortVal1 > sortVal2) return 1;
		else return 0;
	}

	function birthdaySortAfterCurrent(row1, row2) {
		let sortVal1 = getBirthdaySortVal(row1, currentMonth, currentDay);
		let sortVal2 = getBirthdaySortVal(row2, currentMonth, currentDay);
		if (sortVal1 < sortVal2) return -1;
		else if (sortVal1 > sortVal2) return 1;
		else return 0;
	}
	
	function getBirthdaySortVal(row, afterMonth = 0, afterDay = 1) {
		if (isNaN(row.birth_day * 1) || isNaN(row.birth_month * 1)) return Infinity;
		let hasBirthdayPassed = (row.birth_month - 1 < afterMonth 
			|| (row.birth_month - 1 === afterMonth && row.birth_day < afterDay));
		let sortVal = row.birth_month * 100 + row.birth_day;
		if (hasBirthdayPassed) {
			sortVal += 10000;
		}
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
		"rgba(210, 50, 255, 0.5)",
		"rgba(60, 230, 50, 0.5)",
		"rgba(255, 210, 50, 0.5)",
		"rgba(150, 150, 150, 0.5)",
		"rgba(150, 50, 255, 0.5)"
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
		let emiliaExists = false;
		let someoneElseIsOld = false;

		let UNLOCKED_UNITS = getUnlockedUnits();
		let charaCards = getCharaCards();

		let baseCards = UNLOCKED_UNITS.filter(function(unitData) {
			let baseId = getUnitIdBase(unitData.unit_id);
			let isOutfit = (charaCards[baseId] && charaCards[baseId].baseCard !== baseId);
			return !isOutfit;
		}).map(function(unitData) {
			if (unitData.unit_id === 109901) {
				emiliaExists = true;
			}
			else if (unitData.age >= 100) {
				someoneElseIsOld = true;
			}
			return unitData.unit_id;
		});

		let profiles = getTable("unit_profile");
		profileData = profiles.map(function(profile) {
			let profileCopy = {...profile};
			profileCopy.birth_date = getMonth(profileCopy.birth_month) + " " + profileCopy.birth_day;
			profileCopy.race = profileCopy.race.slice(0, 1).toUpperCase() + profileCopy.race.slice(1);
			profileCopy.icon = "<img class=\"table-icon\" src=\"" + getUnitImg(profileCopy.unit_id) + "\" />";
			profileCopy.cards = 0;
			if (charaCards[getUnitIdBase(profile.unit_id)]) {
				profileCopy.cards = charaCards[getUnitIdBase(profile.unit_id)].cards.length;
			}
			return profileCopy;
		});

		profileData = profileData.filter(function(profile) {
			return (baseCards.indexOf(profile.unit_id) > -1)
		}).sort(function(a, b) {
			if (a.unit_name > b.unit_name) return 1;
			else if (a.unit_name < b.unit_name) return -1;
			else return 0;
		});

		let nextBirthdays = [...profileData].sort(birthdaySortAfterCurrent).map(function(profile) {
			return profile.unit_name + " (" + profile.birth_date + ")";
		});
		nextBirthdayText = nextBirthdays.slice(0, 3).join(", ");

		averageAge = getAverage(profileData, "age");
		averageHeight = getAverage(profileData, "height");
		averageWeight = getAverage(profileData, "weight");
		raceCount = getCount(profileData, "race");
		bloodCount = getCount(profileData, "blood_type");

		raceChartData.datasets[0].data = [];
		raceChartData.labels = [];
		for (var race in raceCount) {
			raceChartData.datasets[0].data.push(raceCount[race]);
			raceChartData.labels.push(race);
		}
		bloodChartData.datasets[0].data = [];
		bloodChartData.labels = [];
		for (var blood in bloodCount) {
			bloodChartData.datasets[0].data.push(bloodCount[blood]);
			bloodChartData.labels.push(blood);
		}

		emiliaBringsTheAverageOver18SoWeDontLookLikePedos = (emiliaExists && !someoneElseIsOld && averageAge >= 18)
	}

</script>

<DataComponent requiredTables={requiredTables} onDataReady={onDataReady} >
	<h2>Character Profiles</h2>

	{#if nextBirthdayText}
	<p>
		Next birthdays: {nextBirthdayText}
	</p>
	{/if}

	<div class="table-wrap">
		<DopeAssTable data={profileData} columns={columns} />
	</div>
	<h2>Statistics</h2>
	<p>
		Average age: {Math.round(averageAge * 100) / 100} 
		{#if emiliaBringsTheAverageOver18SoWeDontLookLikePedos}
		<span class="soft">thanks Emilia</span>
		{/if}
		<br />
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

.soft {
	font-size: 10pt;
	color: #636c86;
	font-style: italic;
}
</style>
