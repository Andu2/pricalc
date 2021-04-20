import { UNLOCKED_UNITS } from "@src/data/priconnedb";
import { createActor } from "@src/logic/unit";

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

export function createBattlefield(offense, defense) {
	let offenseActors = getSortedActors(offense);
	let defenseActors = getSortedActors(defense);

	setStartPositions(offenseActors, defenseActors);

	return {
		offense: offenseActors,
		defense: defenseActors
	}
}

function getSortedActors(unitConfigs) {
	let actors = [];
	for (var slot in unitConfigs) {
		if (unitConfigs[slot] && unitConfigs[slot].id > -1) {
			actors.push(createActor(unitConfigs[slot]));
		}
	}
	actors.sort(function(a, b) {
		if (a.unitData.search_area_width > b.unitData.search_area_width) return 1;
		else if (a.unitData.search_area_width < b.unitData.search_area_width) return -1;
		else return 0;
	});
	return actors;
}

const LIMA_ID = 105201;

function setStartPositions(offenseActors, defenseActors) {
	offenseActors.forEach(function(actor, i) {
		actor.position = 1000 + 200 * i;
	});
	defenseActors.forEach(function(actor, i) {
		actor.position = 1000 + 200 * i;
	});

	var canCalculate = true;
	if (defenseActors.length === 0 || defenseActors.length === 1 && defenseActors[0].config.id === LIMA_ID) {
		canCalculate = false;
	}
	if (offenseActors.length === 0 || offenseActors.length === 1 && offenseActors[0].config.id === LIMA_ID) {
		canCalculate = false;
	}

	if (!canCalculate) {
		return false;
	}

	let someoneMoved = false;
	do {
		someoneMoved = false;
		if (advancePositions(defenseActors, offenseActors)) someoneMoved = true;
		if (advancePositions(offenseActors, defenseActors)) someoneMoved = true;
	} while (someoneMoved);
}

// returns true if someone moved
function advancePositions(movingActors, opposingActors) {
	let closestOpposingActor = 2160;
	opposingActors.forEach(function(actor) {
		if (actor.position < closestOpposingActor) {
			closestOpposingActor = actor.position;
		}
	});

	let moved = false;
	movingActors.forEach(function(actor) {
		if (actor.config.id === LIMA_ID) return;
		if (actor.position + closestOpposingActor > actor.unitData.search_area_width) {
			actor.position -= 12;
			moved = true;
		}
	});

	return moved;
}
