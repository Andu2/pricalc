import { lookupRows, STAT_NAMES, NUMBER_TO_STAT, getUnitSkills } from "@src/data/priconnedb";

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
export function createActor(attrs, options) {
	var requiredAttrs = ["id", "rarity", "level", "rank", "equipment", "skills"];
	requiredAttrs.forEach(function(attr) {
		if (attrs[attr] === undefined) {
			// throw Error("Cannot create unit: Missing required attribute: " + attr);
		}
	});

	options = options || {};

	// Copy attrs so we can fall through to defaults
	let attrsCopy = {};
	for (var key in attrs) {
		attrsCopy[key] = attrs[key];
	}

	if (typeof attrsCopy.rank !== "number") {
		attrsCopy.rank = 1;
	}
	if (typeof attrsCopy.level !== "number") {
		attrsCopy.level = 1;
	}
	if (typeof attrsCopy.bond !== "number") {
		attrsCopy.bond = 0;
	}

	let unitType = getUnitType(attrsCopy.id);

	var actor = {
		type: unitType,
		id: attrsCopy.id,
		rarity: attrsCopy.rarity,
		level: attrsCopy.level,
		bond: attrsCopy.bond,
		rank: attrsCopy.rank,
		equipment: attrsCopy.equipment,
		skills: attrsCopy.skills,
		includeExSkillStats: options.includeExSkillStats
	}

	if (unitType === "character") {
		var unitData = lookupRows("unit_data", { unit_id: attrsCopy.id })[0];
	}
	else {
		var unitData = lookupRows("unit_enemy_data", { unit_id: attrsCopy.id })[0];
		var enemyData = lookupRows("enemy_parameter", { unit_id: attrsCopy.id })[0];
		if (attrs.enemyId) {
			var variantData = lookupRows("enemy_parameter", { enemy_id: attrs.enemyId })[0];
			if (getUnitIdBase(enemyData.unit_id) === getUnitIdBase(variantData.unit_id)) {
				enemyData = variantData;
				attrs.id = variantData.unit_id;
				attrsCopy.id = variantData.unit_id;
			}
			else {
				attrs.enemyId = undefined;
			}
		}
		actor.enemyData = enemyData;
	}
	actor.unitData = unitData;
	if (unitData === undefined) {
		return actor;
	}

	if (unitType === "character") {
		actor.name = unitData.unit_name;
	}
	else {
		actor.name = enemyData.name;
	}

	var unitSkills = getUnitSkills(attrsCopy.id);
	actor.unitSkills = unitSkills;

	if (unitType === "character") {
		var unitRarityStats = lookupRows("unit_rarity", { unit_id: attrsCopy.id, rarity: attrsCopy.rarity })[0];
		actor.unitRarityStats = unitRarityStats;
		if (unitRarityStats === undefined) {
			return actor;
		}

		// Stats based on: rarity, level, bond, rank, equipment
		STAT_NAMES.forEach(function(stat) {
			actor[stat] = Math.round(unitRarityStats[stat] + unitRarityStats[stat + "_growth"] * (attrsCopy.level + attrsCopy.rank));
		});

		if (attrsCopy.rank > 1) {
			var unitRankStats = lookupRows("unit_promotion_status", { unit_id: attrsCopy.id, promotion_level: attrsCopy.rank })[0];
			actor.unitRankStats = unitRankStats;
			if (unitRarityStats === undefined) {
				console.warn("Unable to find rank data for unit " + unitData.unit_name + " rank " + attrsCopy.rank);
				return actor;
			}
			STAT_NAMES.forEach(function(stat) {
				actor[stat] += Math.ceil(unitRankStats[stat]);
			});
		}

		var equipmentSet = lookupRows("unit_promotion", { unit_id: attrsCopy.id, promotion_level: attrsCopy.rank })[0];
		actor.equipmentSet = equipmentSet;
		if (equipmentSet === undefined) {
			console.warn("Unable to find equipment set for unit " + unitData.unit_name + " rank " + attrsCopy.rank);
			return actor;
		}
		for (var i = 1; i <= 6; i++) {
			var slot = attrsCopy.equipment["slot" + i];
			if (slot.equipped && equipmentSet["equip_slot_" + i] !== 999999) {
				var equipmentData = lookupRows("equipment_data", { equipment_id: equipmentSet["equip_slot_" + i] })[0];
				if (equipmentData === undefined) {
					console.warn("Unable to find equipment data for equipment " + equipmentSet["equip_slot_" + i]);
				}
				else {
					STAT_NAMES.forEach(function(stat) {
						actor[stat] += Math.ceil(equipmentData[stat]);
					});
					if (slot.refine > 0) {
						var refineData = lookupRows("equipment_enhance_rate", { equipment_id: equipmentSet["equip_slot_" + i] })[0];
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
								actor[stat] += Math.ceil(refineData[stat] * slot.refine);
							});
						}
					}
				}
			}
		}

		// BOND TODO: Account for alternate outfits
		var shortUnitId = Math.floor(attrsCopy.id / 100); // Stories seem to correlate to first part of unit ID
		var bondStories = lookupRows("story_detail", { story_group_id: shortUnitId });
		var unlockedStoryIds = bondStories.filter(function(story) {
			return (story.love_level <= attrsCopy.bond)
		}).map(function(story) {
			return story.story_id;
		});
		var storyStatData = lookupRows("chara_story_status", { story_id: unlockedStoryIds });
		storyStatData.forEach(function(storyStatus) {
			for (var i = 1; i <= 5; i++) {
				var stat = NUMBER_TO_STAT[storyStatus["status_type_" + i]];
				if (stat !== undefined) {
					actor[stat] += storyStatus["status_rate_" + i];
				}
			}
		});

		actor.power = calculatePower(actor);

		if (options.includeExSkillStats) {
			// Action detail corresponds to stat numbers from bond boost?
			actor.statsFromExSkill = {};
			if (attrsCopy.rank >= 7 && attrsCopy.skills.ex_skill_1) {
				if (attrsCopy.rarity >= 5) {
					var exSkill = unitSkills.ex_skill_evolution_1;
				}
				else {
					var exSkill = unitSkills.ex_skill_1;
				}
				if (!exSkill.data) {
					console.warn("Unable to find ex skill for unit " + unitData.unit_name);
				}
				else {
					exSkill.actions.forEach(function(action) {
						if (action.action_type === 90) {
							var stat = NUMBER_TO_STAT[action.action_detail_1];
							var amount = action.action_value_2 + action.action_value_3 * attrsCopy.skills.ex_skill_1;
							actor[stat] += amount;
							if (actor.statsFromExSkill[stat] === undefined) {
								actor.statsFromExSkill[stat] = 0;
							}
							actor.statsFromExSkill[stat] += amount;
						}
					});
				}
			}
		}
	}
	else {
		STAT_NAMES.forEach(function(stat) {
			actor[stat] = enemyData[stat];
		});

		actor.power = calculatePower(actor);

		let resistData = lookupRows("resist_data", { resist_status_id: enemyData.resist_status_id })[0];
		actor.resistData = resistData;
	}
	console.log(actor);
	
	return actor;
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

	if (!actor.unitData) return 0;

	// TODO: do this in a less dumb way
	if (actor.includeExSkillStats && actor.statsFromExSkill) {
		for (var stat in actor.statsFromExSkill) {
			actor[stat] -= actor.statsFromExSkill[stat];
		}
	}

	var weights = lookupRows("unit_status_coefficient", {})[0]

	STAT_NAMES.forEach(function(stat) {
		power += actor[stat] * weights[stat + "_coefficient"];
	});
	power = Math.round(power);

	power += weights.skill_lv_coefficient * (actor.skills.union_burst + actor.skills.main_skill_1 + actor.skills.main_skill_2 + actor.skills.ex_skill_1);

	if (actor.rarity >= 5) {
		power += 150;
	}
	if (actor.rarity >= 6) {
		power += 2000;
		power += 5 * actor.union_burst;
	}

	if (actor.unique_equipment_unlocked) {
		power += 100;
		power += 2 * actor.main_skill_1;
	}

	if (actor.includeExSkillStats && actor.statsFromExSkill) {
		for (var stat in actor.statsFromExSkill) {
			actor[stat] += actor.statsFromExSkill[stat];
		}
	}

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
	else if (unitTypeNum === 6) {
		return "shadow";
	}
	return "???";
}

