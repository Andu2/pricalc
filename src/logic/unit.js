import { getTable, lookupRows, STAT_NAMES, NUMBER_TO_STAT, cacheFunction } from "@src/data";
import { getUnitSkills } from "@src/logic/skill"
import { getMaxRank } from "@src/logic/item"
import { sortByAttr } from "@src/utils";

export function isValidUnitConfiguration(unitConfig) {
	if (typeof unitConfig !== "object") return false;
	if (typeof unitConfig.id !== "number") return false;

	let unitType = getUnitType(unitConfig.id);
	if (unitType === "???") {
		if (unitConfig.id === -1) {
			return true;
		}
		else {
			console.log("Unit ID " + unitConfig.id + " is unknown type");
			return false;
		}
	}

	if (unitType === "character" || unitType === "summon") {
		let unlockedUnits = getUnlockedUnits();
		let found = false;
		for (var i = 0; i < unlockedUnits.length; i++) {
			if (unlockedUnits[i].unit_id === unitConfig.id) {
				found = true;
				break;
			}
		}
		if (!found) return false;
	}
	else {
		if (lookupRows("unit_enemy_data", { unit_id: unitConfig.id }).length === 0) {
			return false;
		}
	}

	if (unitType === "character") {
		let configTypes = {
			rarity: "number",
			level: "number",
			rank: "number",
			equipment: "object",
			skills: "object",
			bond: "object"
		}
		for (let configAttr in configTypes) {
			if (typeof unitConfig[configAttr] !== configTypes[configAttr]) {
				return false;
			}
		}

		for (let slot = 1; slot <= 6; slot++) {
			if (typeof unitConfig.equipment["slot" + slot] !== "object") {
				return false;
			}
			else {
				if (typeof unitConfig.equipment["slot" + slot].equipped !== "boolean") return false;
				if (typeof unitConfig.equipment["slot" + slot].refine !== "number") return false;
			}
		}

		let requiredSkills = ["union_burst", "main_skill_1", "main_skill_2", "ex_skill_1"];
		for (let skillName of requiredSkills) {
			if (typeof unitConfig.skills[skillName] !== "number") return false;
		}

		for (let unitId in unitConfig.bond) {
			if (typeof unitConfig.bond[unitId] !== "number") return false;
		}
	}
	else if (unitType === "summon") {
		let configTypes = {
			rarity: "number",
			level: "number"
		}
		for (let configAttr in configTypes) {
			if (typeof unitConfig[configAttr] !== configTypes[configAttr]) {
				return false;
			}
		}
	}
	else if (unitType === "enemy" || unitType === "boss" || unitType === "shadow") {
		if (typeof unitConfig.enemyId !== "number") return false;
		if (lookupRows("enemy_parameter", { enemy_id: unitConfig.enemyId }).length === 0) {
			return false;
		}
	}

	return true;
}

// Create a new object with only the config we need for this unit type
function trimConfig(unitConfig) {
	let trimmedConfig = {
		id: unitConfig.id
	};

	let requiredConfig = {
		character: ["rarity", "level", "rank", "equipment", "skills", "bond"],
		summon: ["rarity", "level"],
		enemy: ["enemyId"],
		boss: ["enemyId"],
		shadow: ["enemyId"]
	}

	let unitType = getUnitType(unitConfig.id);
	if (unitType !== "???") {
		requiredConfig[unitType].forEach(function(configAttr) {
			trimmedConfig[configAttr] = unitConfig[configAttr];
		});
	}

	return trimmedConfig;
}

