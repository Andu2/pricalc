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
	import { createActor, calculatePower, getUnitType, getUnitIdBase, isValidUnitConfiguration } from "@src/logic/unit";
	import { hideImpossibleRarities, includeExSkillStats } from "@src/settings.js";
	import { sortByAttr } from "@src/utils"

	export let unit;
	let options = {};
	$: options.includeExSkillStats = $includeExSkillStats;

	$: unitType = getUnitType(unit.id);
	let unitVariant;
	$: unitVariants = getUnitVariants(unit.id);
	$: setUnitVariant(unitVariant);

	function getUnitVariants(unitId) {
		if (getUnitType(unitId) !== "boss" && getUnitType(unitId) !== "enemy" && getUnitType(unitId) !== "shadow") return [];

		let unitBaseId = getUnitIdBase(unitId);
		// If we switched to a different ID of the same unit, don't recalculate
		if (unitVariants && unitVariants.length && getUnitIdBase(unitVariants[0].unitId) === unitBaseId) {
			return unitVariants;
		}

		let allVariants = lookupRows("enemy_parameter", { baseId: unitBaseId }, { 
			baseId: function(row) {
				return getUnitIdBase(row.unit_id);
			}
		});
		let variantOptions = allVariants.map(function(variant) {
			// let's try to get more info on this guy
			let additionalContext = "";
			if (getUnitType(unitId) === "boss") {
				let clanBattleBossInfo = lookupRows("clan_battle_boss_group", {});
				let clanBattles = [];
				clanBattleBossInfo.forEach(function(bossInfo) {
					let bossWave = lookupRows("wave_group_data", { wave_group_id: bossInfo.wave_group_id, enemy_id_1: variant.enemy_id });
					if (bossWave.length === 1) {
						// Assume boss group IDs are in order and 2nd-4th digit are clan battle number
						let clanBattleNum = Math.floor(bossInfo.clan_battle_boss_group_id / 1000) - 1000;
						if (clanBattles.indexOf(clanBattleNum) === -1) {
							clanBattles.push(clanBattleNum);
						}
					}
				});
				if (clanBattles.length > 0) {
					additionalContext = "Clan battle " + clanBattles.join(", ");
				}

				if (!additionalContext.length) {
					// dungeon boss: 501010101
					// 3rd to last digit is dungeon number
					// Could get from dungeon_area_data but this is easier
					if (Math.floor(variant.enemy_id / 100000000) === 5) {
						let dungeonNum = Math.floor((variant.enemy_id % 10000) / 100);
						additionalContext = "Dungeon " + dungeonNum
					}
				}
			}
			if (!additionalContext.length) {
				let waves = lookupRows("wave_group_data", {});
				let wavesIn = [];
				waves.forEach(function(wave) {
					for (var i = 1; i <= 5; i++) {
						if (wave["enemy_id_" + i] === variant.enemy_id && wavesIn.indexOf(wave.wave_group_id) === -1) {
							wavesIn.push(wave.wave_group_id);
							return;
						}
					}
				});

				let quests = lookupRows("quest_data", {});
				let questsIn = [];
				quests.forEach(function(quest) {
					for (var i = 1; i <= 3; i++) {
						if (wavesIn.indexOf(quest["wave_group_id_" + i]) > -1) {
							let questName = quest.quest_name.split(" ").slice(-1)[0] + (quest.stamina_start == 2 ? " Hard" : " Normal");
							if (questsIn.indexOf(questName) === -1) {
								questsIn.push(questName);
							}
						}
					}
				});
				let grottoQuests = lookupRows("training_quest_data", {});
				grottoQuests.forEach(function(quest) {
					for (var i = 1; i <= 3; i++) {
						if (wavesIn.indexOf(quest["wave_group_id_" + i]) > -1) {
							let questName = quest.quest_name;
							if (questsIn.indexOf(questName) === -1) {
								questsIn.push(questName);
							}
						}
					}
				});

				if (questsIn.length > 0) {
					additionalContext = questsIn.join(", ");
				}
			}

			let displayName = variant.name + " Level " + variant.level;
			if (additionalContext.length > 0) {
				displayName = additionalContext + " - " + displayName;
			}

			return {
				enemyId: variant.enemy_id,
				unitId: variant.unit_id,
				level: variant.level,
				displayName: displayName
			}
		});
		variantOptions.sort(sortByAttr("level"));

		// default to the first variant with this unit ID
		unitVariant = 0;
		for (var i = 0; i < variantOptions.length; i++) {
			if (variantOptions[i].unitId === unitId) {
				unitVariant = i;
				break;
			}
		}
		unit.enemyId = variantOptions[unitVariant].enemyId;

		return variantOptions;
	}

	function setUnitVariant(unitVariant) {
		if (typeof unitVariant === "number" && unitVariants[unitVariant] !== undefined) {
			unit.id = unitVariants[unitVariant].unitId;
			unit.enemyId = unitVariants[unitVariant].enemyId;
		}
	}

	function maxAll() {
		unit.rarity = 5;
		unit.level = MAX_LEVEL;
		unit.rank = 8;
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
		};
		unit.skills = {
			union_burst: MAX_LEVEL,
			main_skill_1: MAX_LEVEL,
			main_skill_2: MAX_LEVEL,
			ex_skill_1: MAX_LEVEL
		}
		for (var key in unit.bond) {
			unit.bond[key] = 8;
		}
	}

	function recalculate(unit, validConfig) {
		if (validConfig) {
			return createActor(unit, options);
		}
		else if (typeof actor === "undefined") {
			return createActor({id: -1})
		}
		else return actor;
	}

	function constrainUnitConfig() {
		if (typeof unit.rarity === "number" && $hideImpossibleRarities && unit.id > -1) {
			var unitData = lookupRows("unit_data", { unit_id: unit.id })[0];
			if (unitData && unitData.rarity > unit.rarity) {
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
		if (typeof unit.bond === "object") {
			let baseId = getUnitIdBase(unit.id);
			if (typeof unit.bond[baseId] === "number") {
				if (unit.bond[baseId] > 8) unit.bond[baseId] = 8;
				else if (unit.bond[baseId] > 4 && typeof unit.rarity === "number" && unit.rarity < 3) unit.bond[baseId] = 4;
				else if (unit.bond[baseId] < 0) unit.bond[baseId] = 0;
			}
		}
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

	function resetAll() {
		unit = {
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
		resetEquipment();
	}

	$: validConfig = validateConfig(unit);
	$: actor = recalculate(unit, validConfig);
	$: unitComments = getUnitComments(actor);
	$: unitName = getName(actor);

	function getName(actor) {
		return actor.name || "Select a character...";
	}

	function validateConfig(unit) {
		constrainUnitConfig();
		return isValidUnitConfiguration(unit);
	}

	function getUnitComments(actor) {
		if (!validConfig) {
			return "Invalid unit configuration"
		}
		if (actor.unitData) {
			if (typeof actor.unitData.comment === "string") {
				return actor.unitData.comment.replace(/\\n/g, "<br />");
			}
			else {
				return "No description"
			}
		}
		else if (unit.id === -1) {
			return "";
		}
		else {
			return "???"
		}
	}
</script>

<div>
	<div class="unit-card-header">
		<div class="unit-card-image">
			<UnitSelect bind:unitId={unit.id} rarity={unit.rarity} />
			<div class="unit-card-parameters">
				<div><strong>{unitName}</strong></div>
				{#if unitType === "character"}
				<table><tr>
					<td>
						<table>
							<tr><td>Rarity:</td><td><RaritySelect bind:rarity={unit.rarity} /></td></tr>
							<tr><td>Level:</td><td><input type="number" min=1 max={MAX_LEVEL} bind:value={unit.level} /></td></tr>
							<tr><td>Rank:</td><td><input type="number" min=1 max=8 bind:value={unit.rank} on:change={resetEquipment} /></td></tr>
						</table>
					</td>
					<td class="bond-cell">
						<UnitCard_Bond unitId={unit.id} bind:bond={unit.bond} />
					</td>
				</tr></table>
				{/if}
				{#if unitType === "summon"}
				<table>
					<tr><td>Rarity:</td><td><RaritySelect bind:rarity={unit.rarity} /></td></tr>
					<tr><td>Level:</td><td><input type="number" min=1 max={MAX_LEVEL} bind:value={unit.level} /></td></tr>
				</table>
				{/if}
				{#if unitType === "boss" || unitType === "enemy" || unitType === "shadow"}
				<table>
					<tr><td>Variant:</td><td>
						<select bind:value={unitVariant}>
							{#each unitVariants as variant, i}
							<option value={i}>{variant.displayName}</option>
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
					{@html unitComments}
					{#if !validConfig}
					<a on:click={resetAll}>(reset)</a>
					{/if}
				</div>
			</div>
		</div>
	</div>
	{#if unitType !== "???"}
	<div class="card-section-wrap">
		<div class="card-section-row">
			<UnitCard_Stats actor={actor} />
			{#if unitType === "character"}
			<UnitCard_EquipSet unitId={unit.id} rank={unit.rank} bind:equipment={unit.equipment} />
			{/if}
			{#if unitType === "boss" || unitType === "enemy"}
			<UnitCard_Resistances resistanceData={actor.resist} />
			{/if}
			{#if false && (unitType === "enemy" || unitType === "shadow")}
			<UnitCard_Drops enemyId={unit.enemyId} />
			{/if}
			{#if unitType === "character" || unitType === "boss" || unitType === "shadow" || unitType === "enemy" || unitType === "summon"}
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

td.bond-cell {
	padding-left: 20px;
}

img.char-image {
	width: 128px;
}
</style>