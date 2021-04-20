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

		background:
			linear-gradient(white 30%, rgba(255,255,255,0)),
			linear-gradient(rgba(255,255,255,0), white 70%) 0 100%,
			
			linear-gradient(rgba(22,59,90,0.25) 0%, rgba(22,59,90,0)),
			linear-gradient(rgba(22,59,90,0), rgba(22,59,90,0.25) 100%) 0 100%;
		
		background-repeat: no-repeat;
		background-size: 100% 50px, 100% 50px, 100% 15px, 100% 15px;
		background-attachment: local, local, scroll, scroll;
		background-color: transparent;
	}
</style>