// skills: {
// 	union_burst: 1, 
// 	etc...
// }
// equipment: {
// 	slot1: {
// 		equipped: true,
// 		refine: 5
// 	},
// 	etc...
// }
// 1 = top left, 2 = top right, 3 = middle left, etc
export function createActor(unitConfig, options = {}) {
	//let startTime = Date.now();	
	if (!isValidUnitConfiguration(unitConfig)) {
		throw Error("Invalid unit configuration");
	}
	let config = trimConfig(unitConfig);
	let unitType = getUnitType(config.id);

	let actor = {
		type: unitType,
		config: config,
		options: options
	}

	if (unitType === "???") {
		return actor;
	}
	else if (unitType === "character" || unitType === "summon") {
		var unitData = lookupRows("unit_data", { unit_id: config.id })[0];
	}
	else {
		var unitData = lookupRows("unit_enemy_data", { unit_id: config.id })[0];

		var enemyData = lookupRows("enemy_parameter", { enemy_id: config.enemyId })[0];
		if (enemyData === undefined) {
			throw Error("Unable to find enemy id " + config.enemyId);
		}
		actor.enemyData = enemyData;

		let resistData = lookupRows("resist_data", { resist_status_id: enemyData.resist_status_id })[0];
		actor.resist = resistData;
	}
	if (!unitData) {
		throw Error("Unable to find unit id " + config.id);
	}
	actor.unitData = unitData;

	if (unitType === "character" || unitType === "summon") {
		actor.name = unitData.unit_name;
	}
	else {
		actor.name = enemyData.name;
	}

	var unitSkills = getUnitSkills(config.id);
	actor.skills = unitSkills;

	let statsBreakdown = {};
	if (unitType === "character") {
		let unitRarityData = lookupRows("unit_rarity", { unit_id: config.id, rarity: config.rarity }, {}, { cache: true })[0];
		let unitRankData = lookupRows("unit_promotion_status", { unit_id: config.id, promotion_level: config.rank }, {}, { cache: true })[0];
		let equipmentSet = lookupRows("unit_promotion", { unit_id: config.id, promotion_level: config.rank }, {}, { cache: true })[0];
		actor.rarityData = unitRarityData;
		actor.rankData = unitRankData;
		actor.equipmentSet = equipmentSet;

		statsBreakdown.base = getBaseStats(unitRarityData, config);
		statsBreakdown.rank = getRankStats(unitRankData);
		statsBreakdown.equipment = getEquipmentStats(equipmentSet, config);
		statsBreakdown.bond = getBondStats(config);
		statsBreakdown.exSkill = getExSkillStats(unitSkills, config);
	}
	else if (unitType === "summon") {
		let unitRarityData = lookupRows("unit_rarity", { unit_id: config.id, rarity: config.rarity })[0];
		statsBreakdown.base = getBaseStats(unitRarityData, config);
	}
	else if (unitType === "enemy" || unitType === "boss" || unitType === "shadow") {
		statsBreakdown.enemyStats = getEnemyStats(enemyData);
	}

	for (let statSource in statsBreakdown) {
		if (statSource === "exSkill" && !options.includeExSkillStats) continue;
		addStats(actor, statsBreakdown[statSource]);
	}
	actor.statsBreakdown = statsBreakdown;
	actor.power = calculatePower(actor);

	if (process.env.NODE_ENV === 'development') {
		console.log(actor);
	}
	//console.log((Date.now() - startTime) + " ms")
	return actor;
}

function getBaseStats(rarityData, config) {
	let stats = {};
	if (rarityData) {
		let effectiveLevel = config.level + (config.rank || 0);
		STAT_NAMES.forEach(function(stat) {
			stats[stat] = Math.round(rarityData[stat] + rarityData[stat + "_growth"] * effectiveLevel);
		});
	}
	return stats;
}

function getRankStats(rankData) {
	let stats = {};
	if (rankData) {
		STAT_NAMES.forEach(function(stat) {
			stats[stat] = rankData[stat];
		});
	}
	return stats;
}

function getEquipmentStats(equipmentSet, config) {
	let stats = {};
	for (var i = 1; i <= 6; i++) {
		var slot = config.equipment["slot" + i];
		if (slot.equipped && equipmentSet["equip_slot_" + i] !== 999999) {
			var equipmentData = lookupRows("equipment_data", { equipment_id: equipmentSet["equip_slot_" + i] }, {}, { cache: true })[0];
			if (equipmentData === undefined) {
				console.warn("Unable to find equipment data for equipment " + equipmentSet["equip_slot_" + i]);
			}
			else {
				STAT_NAMES.forEach(function(stat) {
					if (stats[stat] === undefined) {
						stats[stat] = 0;
					}
					stats[stat] += Math.ceil(equipmentData[stat]);
				});
				if (slot.refine > 0) {
					var refineData = lookupRows("equipment_enhance_rate", { equipment_id: equipmentSet["equip_slot_" + i] }, {}, { cache: true })[0];
					if (refineData === undefined) {
						console.warn("Unable to find refine data for equipment " + equipmentSet["equip_slot_" + i]);
					}
					else {
						var maxRefine = getMaxRefine(refineData);
						if (slot.refine > maxRefine) {
							//console.log("Cannot refine equipment id '" + equipmentSet["equip_slot_" + i] + "' to " + slot.refine + "; max refine is " + maxRefine);
							slot.refine = maxRefine;
						}
						STAT_NAMES.forEach(function(stat) {
							stats[stat] += Math.ceil(refineData[stat] * slot.refine);
						});
					}
				}
			}
		}
	}
	return stats;
}

