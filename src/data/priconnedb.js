import equipment_data from "@src/data/tables/equipment_data.csv";
import equipment_enhance_rate from "@src/data/tables/equipment_enhance_rate.csv";
import unit_attack_pattern from "@src/data/tables/unit_attack_pattern.csv";
import unit_data from "@src/data/tables/unit_data.csv";
import unit_promotion from "@src/data/tables/unit_promotion.csv";
import unit_promotion_status from "@src/data/tables/unit_promotion_status.csv";
import unit_rarity from "@src/data/tables/unit_rarity.csv";
import unit_skill_data from "@src/data/tables/unit_skill_data.csv";
import skill_data from "@src/data/tables/skill_data.csv";
import skill_action from "@src/data/tables/skill_action.csv";
import chara_story_status from "@src/data/tables/chara_story_status.csv";
import story_detail from "@src/data/tables/story_detail.csv";
import unit_status_coefficient from "@src/data/tables/unit_status_coefficient.csv";
import experience_team from "@src/data/tables/experience_team.csv";
import arena_max_rank_reward from "@src/data/tables/arena_max_rank_reward.csv";
import arena_max_season_rank_reward from "@src/data/tables/arena_max_season_rank_reward.csv";
import arena_daily_rank_reward from "@src/data/tables/arena_daily_rank_reward.csv";
import unit_profile from "@src/data/tables/unit_profile.csv";
import enemy_parameter from "@src/data/tables/enemy_parameter.csv";
import unit_enemy_data from "@src/data/tables/unit_enemy_data.csv";
import resist_data from "@src/data/tables/resist_data.csv";
import ailment_data from "@src/data/tables/ailment_data.csv";
import quest_data from "@src/data/tables/quest_data.csv";
import wave_group_data from "@src/data/tables/wave_group_data.csv";
import enemy_reward_data from "@src/data/tables/enemy_reward_data.csv";
import item_data from "@src/data/tables/item_data.csv";
import clan_battle_boss_group from "@src/data/tables/clan_battle_boss_group.csv";
import clan_battle_map_data from "@src/data/tables/clan_battle_map_data.csv";
import clan_battle_period from "@src/data/tables/clan_battle_period.csv";
import clan_battle_boss_fix_reward from "@src/data/tables/clan_battle_boss_fix_reward.csv";
import training_quest_data from "@src/data/tables/training_quest_data.csv";

import { sortByAttr } from "@src/utils";

const tables = {
	equipment_data,
	equipment_enhance_rate,
	unit_attack_pattern,
	unit_data,
	unit_promotion,
	unit_promotion_status,
	unit_rarity,
	unit_skill_data,
	skill_data,
	skill_action,
	chara_story_status,
	story_detail,
	unit_status_coefficient,
	experience_team,
	arena_max_rank_reward,
	arena_max_season_rank_reward,
	arena_daily_rank_reward,
	unit_profile,
	unit_enemy_data,
	enemy_parameter,
	resist_data,
	ailment_data,
	quest_data,
	wave_group_data,
	enemy_reward_data,
	item_data,
	clan_battle_boss_group,
	clan_battle_map_data,
	clan_battle_period,
	clan_battle_boss_fix_reward,
	training_quest_data
}

export const MAX_LEVEL = experience_team.slice(-1)[0].team_level - 1; // Database has one more than current max level

let maxRankFound = 0;
let maxEquipmentFound = {};
(function() {
	unit_promotion.forEach(function(row) {
		if (row.promotion_level > maxRankFound) {
			maxRankFound = row.promotion_level;
			for ( var i = 1; i <= 6; i++) {
				maxEquipmentFound["slot" + i] = (row["equip_slot_" + i] !== 999999);
			}
		}
	});
})();
export const MAX_RANK = maxRankFound;
export const MAX_RANK_EQUIPMENT = maxEquipmentFound;


export const UNLOCKED_UNITS = (unit_data.filter(function(unit) {
	return unit.guild_id !== 0 && unit.cutin_1 !== 0;
}).sort(sortByAttr("unit_name")));

export const SUMMON_UNITS = (unit_data.filter(function(unit) {
	// Summons: manual...there are copies of sylph that I don't want to include
	if (unit.unit_id === 404201 || unit.unit_id === 403101) {// summon
		return true;
	}
}).sort(sortByAttr("unit_name")));

export const DROPPABLE_ITEMS = getDroppableItems();

