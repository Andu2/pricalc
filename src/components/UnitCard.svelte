<script>
	import UnitCard_EquipSet from "@src/components/UnitCard_EquipSet.svelte";
	import UnitCard_Skills from "@src/components/UnitCard_Skills.svelte";
	import UnitCard_Stats from "@src/components/UnitCard_Stats.svelte";
	import UnitCard_Bond from "@src/components/UnitCard_Bond.svelte";
	import UnitCard_Resistances from "@src/components/UnitCard_Resistances.svelte";
	import UnitCard_Drops from "@src/components/UnitCard_Drops.svelte";
	import RaritySelect from "@src/components/RaritySelect.svelte";
	import UnitSelect from "@src/components/UnitSelect.svelte";
	import { STAT_NAMES, STAT_DISPLAY_NAMES, MAX_LEVEL, lookupRows } from "@src/data/priconnedb";
	import { createActor, calculatePower, getUnitType, getUnitIdBase } from "@src/logic/unit";
	import { hideImpossibleRarities, includeExSkillStats } from "@src/settings.js";
	import { sortByAttr } from "@src/utils"

	export let unit;
	let options = {};
	$: options.includeExSkillStats = $includeExSkillStats;

	$: unitType = getUnitType(unit.id);

	$: unitVariants = getUnitVariants(unit.id);

	function getUnitVariants(unitId) {
		let unitVariants = [];
		if (getUnitType(unitId) !== "boss" && getUnitType(unitId) !== "enemy" && getUnitType(unitId) !== "shadow") return unitVariants;

		let unitBaseId = getUnitIdBase(unitId);
		let allVariants = lookupRows("enemy_parameter", { baseId: unitBaseId }, { 
			baseId: function(row) {
				return getUnitIdBase(row.unit_id);
			}
		});
		let variantOptions = allVariants.map(function(variant) {
			return {
				enemyId: variant.enemy_id,
				unitId: variant.unit_id,
				level: variant.level,
				displayName: variant.name + " - Level " + variant.level
			}
		});
		variantOptions.sort(sortByAttr("level"));
		return variantOptions;
	}

	function maxAll() {
		unit.rarity = 5;
		unit.level = MAX_LEVEL;
		unit.rank = 8;
		unit.bond = 8;
		unit.equipment = {
			slot1: {
				equipped: true,
				refine: 5
			},
			slot2: {
				equipped: true,
				refine: 5
			},
			slot3: {
				equipped: true,
				refine: 5
			},
			slot4: {
				equipped: true,
				refine: 5
			},
			slot5: {
				equipped: true,
				refine: 5
			},
			slot6: {
				equipped: true,
				refine: 5
			}
		},
		unit.skills = {
			union_burst: MAX_LEVEL,
			main_skill_1: MAX_LEVEL,
			main_skill_2: MAX_LEVEL,
			ex_skill_1: MAX_LEVEL
		}
	}

	// need dummy actor
	let actor = createActor({
		id: -1,
		rarity: 1,
		level: 1,
		rank: 1,
		bond: 0,
		equipment: {
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
		},
		skills: {
			union_burst: 1,
			main_skill_1: 1,
			main_skill_2: 1,
			ex_skill_1: 1
		},
		bonds: []
	});
	let unitComments = "???";

	function recalculate() {
		let isValid = validateUnit(unit);

		if (isValid) {
			return createActor(unit, options);
		}
		else return actor;
	}

	function validateUnit() {
		// Make sure shit isn't jacked up - using localstorage kinda scary
		var isValid = true;
		if (typeof unit !== "object" || typeof unit.equipment !== "object" || typeof unit.skills !== "object") {
			isValid = false;
		}
		else {
			["id", "rarity", "level", "rank", "bond"].forEach(function(attr) {
				if (typeof unit[attr] !== "number") {
					isValid = false;
				}
			});
			[1, 2, 3, 4, 5, 6].forEach(function(slot) {
				if (typeof unit.equipment["slot" + slot] !== "object") {
					isValid = false;
				}
				else {
					if (typeof unit.equipment["slot" + slot].equipped !== "boolean") isValid = false;
					if (typeof unit.equipment["slot" + slot].refine !== "number") isValid = false;
				}
			});
			["union_burst", "main_skill_1", "main_skill_2", "ex_skill_1"].forEach(function(skill) {
				if (typeof unit.skills[skill] !== "number") isValid = false;
			});
		}
		if (!isValid) {
			// console.warn("INVALID UNIT; RESETTING");
			// unit = {
			// 	id: -1,
			// 	rarity: 1,
			// 	level: 1,
			// 	rank: 1,
			// 	bond: 0,
			// 	equipment: {
			// 		slot1: {
			// 			equipped: false,
			// 			refine: 0
			// 		},
			// 		slot2: {
			// 			equipped: false,
			// 			refine: 0
			// 		},
			// 		slot3: {
			// 			equipped: false,
			// 			refine: 0
			// 		},
			// 		slot4: {
			// 			equipped: false,
			// 			refine: 0
			// 		},
			// 		slot5: {
			// 			equipped: false,
			// 			refine: 0
			// 		},
			// 		slot6: {
			// 			equipped: false,
			// 			refine: 0
			// 		}
			// 	},
			// 	skills: {
			// 		union_burst: 1,
			// 		main_skill_1: 1,
			// 		main_skill_2: 1,
			// 		ex_skill_1: 1
			// 	},
			// 	bonds: []
			// }
		}

		if (typeof unit.rarity === "number" && $hideImpossibleRarities && unit.id > -1) {
			// TODO: Fix this mess
			var unitData = lookupRows("unit_data", { unit_id: unit.id })[0];
			if (unitData.rarity > unit.rarity) {
				unit.rarity = unitData.rarity;
			}
		}

		if (typeof unit.level === "number") {
			if (unit.level > MAX_LEVEL) unit.level = MAX_LEVEL;
			else if (unit.level < 1) unit.level = 1;
		}
		if (typeof unit.rank === "number") {
			if (unit.rank > 8) unit.rank = 8;
			else if (unit.rank < 1) unit.rank = 1;
		}
		if (typeof unit.bond === "number") {
			if (unit.bond > 8) unit.bond = 8;
			else if (unit.bond > 4 && typeof unit.rarity === "number" && unit.rarity < 3) unit.bond = 4;
			else if (unit.bond < 0) unit.bond = 0;
		}

		return isValid;
	}

	function resetEquipment() {
		unit.equipment = {
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

	$: actor = recalculate(unit);

	function getUnitComments(actor) {
		console.log("ran dat shit", actor.unitData)
		if (actor.unitData) {
			return actor.unitData.comment.replace(/\\n/g, "<br />");
		}
		else {
			//console.log(actor)
			return "???";
		}
	}
</script>

<div>
	<div class="unit-card-header">
		<div class="unit-card-image">
			<UnitSelect bind:unitId={unit.id} rarity={unit.rarity} />
			<div class="unit-card-parameters">
				<div><strong>{actor.name ? actor.name: "Select a character..."}</strong></div>
				{#if unitType === "character"}
				<table>
					<tr><td>Rarity:</td><td><RaritySelect bind:rarity={unit.rarity} /></td></tr>
					<tr><td>Level:</td><td><input type="number" min=1 max={MAX_LEVEL} bind:value={unit.level} /></td></tr>
					<tr><td>Rank:</td><td><input type="number" min=1 max=8 bind:value={unit.rank} on:change={resetEquipment} /></td></tr>
					<tr><td>Bond:</td><td><input type="number" min=0 max=8 bind:value={unit.bond} /></td></tr>
				</table>
				{/if}
				{#if unitType === "boss" || unitType === "enemy" || unitType === "shadow"}
				<table>
					<tr><td>Variant:</td><td>
						<select bind:value={unit.enemyId}>
							{#each unitVariants as variant}
							<option value={variant.enemyId}>{variant.displayName}</option>
							{/each}
						</select>
					</td></tr>
				</table>
				{/if}
			</div>
		</div>
		<div class="card-middle-row-wrap">
			<div class="unit-card-middlerow">
				{#if unitType === "character"}
				<div class="max-all-button-wrap">
					<div class="button max-all-button" on:click={maxAll}>Max all</div>
				</div>
				{/if}
				<div class="unit-card-description">
					{@html getUnitComments(actor)}
				</div>
			</div>
		</div>
<!-- 		<UnitCard_Bond /> -->
	</div>
	{#if unitType !== "???"}
	<div class="card-section-wrap">
		<div class="card-section-row">
			<UnitCard_Stats actor={actor} />
			{#if unitType === "character"}
			<UnitCard_EquipSet unitId={unit.id} rank={unit.rank} bind:equipment={unit.equipment} />
			{/if}
			{#if unitType === "boss" || unitType === "enemy"}
			<UnitCard_Resistances resistanceData={actor.resistData} />
			{/if}
			{#if unitType === "enemy" || unitType === "shadow"}
			<UnitCard_Drops enemyId={unit.enemyId} />
			{/if}
			{#if unitType === "character" || unitType === "boss" || unitType === "shadow"}
			<UnitCard_Skills unitId={unit.id} rank={unit.rank} level={unit.level} rarity={unit.rarity} actor={actor} bind:skillLevels={unit.skills} />
			{/if}
		</div>
	</div>
	{/if}
</div>

<style>
div.unit-card-header {
	padding-left: 10px;
}

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

div.card-middle-row-wrap {
	padding-top: 10px;
	padding-bottom: 5px;
	border-spacing: 10px;
	display: table;
}

div.unit-card-middlerow {
	display: table-row;
}

div.max-all-button-wrap {
	display: table-cell;
	min-width: 80px;
	vertical-align: top;
}

div.max-all-button {
	padding: 5px;
}

div.unit-card-description {
	display: table-cell;
	vertical-align: top;
}

img.char-image {
	width: 128px;
}
</style>