<script>
	import { lookupRows } from "@src/data/priconnedb";
	import DopeAssTable from "@src/components/DopeAssTable.svelte";

	let UNLOCKED_UNITS = [];

	let tableData = UNLOCKED_UNITS.map(function(unit) {
		var unitIdString = unit.unit_id + "";
		var unitIdWithRarity = unitIdString.slice(0, 4) + "3" + unitIdString.slice(-1); 
		var charImg = "images/unit/unit_icon_unit_" + unitIdWithRarity + ".png";

		return {
			name: unit.unit_name,
			icon: "<img class=\"table-icon\" src=\"" + charImg + "\" />",
			cute: "Yes" // Cuteness quotient determined using Hoshimachi method. Family-wise error rate is 0.05
		}
	});

	let columns = [{
		attr: "icon",
		displayName: "Icon",
		html: true,
		sort: null
	}, {
		attr: "name",
		displayName: "Character",
		sort: "default"
	}, {
		attr: "cute",
		displayName: "Cute?",
		sort: "default"
	}];
</script>

<h2>Cuteness Reference</h2>

<p>
	The following table uses data extracted directly from the game.
</p>

<div class="table-wrap">
	<DopeAssTable data={tableData} columns={columns} />
</div>