export const STAT_NAMES = ["hp", "atk", "magic_str", "def", "magic_def", "physical_critical", "magic_critical", 
	"wave_hp_recovery", "wave_energy_recovery", "dodge", //"physical_penetrate", "magic_penetrate",
	"life_steal", "hp_recovery_rate", "energy_recovery_rate", "energy_reduce_rate", "accuracy"];

export const STAT_DISPLAY_NAMES = {
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

export const SKILL_NAMES = ["union_burst", "main_skill_1", "main_skill_2", "ex_skill_1"];

// Stats are referenced by number throughout the database
export const NUMBER_TO_STAT = {
	1: "hp",
	2: "atk",
	3: "def",
	4: "magic_str",
	5: "magic_def",
	6: "physical_critical",
	7: "magic_critical",
	8: "dodge",
	9: "life_steal", // TODO: confirm ("HP absorption" in the wiki???)
	10: "hp", // 1 and 10 both hp???
	11: "wave_energy_recovery",
	14: "don't know" // TODO. Christina has it.
}

let lookupCache = {};
export function lookupRows(tableName, constraints, calculated = {}, options = {}) {
	if (tables[tableName] === undefined) {
		console.warn("Invalid table name for lookup: " + tableName);
		return [];
	}
	let serializedInputs = tableName + JSON.stringify(constraints);
	if (options.cache) {
		if (Object.keys(calculated).length > 0) {
			console.warn("Cache does not work with calculated");
			options.cache = false;
		}
		else {
			if (lookupCache[serializedInputs] !== undefined) {
				return lookupCache[serializedInputs];
			}
		}	
	}
	let returnRows = tables[tableName].filter(function(row) {
		for (var column in constraints) {
			if (typeof calculated[column] === "function") {
				if (constraints[column] !== calculated[column](row)) return false;
			}
			else if (constraints[column] instanceof Array) {
				if (constraints[column].indexOf(row[column]) === -1) return false;
			}
			else {
				if (row[column] !== constraints[column]) return false;
			}
		}
		return true;
	});
	if (options.cache) {
		lookupCache[serializedInputs] = returnRows;
	}
	return returnRows;
}

// Shorthand for complex skills/actions lookup
let cachedUnitSkills = {}
export function getUnitSkills(unitId) {
	if (cachedUnitSkills[unitId] !== undefined) {
		return cachedUnitSkills[unitId];
	}

	let unitSkills = {};
	let skillsToLookup = SKILL_NAMES.concat(["ex_skill_evolution_1"]);
	skillsToLookup.forEach(function(skillName) {
		unitSkills[skillName] = {
			type: skillName,
			data: null,
			actions: []
		}
	});

	let unitSkillData = lookupRows("unit_skill_data", { unit_id: unitId }, {}, { cache: true })[0];
	if (unitSkillData === undefined) {
		console.warn("Unable to get skill data for unit id " + unitId);
		return unitSkills;
	}

	// skills
	tables.skill_data.forEach(function(skillData) {
		for (var skillName in unitSkillData) {
			if (skillName === "unit_id") continue;
			if (skillData.skill_id === unitSkillData[skillName]) {
				if (!unitSkills[skillName]) {
					unitSkills[skillName] = {
						type: skillName,
						data: null,
						actions: []
					}
				}
				unitSkills[skillName].data = skillData;
			}
		}
	});

	// actions
	tables.skill_action.forEach(function(skillAction) {
		for (var skillName in unitSkills) {
			if (unitSkills[skillName].data) {
				for (var i = 1; i <= 7; i++) {
					if (skillAction.action_id === unitSkills[skillName].data["action_" + i]) {
						unitSkills[skillName].actions.push(skillAction)
					}
				}
			}
		}
	});

	cachedUnitSkills[unitId] = unitSkills;

	return unitSkills;
}

function getDroppableItems() {
	let items = [];

	let quests = lookupRows("quest_data", {});
	quests.forEach(function(quest) {
		for (var waveNum = 1; waveNum <= 3; waveNum++) {
			let wave = lookupRows("wave_group_data", { wave_group_id: quest["wave_group_id_" + waveNum]})[0];
			for (var enemyNum = 1; enemyNum <= 5; enemyNum++) {
				let rewardId = wave["drop_reward_id_" + enemyNum];
				if (rewardId > 0) {
					let rewardData = lookupRows("enemy_reward_data", { drop_reward_id: rewardId })[0];
					for (var rewardNum = 1; rewardNum <= 5; rewardNum++) {
						if (items.indexOf(rewardData["reward_id_" + rewardNum]) === -1) {
							items.push(rewardData["reward_id_" + rewardNum])
						}
					}
				}
			}
		}
	});

	return items;
}
