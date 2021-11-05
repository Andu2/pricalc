<script>
	import { jpContentHistory } from "@src/data";
	import { getUnlockedUnits, getUnitImg } from "@src/logic";
	import { escAttr, formatDate } from "@src/utils";
	import DopeAssTable from "@src/components/DopeAssTable.svelte";
	import DataComponent from "@src/components/DataComponent.svelte";
	import JPContentHeader from "@src/components/JPContentHeader.svelte";
	import JPContentFooter from "@src/components/JPContentFooter.svelte";

	const requiredTables = [ "unit_data" ];

	let hideUnlockedUnits = true;
	let unlockedIds = [];

	const jpLaunchDate = new Date(jpContentHistory.jpLaunchDate);
	const enLaunchDate = new Date(jpContentHistory.enLaunchDate);

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
			displayName: "JP Release Date‎",
			sort: "default"
		}, {
			html: true,
			attr: "jpDaysAfterLaunch",
			displayName: "Days since<br/>JP Launch",
			sort: "numeric"
		}, {
			html: true,
			attr: "enDaysToRelease",
			displayName: "Days to<br/>EN Release",
			sort: "numeric"
		}, {
			html: true,
			attr: "enReleaseDate",
			displayName: "Expected EN<br/>Release Date",
			sort: "default"
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
				iconHtml = "<img class=\"table-icon\" src=\"" + escAttr(getUnitImg(unitAdded.unitId, { rarity: 3, server: "jp" })) + "\" />";
			}

			const jpDaysAfterLaunch = Math.round((new Date(unitAdded.jpDate) - jpLaunchDate) / 1000 / 60 / 60 / 24);
			const enDaysAfterLaunch = Math.round((Date.now() - enLaunchDate) / 1000 / 60 / 60 / 24);
			const enDaysToRelease = jpDaysAfterLaunch - enDaysAfterLaunch;
			const enReleaseDate = new Date((Date.now() + (enDaysToRelease * 1000 * 60 * 60 * 24)));

			return {
				icon: iconHtml,
				name: unitAdded.name,
				pool: capitalize(unitAdded.pool),
				jpDate: formatDate(new Date(unitAdded.jpDate)),
				jpDaysAfterLaunch,
				enDaysToRelease,
				enReleaseDate: formatDate(enReleaseDate),
			}
		});
	}

	function capitalize(str) {
		return str.slice(0, 1).toUpperCase() + str.slice(1);
	}

	function onDataReady() {
		unlockedIds = getUnlockedUnits().map(function(unitData) {
			return unitData.unit_id;
		});
		data = getData(hideUnlockedUnits);
	}
</script>

<h2>JP Characters Added Timeline</h2>
<DataComponent requiredTables={requiredTables} onDataReady={onDataReady} >
	<JPContentHeader />

	<p><input type="checkbox" bind:checked={hideUnlockedUnits} /> Hide characters that are in current data source</p>

	<DopeAssTable data={data} columns={columns} scroll={false} />

	<JPContentFooter />
</DataComponent>
