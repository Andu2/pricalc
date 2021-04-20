<script>
	export let unitIds = {};

	import { lookupRows } from "@src/data/priconnedb";

	let charNames = {};
	lookupRows("unit_data", {}).forEach(function(unitData) {
		charNames[unitData.unit_id] = unitData.unit_name;
	});

	let unitOrder = Object.keys(unitIds).sort(function(a, b) {
		if (charNames[a] > charNames[b]) return 1;
		else if (charNames[a] < charNames[b]) return -1;
		else return 0;
	});

	function selectAll() {
		for (var unitId in unitIds) {
			unitIds[unitId] = true;
		}
	}

	function deselectAll() {
		for (var unitId in unitIds) {
			unitIds[unitId] = false;
		}
	}
</script>

<h4>Included characters</h4>
<div id="unit-list">
	{#each unitOrder as unitId}
	<input type="checkbox" bind:checked={unitIds[unitId]} /> {charNames[unitId]} <br />
	{/each}
</div>
<div class="button" on:click={selectAll}>Select all</div>
<div class="button" on:click={deselectAll}>Deselect all</div>

<style>
	div.button {
		padding: 3px 0;
	}

	div.button + div.button {
		margin-top: 5px;
	}

	div#unit-list {
		margin-bottom: 20px;
		height: 500px;
		overflow-y: auto;
	}
</style>