// take a 6-digit unit ID, give a 4-digit
export function getUnitIdBase(unitId) {
	return Math.floor(unitId / 100);
}

function initUnitForBattle(unit) {
	unit.currentHp = unit.hp;
	unit.currentEnergy = 0;
}

function isDodge(attackingUnit, defendingUnit) {
	if (attackingUnit.atk_type === 1) { // physical
		var effectiveDodge = Math.max(0, defendingUnit.dodge - attackingUnit.accuracy);
		var dodgeChance = (effectiveDodge / (1 + effectiveDodge / 100)) / 100;
		// "the spreadsheet" says that dodge is affected by difference in level; this would be very hard to confirm
		// without looking at the code. TODO: Need to confirm somehow.
		dodgeChance *= defendingUnit.level / attackingUnit.level;
		var isDodge = (Math.random() < dodgeChance);
		if (dodgeChance > 0) {
			//console.log("Dodge chance: " + dodgeChance.toFixed(2) + "; dodge: " + isDodge);
		}
		return isDodge;
	}
	else {
		// magic never misses
		return false;
	}
}

function isCrit(attackingUnit, defendingUnit) {
	if (attackingUnit.atk_type === 1) { // physical
		var critChance = attackingUnit.physical_critical * 0.05 / 100;
	}
	else {
		var critChance = attackingUnit.magic_critical * 0.05 / 100;
	}
	// "the spreadsheet" says that dodge is affected by difference in level; this would be very hard to confirm
	// without looking at the code. TODO: Need to confirm somehow.
	critChance *= attackingUnit.level / defendingUnit.level;
	var isCrit = (Math.random() < critChance);
	if (critChance > 0) {
		//console.log("Crit chance: " + critChance.toFixed(2) + "; crit: " + isCrit);
	}
	return isCrit;
}

