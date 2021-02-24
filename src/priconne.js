import priconneDb from "./priconnedb.js";

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
export var NUMBER_TO_STAT = {
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

// skills: {
// 	union_burst: 1, 
// 	etc...
// }
// equipment: {
// 	slot1: {
// 		equipped: true,
// 		refine: 5,
// 		id: -1
// 	},
// 	etc...
// }
// 1 = top left, 2 = top right, 3 = middle left, etc
export function createActor(attrs) {
	var requiredAttrs = ["id", "rarity", "level", "rank", "equipment", "skills"];
	requiredAttrs.forEach(function(attr) {
		if (attrs[attr] === undefined) {
			throw Error("Cannot create unit: Missing required attribute: " + attr);
		}
	});

	var actor = {
		id: attrs.id,
		rarity: attrs.rarity,
		level: attrs.level,
		bond: attrs.bond,
		rank: attrs.rank,
		equipment: attrs.equipment,
		skills: attrs.skills
	}

	var unitData = lookupUnitData(attrs.id);
	if (unitData === null) {
		return actor;
	}
	var unitRarityStats = lookupUnitRarityStats(unitData.unit_id, attrs.rarity);

	actor.unitData = unitData;
	actor.unitRarityStats = unitRarityStats;

	// Stats based on: rarity, level, bond, rank, equipment
	STAT_NAMES.forEach(function(stat) {
		actor[stat] = unitRarityStats[stat] + unitRarityStats[stat + "_growth"] * (attrs.level + attrs.rank);
	});

	if (attrs.rank > 1) {
		var unitRankStats = lookupUnitRankStats(unitData.unit_id, attrs.rank);
		actor.unitRankStats = unitRankStats;
		STAT_NAMES.forEach(function(stat) {
			actor[stat] += unitRankStats[stat];
		});
	}

	var equipmentSet = lookupEquipmentSet(unitData.unit_id, attrs.rank);
	for (var i = 1; i <= 6; i++) {
		var slot = attrs.equipment["slot" + i];
		if (slot.equipped) {
			var equipmentData = lookupEquipmentData(equipmentSet["equip_slot_" + i]);
			if (equipmentData) {
				STAT_NAMES.forEach(function(stat) {
					actor[stat] += equipmentData[stat];
				});
				if (slot.refine) {
					var refineData = lookupRefineData(equipmentSet["equip_slot_" + i]);
					var maxRefine = getMaxRefine(refineData);
					if (slot.refine > maxRefine) {
						//console.log("Cannot refine equipment id '" + equipmentSet["equip_slot_" + i] + "' to " + slot.refine + "; max refine is " + maxRefine);
						slot.refine = maxRefine;
					}
					STAT_NAMES.forEach(function(stat) {
						actor[stat] += refineData[stat] * slot.refine;
					});
				}
			}
		}
	}
	var bondStats = lookupBondStats(unitData.unit_id, attrs.bond);
	STAT_NAMES.forEach(function(stat) {
		actor[stat] += bondStats[stat];
	});

	var unitSkills = lookupUnitSkills(attrs.id);

	if (attrs.includeExSkillStats) {
		// Action detail corresponds to stat numbers from bond boost?
		if (attrs.rank >= 7 && attrs.skills.ex_skill_1) {
			var exSkill = lookupSkillData(unitSkills.ex_skill_1);
			//console.log(exSkill)
			var exSkillActions = lookupActions(exSkill);
			exSkillActions.forEach(function(action) {
				//console.log(action)
				if (action.action_type === 90) {
					var stat = NUMBER_TO_STAT[action.action_detail_1];
					var amount = action.action_value_2 + action.action_value_3 * attrs.skills.ex_skill_1;
					actor[stat] += amount;
				}
			});
		}
	}
	
	return actor;
}

export function lookupUnitData(unitId) {
	var unitData = null;
	for (var i = 0; i < priconneDb.unit_data.length; i++) {
		if (priconneDb.unit_data[i].unit_id === unitId) {
			unitData = priconneDb.unit_data[i];
			break;
		}
	}
	if (unitData === null) {
		// throw Error("Unable to find unit '" + unitId + "'");
	}
	return unitData;
}

function lookupUnitRarityStats(unitId, rarity) {
	var unitRarityStats = null;
	for (var i = 0; i < priconneDb.unit_rarity.length; i++) {
		if (priconneDb.unit_rarity[i].unit_id === unitId && priconneDb.unit_rarity[i].rarity === rarity) {
			unitRarityStats = priconneDb.unit_rarity[i];
			break;
		}
	}
	if (unitRarityStats === null) {
		throw Error("Unable to find rarity stats for unit id '" + unitId + "' rarity " + rarity);
	}
	return unitRarityStats;
}

function lookupUnitRankStats(unitId, rank) {
	var unitRankStats = null;
	for (var i = 0; i < priconneDb.unit_promotion_status.length; i++) {
		if (priconneDb.unit_promotion_status[i].unit_id === unitId && priconneDb.unit_promotion_status[i].promotion_level === rank) {
			unitRankStats = priconneDb.unit_promotion_status[i];
			break;
		}
	}
	if (unitRankStats === null) {
		throw Error("Unable to find rank stats for unit id '" + unitId + "' rank " + rank);
	}
	return unitRankStats;
}

export function lookupEquipmentSet(unitId, rank) {
	var equipmentSet = null;
	for (var i = 0; i < priconneDb.unit_promotion.length; i++) {
		if (priconneDb.unit_promotion[i].unit_id === unitId && priconneDb.unit_promotion[i].promotion_level === rank) {
			equipmentSet = priconneDb.unit_promotion[i];
			break;
		}
	}
	if (equipmentSet === null) {
		//throw Error("Unable to find equipment set for unit id '" + unitId + "' rank " + rank);
	}
	return equipmentSet;
}

export function lookupEquipmentData(equipmentId) {
	var equipmentData = null;
	for (var i = 0; i < priconneDb.equipment_data.length; i++) {
		if (priconneDb.equipment_data[i].equipment_id === equipmentId) {
			equipmentData = priconneDb.equipment_data[i];
			break;
		}
	}
	if (equipmentData === null) {
		//throw Error("Unable to find equipment data for equipment id '" + equipmentId + "'");
	}
	return equipmentData;
}

export function lookupRefineData(equipmentId) {
	var refineData = null;
	for (var i = 0; i < priconneDb.equipment_enhance_rate.length; i++) {
		if (priconneDb.equipment_enhance_rate[i].equipment_id === equipmentId) {
			refineData = priconneDb.equipment_enhance_rate[i];
			break;
		}
	}
	if (refineData === null) {
		//throw Error("Unable to find refine data for equipment id '" + equipmentId + "'");
	}
	return refineData;
}

export function getMaxRefine(refineData) {
	if (!refineData) return 0;
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

function lookupBondStats(unitId, bond) {
	// I think the bond on alternate "outfits" affects all units of that character.
	// e.g. Summer Kokkoro bond boosts normal Kokkoro
	// Global doesn't have those yet, though. We'll worry about that later. TODO
	var shortUnitId = Math.floor(unitId / 100); // Stories seem to correlate to first part of unit ID
	var unlockedStoryIds = {};
	priconneDb.story_detail.forEach(function(story) {
		if (story.story_group_id === shortUnitId && story.love_level <= bond) {
			unlockedStoryIds[story.story_id] = true;
		}
	});
	var stats = {};
	STAT_NAMES.forEach(function(stat) {
		stats[stat] = 0;
	});
	
	priconneDb.chara_story_status.forEach(function(charaStory) {
		if (unlockedStoryIds[charaStory.story_id]) {
			for (var i = 1; i <= 5; i++) {
				var stat = NUMBER_TO_STAT[charaStory["status_type_" + i]];
				if (stat !== undefined) {
					stats[stat] += charaStory["status_rate_" + i];
				}
			}
		}
	});

	return stats;
}

export function lookupUnitSkills(unitId) {
	for (var i = 0; i < priconneDb.unit_skill_data.length; i++) {
		if (priconneDb.unit_skill_data[i].unit_id === unitId) {
			return priconneDb.unit_skill_data[i];
		}
	}
}

export function lookupSkillData(skillId) {
	if (skillId) {
		for (var i = 0; i < priconneDb.skill_data.length; i++) {
			if (priconneDb.skill_data[i].skill_id === skillId) {
				return priconneDb.skill_data[i];
			}
		}
	}
}

export function lookupActions(skillData) {
	var skillActions = [];
	if (skillData) {
		priconneDb.skill_action.forEach(function(skillAction) {
			for (var i = 1; i <= 7; i++) {
				if (skillAction.action_id === skillData["action_" + i]) {
					skillActions.push(skillAction)
				}
			}
		});
	}
	return skillActions;
}

export function calculatePower(unit) {
	var power = 0;

	power += 0.1 * (unit.hp + unit.wave_hp_recovery);
	power += 0.3 * (unit.wave_energy_recovery);
	power += 0.5 * (unit.physical_critical + unit.magic_critical);
	power += 1 * (unit.atk + unit.magic_str + unit.hp_recovery_rate);
	power += 1.5 * (unit.energy_recovery_rate);
	power += 2 * (unit.accuracy);
	power += 3 * (unit.energy_reduce_rate);
	power += 4.5 * (unit.def + unit.magic_def + unit.life_steal);
	power += 6 * (unit.dodge);

	power += 10 * (unit.skills.union_burst + unit.skills.main_skill_1 + unit.skills.main_skill_2 + unit.skills.ex_skill_1);

	if (unit.rarity >= 5) {
		power += 150;
	}
	if (unit.rarity >= 6) {
		power += 2000;
		power += 5 * unit.union_burst;
	}

	if (unit.unique_equipment_unlocked) {
		power += 100;
		power += 2 * unit.main_skill_1;
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

export function getUnlockedUnits() {
	return priconneDb.unit_data.filter(function(unit) {
		return unit.guild_id !== 0 && unit.cutin_1 !== 0;
	}).sort(function(a, b) {
		if (a.unit_name > b.unit_name) return 1;
		else if (a.unit_name < b.unit_name) return -1;
		else return 0;
	});
}

var units;
var unitResults;
var TESTS = 250;
function test1() {
	unlocked.units.sort();
	units = unlocked.units.map(function(unitName) {
		return createActor({
			name: unitName,
			rarity: 5,
			level: 80,
			bond: 8,
			rank: 7,
			equipment: {
				equip_slot_1: true,
				refine_slot_1: 5,
				equip_slot_2: true,
				refine_slot_2: 5,
				equip_slot_3: true,
				refine_slot_3: 5,
				equip_slot_4: true,
				refine_slot_4: 5,
				equip_slot_5: true,
				refine_slot_5: 5,
				equip_slot_6: true,
				refine_slot_6: 5
			},
			skills: {
				union_burst: 1,
				main_skill_1: 1,
				main_skill_2: 1,
				ex_skill_1: 1
			}
		});
	});

	//console.log = function(){};
	unitResults = {};
	units.forEach(function(attacker, i) {
		unitResults[attacker.name] = {};
		// for (var j = i + 1; j < units.length; j++) { // don't run same matchup in opposite direction, or mirrors
		for (var j = 0; j < units.length; j++) { // don't run same matchup in opposite direction, or mirrors
			var defender = units[j];
			var results = {
				win: 0,
				loss: 0,
				tie: 0
			}
			for (var i = 0; i < TESTS; i++) {
				var result = simpleBattle(attacker, defender);
				results[result]++;
			}
			unitResults[attacker.name][defender.name] = results;
		}
	});

	var resultTable = "<table>\n";
	resultTable += "<tr><th>unit</th>" + unlocked.units.map(function(unitName) {
		return "<th>" + unitName + "</th>";
	}).join("") + "</tr>\n";
	var skipCols = 1;
	for (var attacker in unitResults) {
		resultTable += "<tr>";
		resultTable += "<td>" + attacker + "</td>";
		// for (var i = 0; i < skipCols; i++) {
		// 	resultTable += "<td>-</td>";
		// }
		for (var defender in unitResults[attacker]) {
			var winRate = (unitResults[attacker][defender].win + 0.5 * unitResults[attacker][defender].tie) / TESTS;
			resultTable += "<td>" + winRate.toFixed(2) + "</td>";
		}
		resultTable += "</tr>\n";
		skipCols++;
	}
	resultTable += "</table><br />\n"
	resultTable += TESTS + " rounds per matchup";
	document.write(resultTable);
}
//test();

function test2() {
	var unlockedUnits = getUnlockedUnits();
	unlockedUnits.forEach(function(unit) {
		var r7 = createActor({
			id: unit.unit_id,
			rarity: 3,
			level: 50,
			rank: 7,
			equipment: {
				slot1: {
					equipped: true,
					refine: 0,
					id: -1
				},
				slot2: {
					equipped: true,
					refine: 0,
					id: -1
				},
				slot3: {
					equipped: true,
					refine: 0,
					id: -1
				},
				slot4: {
					equipped: true,
					refine: 0,
					id: -1
				},
				slot5: {
					equipped: true,
					refine: 0,
					id: -1
				},
				slot6: {
					equipped: true,
					refine: 0,
					id: -1
				}
			},
			skills: {
				union_burst: 1,
				main_skill_1: 1,
				main_skill_2: 1,
				ex_skill_1: 1
			}
		});

		var test = 2;

		var r8 = createActor({
			id: unit.unit_id,
			rarity: 3,
			level: 49,
			rank: 8,
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
			}
		});

		var dif = {};
		var log = false;

		STAT_NAMES.forEach(function(stat) {
			var difference = r8[stat] - r7[stat];
			dif[stat] = difference;
			if (difference !== 0) {
				log = true;
			}
		});

		if (log) {
			console.warn(unit.unit_name + ": DIFFERENCE", dif);
		}
		else {
			//console.log(unit.unit_name + ": No difference");
		}
	});
}

//test3();

function test5() {
	var unitId;
	var unlockedUnits = getUnlockedUnits();
	unlockedUnits.forEach(function(unitData) {
		if (unitData.unit_name === "Kuka") {
			unitId = unitData.unit_id;
		}
	});

	var testUnit = createActor({
		id: unitId,
		rarity: 5,
		level: 84,
		rank: 7,
		bond: 8,
		equipment: {
			slot1: {
				equipped: false,
				refine: 0,
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
		skills: {
			union_burst: 84,
			main_skill_1: 84,
			main_skill_2: 84,
			ex_skill_1: 84
		}
	});

	console.log(testUnit)
	// should be 9496

	return calculatePower(testUnit);
}

export var test = test5;