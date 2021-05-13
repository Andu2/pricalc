<script>
	import { getUnlockedUnits, getUnitImg } from "@src/logic";
	import DopeAssTable from "@src/components/DopeAssTable.svelte";
	import DataComponent from "@src/components/DataComponent.svelte";

	const requiredTables = [ "unit_data" ];

	let tableData = [];

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

	function onDataReady() {
		tableData = getUnlockedUnits().map(function(unit) {
			return {
				name: unit.unit_name,
				icon: "<img class=\"table-icon\" src=\"" + getUnitImg(unit.unit_id, { rarity: 3 }) + "\" />",
				cute: "Yes" // Cuteness quotient determined using Hoshimachi method. Family-wise error rate is 0.05
			}
		});

		let startAWar = (Math.random() < 0.5);
		if (startAWar) {
			let nuclearWar = (Math.random() < 0.01);
			if (nuclearWar) {
				tableData.forEach(function(row) {
					row.cute = "No";
				})
			}
			else {
				let notCuteIndex = Math.floor(Math.random() * tableData.length);
				tableData[notCuteIndex].cute = "No";
			}
		}
	}
</script>

<h2>Cuteness Reference</h2>
<DataComponent requiredTables={requiredTables} onDataReady={onDataReady} >
	<p>
		The following table uses data extracted directly from the game.
	</p>

	<div class="table-wrap">
		<DopeAssTable data={tableData} columns={columns} scroll={false} />
	</div>
</DataComponent>