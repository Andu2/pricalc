<script>
	import UnitCard_EquipSet from "@src/components/UnitCard_EquipSet.svelte";
	import UnitCard_Skills from "@src/components/UnitCard_Skills.svelte";
	import { STAT_NAMES, createActor, calculatePower, getUnlockedUnits } from "@src/priconne.js";
	import priconneDb from "@src/priconnedb.js";

	const STAT_DISPLAY_NAMES = {
		"hp": "HP",
		"atk": "Physical Attack",
		"def": "Physical Defense",
		"magic_str": "Magic Attack", 
		"magic_def": "Magic Defense",
		"physical_critical": "Physical Critical Rate",
		"magic_critical": "Magic Critical Rate", 
		"wave_hp_recovery": "HP Regen",
		"wave_energy_recovery": "TP Regen",
		"dodge": "Dodge",
		"life_steal": "HP Drain",
		"hp_recovery_rate": "HP Recovery Boost",
		"energy_recovery_rate": "TP Boost",
		"energy_reduce_rate": "TP Retain",
		"accuracy": "Accuracy"
	}

	let unit = {
		id: -1,
		rarity: 1,
		level: 1,
		rank: 1,
		bond: 8,
		includeExSkillStats: true,
		equipment: {
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
		},
		skills: {
			union_burst: 1,
			main_skill_1: 1,
			main_skill_2: 1,
			ex_skill_1: 1
		},
		bonds: []
	};

	var calculated = {
		power: 0
	}

	function maxAll() {
		unit.rarity = 5;
		unit.level = 85;
		unit.rank = 8;
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
	let charImg = "images/unit/unit_icon_unit_unknown.png";

	function recalculate() {
		// garbage collect plz
		actor = createActor(unit);
		calculated.power = calculatePower(actor);
		if (actor.unitData) {
			unitComments = actor.unitData.comment;
			var unitIdString = unit.id + "";
			var unitIdWithRarity = unitIdString.slice(0, 4) + (unit.rarity >= 3 ? "3" : "1") + unitIdString.slice(-1); 
			charImg = "images/unit/unit_icon_unit_" + unitIdWithRarity + ".png";
		}
		else {
			console.log(actor)
			unitComments = "???";
			charImg = "images/unit/unit_icon_unit_unknown.png";
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

	recalculate();
</script>

<div>
	Unit: 
	<select bind:value={unit.id} on:change={recalculate}>
		{#each unlockedUnits as unit}
		<option value={unit.unit_id}>{unit.unit_name}</option>
		{/each}
	</select><br />
	<div class="unit-card-header">
		<div class="unit-card-image">
			<img class="char-image" src={charImg} />
			<div class="unit-card-parameters">
				<div><strong>{actor.unitData ? actor.unitData.unit_name: "Select a character..."}</strong></div>
				<div>Rarity: <input type="number" min=1 max=5 bind:value={unit.rarity} on:change={recalculate} /></div>
				<div>Level: <input type="number" min=1 max=85 bind:value={unit.level} on:change={recalculate} /></div>
				<div>Rank: <input type="number" min=1 max=8 bind:value={unit.rank} on:change={resetEquipment} on:change={recalculate} /></div>
			</div>
		</div>
		<div class="unit-card-description">
			{unitComments}
		</div>
	</div>
	<br />
	Bond: <input type="number" min=0 max=8 bind:value={unit.bond} on:change={recalculate} />
	Include EX skill stats: <input type="checkbox" bind:checked={unit.includeExSkillStats} on:change={recalculate} />
	<div class="card-section-wrap">
		<div class="card-section-row">
			<div class="card-section">
				<div class="card-section-header">Stats</div>
				<div class="stat-power">
					Power: {Math.round(calculated.power)}
				</div>
				<table>
					{#each STAT_NAMES as stat}
					<tr><td class="stat-label">{STAT_DISPLAY_NAMES[stat]}</td><td class="stat-value">{Math.round(actor[stat])}</td></tr>
					{/each}
				</table>
			</div>
			<UnitCard_EquipSet unitId={unit.id} rank={unit.rank} bind:equipment={unit.equipment} on:change={recalculate} />
			<UnitCard_Skills unitId={unit.id} rank={unit.rank} actor={actor} bind:skillLevels={unit.skills} on:change={recalculate} />
		</div>
	</div>
	<button type="button" on:click={maxAll}>Max all</button>
</div>

<style>
div.stat-power {
	margin-bottom: 8px;
}

td.stat-label {
	padding-right: 15px;
}

td.stat-value {
	font-family: monospace;
}

div.unit-card-parameters {
	display: inline-block;
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