function getBondStats(config) {
	let stats = {};
	for (var baseUnitIdString in config.bond) {
		let baseUnitId = baseUnitIdString * 1;
		var bondStories = lookupRows("story_detail", { story_group_id: baseUnitId }, {}, { cache: true });
		var unlockedStoryIds = bondStories.filter(function(story) {
			return (story.love_level <= config.bond[baseUnitId])
		}).map(function(story) {
			return story.story_id;
		});
		var storyStatData = lookupRows("chara_story_status", { story_id: unlockedStoryIds }, {}, { cache: true });
		storyStatData.forEach(function(storyStatus) {
			if (!storyAffectsUnit(storyStatus, config.id)) return;
			for (var i = 1; i <= 5; i++) {
				var stat = NUMBER_TO_STAT[storyStatus["status_type_" + i]];
				if (stat !== undefined) {
					if (stats[stat] === undefined) {
						stats[stat] = 0;
					}
					stats[stat] += storyStatus["status_rate_" + i];
				}
			}
		});
	}
	return stats;
}

function getExSkillStats(skillData, config) {
	let stats = {};
	if (config.rank >= 7 && config.skills.ex_skill_1) {
		if (config.rarity >= 5) {
			var exSkill = skillData.ex_skill_evolution_1;
		}
		else {
			var exSkill = skillData.ex_skill_1;
		}
		if (!exSkill.data) {
			console.warn("Unable to find ex skill for unit " + unitData.unit_name);
		}
		else {
			exSkill.actions.forEach(function(action) {
				if (action.action_type === 90) {
					var stat = NUMBER_TO_STAT[action.action_detail_1];
					if (stats[stat] === undefined) {
						stats[stat] = 0;
					}
					stats[stat] += action.action_value_2 + action.action_value_3 * config.skills.ex_skill_1;
				}
			});
		}
	}
	return stats;
}

function getEnemyStats(enemyData) {
	let stats = {};
	STAT_NAMES.forEach(function(stat) {
		stats[stat] = enemyData[stat];
	});
	return stats;
}

function addStats(stats1, stats2) {
	STAT_NAMES.forEach(function(statName) {
		if (stats1[statName] === undefined) {
			stats1[statName] = 0;
		}
		if (stats2[statName]) {
			stats1[statName] += stats2[statName];
		}
	});
}

export function storyAffectsUnit(charaStoryStatus, unitId) {
	let unitIdBase = getUnitIdBase(unitId);
	for (var i = 1; i <= 10; i++) {
		if (charaStoryStatus["chara_id_" + i] === unitIdBase) {
			return true;
		}
	}
	return false;
}

export function getMaxRefine(refineData) {
	if (!refineData || !refineData.promotion_level) return 0;
	if (refineData.promotion_level >= 4) {
		return 5;
	}
	else if (refineData.promotion_level === 3) {
		return 3;
	}
	else if (refineData.promotion_level === 2) {
		return 1;
	}
	else return 0;
}

export function calculatePower(actor) {
	var power = 0;

	if (!actor || !actor.unitData) return 0;

	let statsForPower = {};
	for (let statSource in actor.statsBreakdown) {
		if (statSource === "exSkill") continue;
		addStats(statsForPower, actor.statsBreakdown[statSource]);
	}

	var weights = lookupRows("unit_status_coefficient", {})[0]

	STAT_NAMES.forEach(function(stat) {
		power += statsForPower[stat] * weights[stat + "_coefficient"];
	});
	power = Math.round(power);

	if (actor.config.skills) {
		let sumSkills = 0;
		for (var skillName in actor.config.skills) {
			sumSkills += actor.config.skills[skillName];
		}
		power += weights.skill_lv_coefficient * sumSkills;
	}

	if (actor.config.rarity) {
		if (actor.config.rarity >= 5) {
			power += 150;
		}
		if (actor.config.rarity >= 6) {
			power += 2000;
			power += 5 * actor.union_burst;
		}
	}

	// if (actor.unique_equipment_unlocked) {
	// 	power += 100;
	// 	power += 2 * actor.main_skill_1;
	// }

	return power;
}

