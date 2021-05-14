<script>
	// This code is a mess
	export let unit;

	import UnitCard_EquipSet from "@src/components/UnitCard_EquipSet.svelte";
	import UnitCard_Skills from "@src/components/UnitCard_Skills.svelte";
	import UnitCard_Stats from "@src/components/UnitCard_Stats.svelte";
	import UnitCard_Bond from "@src/components/UnitCard_Bond.svelte";
	import UnitCard_Resistances from "@src/components/UnitCard_Resistances.svelte";
	import UnitCard_Drops from "@src/components/UnitCard_Drops.svelte";
	import RaritySelect from "@src/components/RaritySelect.svelte";
	import UnitInput from "@src/components/UnitInput.svelte";
	import DataComponent from "@src/components/DataComponent.svelte";
	import { STAT_NAMES, STAT_DISPLAY_NAMES, WEAPON_TYPES, lookupRows, getTable, isTableLoaded } from "@src/data";
	import { createActor, getUnitType, getUnitIdBase, isValidUnitConfiguration, getBlankEquipmentSet,
		getMaxRank, getMaxLevel, getPositionClass, getShardType, getCharaCards } from "@src/logic";
	import { hideImpossibleRarities, includeExSkillStats, dataSource } from "@src/settings.js";
	import { sortByAttr } from "@src/utils"

	const requiredTables = [ "unit_data", "experience_team", "chara_story_status", "unit_promotion",
		"skill_action", "skill_data", "unit_skill_data", "unit_rarity", "unit_promotion_status",
		"equipment_data", "equipment_enhance_rate", "story_detail", "unit_status_coefficient",
		"unit_attack_pattern", "enemy_parameter", "wave_group_data", "unit_enemy_data", "quest_data",
		"training_quest_data", "resist_data", "ailment_data", "fix_lineup_group_set", "quest_reward_data",
		"experience_unit", "skill_cost", "{clanBattleBossData}" ]

	let MAX_LEVEL = 1;
	let MAX_RANK = {
		rank: 1,
		equipment: {}
	}
	let dataLoaded = false;
	let charaCards = {};

	let options = {};
	$: options.includeExSkillStats = $includeExSkillStats;

	$: unitType = getUnitType(unit.id);
	$: bondIds = getBondIds(unit.id);
	let unitVariant;
	$: unitVariants = getUnitVariants(unit.id);
	$: setUnitVariant(unitVariant);

	function getUnitVariants(unitId) {
		if (!dataLoaded) return [];
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
				let clanBattleBossInfo;
				if (isTableLoaded("clan_battle_boss_group")) {
					clanBattleBossInfo = getTable("clan_battle_boss_group");
				}
				else {
					// TODO: JP clan battle boss data format
					clanBattleBossInfo = [];
				}
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
				let waves = getTable("wave_group_data");
				let wavesIn = [];
				waves.forEach(function(wave) {
					for (var i = 1; i <= 5; i++) {
						if (wave["enemy_id_" + i] === variant.enemy_id && wavesIn.indexOf(wave.wave_group_id) === -1) {
							wavesIn.push(wave.wave_group_id);
							return;
						}
					}
				});

				let quests = getTable("quest_data");
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
				let grottoQuests = getTable("training_quest_data");
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
		unit.rank = MAX_RANK.rank;
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

	function minAll() {
		unit.rarity = 1;
		unit.level = 1;
		unit.rank = 1;
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
		};
		unit.skills = {
			union_burst: 1,
			main_skill_1: 1,
			main_skill_2: 1,
			ex_skill_1: 1
		}
		for (var key in unit.bond) {
			unit.bond[key] = 0;
		}
	}

	function recalculate(unit, validConfig) {
		if (!dataLoaded) {
			return;
		}
		else if (validConfig) {
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
			if (unit.rank > MAX_RANK.rank) unit.rank = MAX_RANK.rank;
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
		if (typeof unit.skills === "object") {
			for (var skillName in unit.skills) {
				if (unit.skills[skillName] > unit.level) unit.skills[skillName] = unit.level;
				else if (unit.skills[skillName] < 1) unit.skills[skillName] = 1;
			}
		}
	}

	function resetEquipment() {
		unit.equipment = getBlankEquipmentSet();
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
			bond: {}
		}
		resetEquipment()
	}

	$: validConfig = validateConfig(unit, dataLoaded);
	$: actor = recalculate(unit, validConfig, options, dataLoaded);
	$: unitComments = getUnitComments(actor);
	$: unitName = getName(actor);

	function getBondIds(unitId) {
		if (!dataLoaded) return false;
		let charaGroup = charaCards[getUnitIdBase(unitId)];
		if (!charaGroup) return {};

		// If the user has the units at the same bond, attempt to carry it over when switching units
		let carryNumber = 0;
		Object.keys(unit.bond).forEach(function(key, i) {
			if (i === 0) {
				carryNumber = unit.bond[key];
			}
			else if (unit.bond[key] !== carryNumber) {
				carryNumber = 0;
			}
		});

		for (var storyGroup in unit.bond) {
			if (charaGroup.cards.indexOf(storyGroup) === -1) {
				delete unit.bond[storyGroup];
			}
		}
		charaGroup.cards.forEach(function(storyGroup) {
			let key = storyGroup + ""; // Need to force string keys. Number keys makes weird things happen
			if (unit.bond[key] === undefined) {
				unit.bond[key] = carryNumber;
			}
		});

		return charaGroup.cards;
	}

	function getName(actor) {
		if (actor && actor.name) {
			return actor.name;
		}
		else {
			return "Select a character...";
		}
	}

	function validateConfig(unit) {
		if (!dataLoaded) return true;
		constrainUnitConfig();
		return isValidUnitConfiguration(unit);
	}

	function getUnitComments(actor) {
		if (!validConfig) {
			return "Invalid unit configuration"
		}
		if (actor && actor.unitData) {
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

	function getPrefabId(actor) {
		if (!actor || !actor.unitData) {
			return null;
		}
		return actor.unitData.prefab_id;
	}

	function onDataReady() {
		MAX_LEVEL = getMaxLevel();
		MAX_RANK = getMaxRank();
		charaCards = getCharaCards();
		dataLoaded = true;
		validConfig = validateConfig(unit)
		if (!validateConfig) {
			resetAll();
		}
	}
</script>

<DataComponent requiredTables={requiredTables} onDataReady={onDataReady} >
	{#if dataLoaded}
	<div>
		<div class="unit-card-header">
			<div class="unit-card-inputs">
				<UnitInput bind:unitId={unit.id} rarity={unit.rarity} prefabId={getPrefabId(actor)} />
				<div class="unit-card-parameters">
					<div><strong>{unitName}</strong></div>
					{#if unitType === "character"}
					<table><tr>
						<td>
							<table>
								<tr><td>Rarity:</td><td><RaritySelect bind:rarity={unit.rarity} /></td></tr>
								<tr><td>Level:</td><td><input type="number" min=1 max={MAX_LEVEL} bind:value={unit.level} /></td></tr>
								<tr><td>Rank:</td><td><input type="number" min=1 max={MAX_RANK.rank} bind:value={unit.rank} on:change={resetEquipment} /></td></tr>
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
			{#if actor}
			<div class="unit-card-middlerow">
				{#if unitType === "character"}
				<div class="card-control">
					<div class="button card-control-button" on:click={maxAll}>Max all</div>
					<div class="button card-control-button" on:click={minAll}>Min all</div>
				</div>
				{/if}
				<div class="unit-card-general">
					<div class="unit-card-miscstats">
						{#if actor && actor.unitData}
							{#if unitType === "character"}
								<div class="miscstat">
									<span class="stat-label">Base rarity:</span>
									<span class="stat-number">{actor.unitData.rarity}</span>
								</div>
							{/if}
							<div class="miscstat">
								<span class="stat-label">Range:</span>
								<span class="stat-number">{actor.unitData.search_area_width}
									{#if unitType === "character"}
									({getPositionClass(actor.unitData.search_area_width)})
									{/if}
								</span>
							</div>
							<div class="miscstat">
								<span class="stat-label">Movement speed:</span>
								<span class="stat-number">{actor.unitData.move_speed}</span>
							</div>
						{/if}
						{#if unitType === "character" && actor && actor.config}
						<div class="miscstat">
							<span class="stat-label">Shard location:</span>
							<span class="stat-number">{getShardType(actor.config.id)}</span>
						</div>
						{/if}
<!-- 						<div class="miscstat">
							<span>Weapon type:</span>
							<span>{actor && actor.unitData ? WEAPON_TYPES[actor.unitData.se_type] : "???"}</span>
						</div class="miscstat"> -->
					</div>
					<div class="unit-card-description">
						{@html unitComments}
						{#if !validConfig}
						<a on:click={resetAll}>(reset)</a>
						{/if}
					</div>
				</div>
			</div>
			{/if}
		</div>
		{#if actor && unitType !== "???"}
		<div class="card-section-wrap">
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
		{/if}
	</div>
	{/if}
</DataComponent>

<style>
div.unit-card-header {
	padding-left: 10px;
}

div.unit-card-inputs {
}

div.unit-card-parameters {
	display: inline-block;
	vertical-align: top;
	padding-left: 10px;
}

div.unit-card-middlerow {
	margin-top: 20px;
	margin-bottom: 20px;
	display: flex;
}

div.card-control {
	min-width: 80px;
	margin-right: 20px;
}

div.card-control-button {
	padding: 5px;
}

div.card-control-button + div.card-control-button {
	margin-top: 5px;
}

div.unit-card-miscstats {
	margin-left: -5px;
	margin-top: -5px;
}

div.miscstat {
	background-color: #cfe4ff;
	border-radius: 5px;
	padding: 4px 6px;
	display: inline-block;
	margin-left: 5px;
	margin-top: 5px;
}

div.miscstat .stat-label {
	color: #477aca;
	font-weight: bold;
}

div.unit-card-description {
	margin-top: 5px;
}

.stat-label {
	padding-right: 10px;
	/*vertical-align: text-bottom;*/
}

.stat-number {
	font-family: monospace;
	font-size: 10pt;
	/*vertical-align: text-bottom;*/
}

td.bond-cell {
	padding-left: 20px;
}

img.char-image {
	width: 128px;
}
</style>