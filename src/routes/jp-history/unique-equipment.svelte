<script>
	import { jpContentHistory, UNLOCKED_UNITS } from "@src/data/priconnedb";
	import DopeAssTable from "@src/components/DopeAssTable.svelte";
	import JPContentHeader from "@src/components/JPContentHeader.svelte";
	import JPContentFooter from "@src/components/JPContentFooter.svelte";

	const jpLaunchDate = new Date(jpContentHistory.jpLaunchDate);

	$: data = getData();

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
			attr: "jpDate",
			displayName: "JP Release Date",
			sort: "default"
		}, {
			attr: "jpDaysAfterLaunch",
			displayName: "Days After JP Launch",
			sort: "numeric"
		}
	];

	function getData() {
		let unitsAdded = jpContentHistory.uniqueEquipment;
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
				jpDate: unitAdded.jpDate,
				jpDaysAfterLaunch: Math.round((new Date(unitAdded.jpDate) - jpLaunchDate) / 1000 / 60 / 60 / 24)
			}
		});
	}
</script>

<h2>JP Unique Equipment Timeline</h2>

<JPContentHeader />

<DopeAssTable data={data} columns={columns} scroll={false} />

<JPContentFooter />
