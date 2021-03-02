<script>
	import { lookupRows } from "@src/data/priconnedb"

	export let resistanceData;

	let ailmentData = lookupRows("ailment_data", {});

	$: statusData = getStatusData(resistanceData);

	function getStatusData(resistanceData) {
		let statusData = [];
		ailmentData.forEach(function(ailment) {
			if (resistanceData["ailment_" + ailment.ailment_id] > 0) {
				statusData.push({
					status: ailment.ailment_name,
					resistance: (resistanceData["ailment_" + ailment.ailment_id] === 100 ? "Immune" : resistanceData["ailment_" + ailment.ailment_id] + "%")
				});
			}
		});
		return statusData;
	}
</script>

<div class="card-section">
	<div class="card-section-header">Resistances</div>
	<table>
		{#each statusData as status}
		<tr><td class="stat-label">{status.status}</td><td class="stat-value">{status.resistance}</td></tr>
		{/each}
	</table>
</div>

<style>
div.card-section {
	min-width: 210px;
}

td {
	vertical-align: text-bottom;
}

td.stat-label {
	padding-right: 10px;
}

td.stat-value {
	font-family: monospace;
	font-size: 10pt;
}
</style>