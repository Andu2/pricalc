<script>
	import UnitSlot from "@src/components/UnitSlot.svelte";
	import { lookupRows, UNLOCKED_UNITS } from "@src/data/priconnedb";
	import { getContext } from "svelte";

	export let team = {};
	export let isDefense = false;

	let unitSlot = getContext("unitSlot");
	let slotIds = {};
	for (var slot in team) {
		let prefix = isDefense ? "defense" : "offense";
		slotIds[slot] = prefix + "." + slot;
	}

	let unitDistances = {};
	UNLOCKED_UNITS.forEach(function(unitData) {
		unitDistances[unitData.unit_id] = unitData.search_area_width;
	});

	$: unitOrder = getOrder(team);
	
	function getOrder() {
		let slots = Object.keys(team);

		slots.sort(function(a, b) {
			let aDistance = unitDistances[team[a].id] || 2160;
			let bDistance = unitDistances[team[b].id] || 2160;
			if (aDistance > bDistance) return 1;
			else if (aDistance < bDistance) return -1;
			else return 0;
		});

		if (!isDefense) {
			slots.reverse();
		}
		return slots;
	}
</script>

<table><tr>
	{#each unitOrder as slot}
	<td><UnitSlot slotId={slotIds[slot]} unitId={team[slot].id} rarity={team[slot].rarity} enemyId={team[slot].enemyId} /></td>
	{/each}
</tr></table>

<style>
	table {
		border-spacing: 5px;
	}
</style>