export function calculateEffectivePhysicalHp(actor) {
	var dodgeChance = actor.dodge / (1 + actor.dodge / 100) / 100;
	return actor.hp * (1 + actor.def / 100) / (1 - dodgeChance);
}

export function calculateEffectiveMagicHp(actor) {
	return actor.hp * (1 + actor.magic_def / 100);
}

export function getUnitType(unitId) {
	let unitTypeNum = 0;
	if (unitId >= 100000) {
		unitTypeNum = Math.floor(unitId / 100000);
	}
	else if (unitId >= 1000) {
		// base ID
		unitTypeNum = Math.floor(unitId / 1000);
	}
	if (unitTypeNum === 1) {
		return "character";
	}
	else if (unitTypeNum === 2) {
		return "enemy";
	}
	else if (unitTypeNum === 3) {
		return "boss";
	}
	else if (unitTypeNum === 4) {
		return "summon";
	}
	else if (unitTypeNum === 6) {
		return "shadow";
	}
	return "???";
}

// take a 6-digit unit ID, give a 4-digit
export function getUnitIdBase(unitId) {
	if (unitId < 10000) {
		return unitId;
	}
	else {
		return Math.floor(unitId / 100);
	}
}

export const getUnlockedUnits = cacheFunction(function getUnlockedUnits() {
	return getTable("unit_data").filter(function(unitData) {
		return (unitData.cutin_1 !== 0 && unitData.unit_id < 190000);
	}).sort(sortByAttr("unit_name"));
});

export const getSummonUnits = cacheFunction(function getSummonUnits() {
	return getTable("unit_data").filter(function(unitData) {
		// Summons: manual...there are copies of sylph that I don't want to include
		if (unitData.unit_id === 404201 || unitData.unit_id === 403101) {// summon
			return true;
		}
	}).sort(sortByAttr("unit_name"))
});

export function getBlankEquipmentSet() {
	return {
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

// Get unit ids that are associated with the same character. Uses base ids. 
// Requires table chara_story_status and unit_data
export const getCharaCards = cacheFunction(function getCharaCards() {
	let charaStoryStatus = getTable("chara_story_status");
	let baseCards = {};
	let charaCards = {}; // will map to a baseCard object

	let unlockedBaseIds = getUnlockedUnits().map(function(unitData) {
		return getUnitIdBase(unitData.unit_id);
	});

	// This assumes base cards come before outfits
	charaStoryStatus.forEach(function(storyStatus) {
		let baseId = storyStatus.chara_id_1;
		if (unlockedBaseIds.indexOf(baseId) === -1) return;
		let baseIdText = baseId + "";
		if (Object.keys(charaCards).indexOf(baseIdText) === -1) {
			baseCards[baseIdText] = {
				baseCard:  baseId,
				cards: [baseId]
			}
			charaCards[baseIdText] = baseCards[baseIdText];
		}
		for (var i = 2; i <= 10; i++) {
			let charId = storyStatus["chara_id_" + i];
			let charIdText = charId + "";
			if (charId === 0) break;
			if (unlockedBaseIds.indexOf(charId) === -1) continue;
			if (Object.keys(charaCards).indexOf(charIdText) === -1) {
				charaCards[charIdText] = baseCards[baseIdText];
				baseCards[baseIdText].cards.push(charId);
			}
		}
	});

	return charaCards;
});

export const getRankOptions = cacheFunction(function getRankOptions() {
	let maxRank = getMaxRank();

	const MIN_REASONABLE_RANK = 7;

	let rankOptions = [];
	for (var rank = MIN_REASONABLE_RANK; rank < maxRank.rank; rank++) {
		rankOptions.push({
			rank: rank,
			equipment: {
				slot1: true,
				slot2: true,
				slot3: true,
				slot4: true,
				slot5: true,
				slot6: true
			},
			numSlots: 6
		});
	}

	let numSlotsMaxRank = 0;
	for (var slot in maxRank.equipment) {
		if (maxRank.equipment[slot]) {
			numSlotsMaxRank++;
		}
	}
	rankOptions.push({
		rank: maxRank.rank,
		equipment: maxRank.equipment,
		numSlots: numSlotsMaxRank
	});

	return rankOptions;
});

export function getPositionClass(range) {
	if (range >= 600) {
		return "Back";
	}
	else if (range >= 300) {
		return "Middle";
	}
	else {
		return "Front";
	}
}

export function getTotalExp(level) {
	let expTable = getTable("experience_unit");
	if (!expTable[level - 1]) return 0;
	return expTable[level - 1].total_exp;
}
