<script>
	import UnitCard_EquipSet from "@src/components/UnitCard_EquipSet.svelte";
	import UnitCard_Skills from "@src/components/UnitCard_Skills.svelte";
	import UnitCard_Stats from "@src/components/UnitCard_Stats.svelte";
	import UnitCard_Bond from "@src/components/UnitCard_Bond.svelte";
	import RaritySelect from "@src/components/RaritySelect.svelte";
	import UnitSelect from "@src/components/UnitSelect.svelte";
	import { STAT_NAMES, STAT_DISPLAY_NAMES, createActor, calculatePower, getUnlockedUnits, lookupUnitData } from "@src/priconne.js";
	import priconneDb from "@src/priconnedb.js";
	import { hideImpossibleRarities } from "@src/settings.js";

	export let unit;

	function maxAll() {
		unit.rarity = 5;
		unit.level = 85;
		unit.rank = 8;
		unit.bond = 8;
		unit.equipment = {
			slot1: {
				equipped: true,
				refine: 5,
				id: -1
			},
			slot2: {
				equipped: true,
				refine: 5,
				id: -1
			},
			slot3: {
				equipped: true,
				refine: 5,
				id: -1
			},
			slot4: {
				equipped: true,
				refine: 5,
				id: -1
			},
			slot5: {
				equipped: true,
				refine: 5,
				id: -1
			},
			slot6: {
				equipped: true,
				refine: 5,
				id: -1
			}
		},
		unit.skills = {
			union_burst: 85,
			main_skill_1: 85,
			main_skill_2: 85,
			ex_skill_1: 85
		}
		recalculate();
	}

	let actor;
	let unitComments = "???";

	function recalculate() {
		if ($hideImpossibleRarities && unit.id > -1) {
			// TODO: Fix this mess
			var unitData = lookupUnitData(unit.id);
			if (unitData.rarity > unit.rarity) {
				unit.rarity = unitData.rarity;
			}
		}
		actor = createActor(unit);
		if (actor.unitData) {
			unitComments = actor.unitData.comment;
		}
		else {
			//console.log(actor)
			unitComments = "???";
		}
	}

	function resetEquipment() {
		unit.equipment = {
			slot1: {
				equipped: false,
				refine: 0,
				id: -1
			},
			slot2: {
				equipped: false,
				refine: 0,
				id: -1
			},
			slot3: {
				equipped: false,
				refine: 0,
				id: -1
			},
			slot4: {
				equipped: false,
				refine: 0,
				id: -1
			},
			slot5: {
				equipped: false,
				refine: 0,
				id: -1
			},
			slot6: {
				equipped: false,
				refine: 0,
				id: -1
			}
		}
	}

	let unlockedUnits = getUnlockedUnits();

	$: recalculate(unit.rarity);
</script>

<div>
	<div class="unit-card-header">
		<div class="unit-card-image">
			<UnitSelect bind:unitId={unit.id} rarity={unit.rarity} />
			<div class="unit-card-parameters">
				<div><strong>{actor.unitData ? actor.unitData.unit_name: "Select a character..."}</strong></div>
				{#if unit.id > -1}
				<table>
					<tr><td>Rarity:</td><td><RaritySelect bind:rarity={unit.rarity} /></td></tr>
					<tr><td>Level:</td><td><input type="number" min=1 max=85 bind:value={unit.level} on:change={recalculate} /></td></tr>
					<tr><td>Rank:</td><td><input type="number" min=1 max=8 bind:value={unit.rank} on:change={resetEquipment} on:change={recalculate} /></td></tr>
					<tr><td>Bond:</td><td><input type="number" min=0 max=8 bind:value={unit.bond} on:change={recalculate} /></td></tr>
				</table>
				{/if}
			</div>
		</div>
		{#if unit.id > -1}
		<div class="unit-card-description">
			{unitComments}
		</div>
		{/if}
<!-- 		<UnitCard_Bond /> -->
	</div>
	{#if unit.id > -1}
	<div class="card-section-wrap">
		<div class="card-section-row">
			<UnitCard_Stats actor={actor} />
			<UnitCard_EquipSet unitId={unit.id} rank={unit.rank} bind:equipment={unit.equipment} on:change={recalculate} />
			<UnitCard_Skills unitId={unit.id} rank={unit.rank} actor={actor} bind:skillLevels={unit.skills} on:change={recalculate} />
		</div>
	</div>
	<button type="button" on:click={maxAll}>Max all</button>
	{/if}
</div>

<style>
div.unit-card-parameters {
	display: inline-block;
	vertical-align: top;
	padding-left: 10px;
}

div.card-section-row {
	display: table-row;
}

div.card-section-wrap {
	display: table;
	border-spacing: 10px;
}

img.char-image {
	width: 128px;
}
</style>