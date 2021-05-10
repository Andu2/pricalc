<script>
	import UnitSlot from "@src/components/UnitSlot.svelte";
	import { lookupRows } from "@src/data/priconnedb";
	import { baseUnitConfig } from "@src/settings.js"
	import { isValidUnitConfiguration, calculatePower, createActor, getUnlockedUnits } from "@src/logic/unit";
	import { getContext } from "svelte";

	export let team = {};
	export let name = "";
	export let isDefense = false;

	let unitSlot = getContext("unitSlot");
	let slotIds = {};
	for (var slot in team) {
		let prefix = isDefense ? "defense" : "offense";
		slotIds[slot] = prefix + "." + slot;
	}

	$: teamSelected = isTeamSelected($unitSlot)
	$: slotSelected = getSlotSelected($unitSlot);

	let unitDistances = {};
	UNLOCKED_UNITS.forEach(function(unitData) {
		unitDistances[unitData.unit_id] = unitData.search_area_width;
	});

	$: unitOrder = getOrder(team);
	$: teamPower = getTeamPower(team);
	
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

	function clearSlot(slot) {
		team[slot] = {
			id: -1,
			rarity: 1,
			level: 1,
			rank: 1,
			skills: {
				union_burst: 1,
				main_skill_1: 1,
				main_skill_2: 1,
				ex_skill_1: 1
			},
			bond: []
		}
		team[slot].equipment = {
			slot1: {
				equipped: false,
				refine: 0
			},
			slot2: {
				equipped: false,
				refine: 0
			},
			slot3: {
				equipped: false,
				refine: 0
			},
			slot4: {
				equipped: false,
				refine: 0
			},
			slot5: {
				equipped: false,
				refine: 0
			},
			slot6: {
				equipped: false,
				refine: 0
			}
		}
	}

	function clearAll(e) {
		for (var slot in team) {
			clearSlot(slot);
		}
		if (teamSelected) {
			unitSlot.set(null);
		}
	}

	function clearSelected(e) {
		if (teamSelected) {
			clearSlot(slotSelected);
			unitSlot.set(null);
		}
	}

	function isTeamSelected(selectId) {
		if (selectId) {
			let selectedSplit = selectId.split(".");
			let prefix = isDefense ? "defense" : "offense";
			if (selectedSplit[0] === prefix) {
				return true;
			}
		}
		return false;
	}

	function getSlotSelected(selectId) {
		if (selectId) {
			let selectedSplit = selectId.split(".");
			return selectedSplit[1] || "";
		}
		return "";
	}

	function getTeamPower(team) {
		let power = 0;
		for (var slot in team) {
			if (isValidUnitConfiguration(team[slot])) {
				let actor = createActor(team[slot]);
				power += calculatePower(actor);
			}
		}
		return power;
	}
</script>


<div class="team-wrap">
	<div class="team-header">
		<h3>{name}</h3>
		<div class="header-buttons">
			{#if teamSelected}
			<div class="button" on:click={clearSelected}>Clear selected</div>
			{/if}
			<div class="button" on:click={clearAll}>Clear all</div>
		</div>
	</div>
	<table><tr>
		{#each unitOrder as slot}
		<td><UnitSlot slotId={slotIds[slot]} unitId={team[slot].id} rarity={team[slot].rarity} enemyId={team[slot].enemyId} /></td>
		{/each}
	</tr></table>
	<div class="team-footer">
		Team power: {teamPower}
	</div>
</div>

<style>
	table {
		border-spacing: 5px;
	}

	div.team-header h3 {
		margin: 4px 0;
		padding-left: 15px;
	}

	div.team-header {
		position: relative;
		height: 35px;
		line-height: 35px;
	}

	div.header-buttons {
		position: absolute;
		right: 6px;
		top: 0;
		bottom: 0;
	}

	div.team-header div.button {
		display: inline-block;
		padding: 0 6px;
		line-height: 29px;
	}
</style>