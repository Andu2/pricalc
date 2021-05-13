<script>
	import { jpContentHistory } from "@src/data/priconnedb";
	import { getUnitImg } from "@src/logic";
	import { escAttr} from "@src/utils";
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
				iconHtml = "<img class=\"table-icon\" src=\"" + escAttr(getUnitImg(unitAdded.unitId, { rarity: 3, server: "jp" })) + "\" />";
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
