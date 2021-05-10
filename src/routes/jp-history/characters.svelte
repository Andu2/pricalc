<script>
	import { jpContentHistory } from "@src/data/priconnedb";
	import { getUnlockedUnits } from "@src/logic/unit";
	import DopeAssTable from "@src/components/DopeAssTable.svelte";
	import JPContentHeader from "@src/components/JPContentHeader.svelte";
	import JPContentFooter from "@src/components/JPContentFooter.svelte";

	let hideUnlockedUnits = true;

	let UNLOCKED_UNITS = [];

	const jpLaunchDate = new Date(jpContentHistory.jpLaunchDate);
	const unlockedIds = UNLOCKED_UNITS.map(function(unitData) {
		return unitData.unit_id;
	});

	$: data = getData(hideUnlockedUnits);

	let columns = [
		{
			attr: "icon",
			displayName: "Icon",
			html: true,
			sort: null
		}, {
			attr: "name",
			displayName: "Character",
			sort: "default"
		}, {
			attr: "pool",
			displayName: "Gacha Pool",
			sort: "default"
		}, {
			attr: "jpDate",
			displayName: "JP Release Date",
			sort: "default"
		}, {
			attr: "jpDaysAfterLaunch",
			displayName: "Days After JP Launch",
			sort: "numeric"
		}
	];

	function getData(hideUnlockedUnits) {
		let unitsAdded = jpContentHistory.units;
		if (hideUnlockedUnits) {
			unitsAdded = jpContentHistory.units.filter(function(unitAdded) {
				return unlockedIds.indexOf(unitAdded.unitId) === -1
			});
		}
		return unitsAdded.map(function(unitAdded) {
			let iconHtml = "";
			if (unitAdded.unitId > -1) {
				var unitIdString = unitAdded.unitId + "";
				var unitIdWithRarity = unitIdString.slice(0, 4) + "3" + unitIdString.slice(-1); 
				var charImg = "images/unit/unit_icon_unit_" + unitIdWithRarity + ".png";
				iconHtml = "<img class=\"table-icon\" src=\"" + charImg + "\" />";
			}
			
			return {
				icon: iconHtml,
				name: unitAdded.name,
				pool: capitalize(unitAdded.pool),
				jpDate: unitAdded.jpDate,
				jpDaysAfterLaunch: Math.round((new Date(unitAdded.jpDate) - jpLaunchDate) / 1000 / 60 / 60 / 24)
			}
		});
	}

	function capitalize(str) {
		return str.slice(0, 1).toUpperCase() + str.slice(1);
	}
</script>

<h2>JP Characters Added Timeline</h2>

<JPContentHeader />

<p><input type="checkbox" bind:checked={hideUnlockedUnits} /> Hide characters that are already in global edition</p>

<DopeAssTable data={data} columns={columns} scroll={false} />

<JPContentFooter />