function doAttack(attackingUnit, defendingUnit) {
	//console.log(attackingUnit.name + " attacks " + defendingUnit.name);
	if (attackingUnit.atk_type !== 1 && attackingUnit.atk_type !== 2) {
		throw Error("Invalid atk_type on attacking unit: " + attackingUnit.atk_type);
	}
	if (!isDodge(attackingUnit, defendingUnit)) {
		var damage = getAttackDamage(attackingUnit, defendingUnit);
		defendingUnit.currentHp = Math.max(0, defendingUnit.currentHp - damage);
		//console.log(damage.toFixed(0) + " damage; " + defendingUnit.name + " now has " + defendingUnit.currentHp.toFixed(0) + " hp");
		if (defendingUnit.currentHp <= 0) {
			//console.log(defendingUnit.name + " dies");
		}
	}
}

function getAttackDamage(attackingUnit, defendingUnit) {
	if (attackingUnit.atk_type === 1) { // physical
		var damage = attackingUnit.atk / (1 + defendingUnit.def / 100);
	}
	else {
		var damage = attackingUnit.magic_str / (1 + defendingUnit.magic_def / 100);
	}
	if (isCrit(attackingUnit, defendingUnit)) {
		damage *= 2;
	}

	return damage;
}

// no skills, no cast time, simultaneous attacks
function simpleBattle(attacker, defender) {
	initUnitForBattle(attacker);
	initUnitForBattle(defender);
	do {
		doAttack(attacker, defender);
		doAttack(defender, attacker);
	} while (attacker.currentHp > 0 && defender.currentHp > 0);
	if (attacker.currentHp <= 0 && defender.currentHp <= 0) {
		return "tie"
	}
	else if (attacker.currentHp <= 0) {
		return "loss"
	}
	else {
		return "win"
	}
}
