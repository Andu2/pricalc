<script>
	import { loadTables } from "@src/data/priconnedb";
	import { getMaxLevel } from "@src/logic/player";
	import DataComponent from "@src/components/DataComponent.svelte";

	const requiredTables = [ "unit_data", "experience_team" ];

	let MAX_LEVEL = 1;

	function onDataReady() {
		MAX_LEVEL = getMaxLevel();
	}
</script>

<DataComponent requiredTables={requiredTables} onDataReady={onDataReady} >
	<h3>Sandbox</h3>

	<p>{MAX_LEVEL}</p>
</DataComponent>