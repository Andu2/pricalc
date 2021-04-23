import { UNLOCKED_UNITS } from "@src/data/priconnedb";
import { createActor, isValidUnitConfiguration, getUnitType } from "@src/logic/unit";

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
	offenseActors.forEach(function(actor) {
		actor.side = "offense";
		actor.moving = true;
	});
	let defenseActors = getSortedActors(defense);
	defenseActors.forEach(function(actor) {
		actor.side = "defense";
		actor.moving = true;
	});

	let battlefield = {
		offense: offenseActors,
		defense: defenseActors,
		skillQueue: []
	}

	setStartPositions(battlefield);

	return battlefield;
}

function getSortedActors(unitConfigs) {
	let actors = [];
	for (var slot in unitConfigs) {
		if (unitConfigs[slot] && unitConfigs[slot].id > -1 && isValidUnitConfiguration(unitConfigs[slot])) {
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

function setStartPositions(battlefield) {
	let missingOffense = 5 - battlefield.offense.length;
	let missingDefense = 5 - battlefield.defense.length;
	battlefield.offense.forEach(function(actor, i) {
		actor.position = 604 + 200 * (i + missingOffense);
		if (getUnitType(actor.config.id) === "boss") {
			// Bosses have larger "attack widths"?
			actor.position -= 300;
		}
	});
	battlefield.defense.forEach(function(actor, i) {
		actor.position = 604 + 200 * (i + missingDefense);
		if (getUnitType(actor.config.id) === "boss") {
			actor.position -= 300;
		}
	});

	var canCalculate = true;
	if (battlefield.defense.length === 0 || battlefield.defense.length === 1 && battlefield.defense[0].config.id === LIMA_ID) {
		canCalculate = false;
	}
	if (battlefield.offense.length === 0 || battlefield.offense.length === 1 && battlefield.offense[0].config.id === LIMA_ID) {
		canCalculate = false;
	}

	if (!canCalculate) {
		return false;
	}

	let someoneMoved = false;
	do {
		someoneMoved = false;
		if (advancePositions(battlefield.defense, battlefield.offense, battlefield.skillQueue)) someoneMoved = true;
		if (advancePositions(battlefield.offense, battlefield.defense, battlefield.skillQueue)) someoneMoved = true;
	} while (someoneMoved);
}

// returns true if someone moved
function advancePositions(movingActors, opposingActors, skillQueue) {
	let closestOpposingActor = 2160;
	opposingActors.forEach(function(actor) {
		let effectivePosition = actor.position;
		if (effectivePosition < closestOpposingActor) {
			closestOpposingActor = effectivePosition;
		}
	});

	let moved = false;
	movingActors.forEach(function(actor) {
		if (actor.position + closestOpposingActor > actor.unitData.search_area_width && actor.config.id !== LIMA_ID) {
			actor.moving = true;
		}
		if (actor.moving) {
			actor.position -= actor.unitData.move_speed * 1.6 / 60; // 60 fps, no idea where *1.6 comes from
			moved = true;
			if (actor.position + closestOpposingActor <= actor.unitData.search_area_width || actor.config.id === LIMA_ID) {	
				// Move to back of queue
				let queueIndex = skillQueue.indexOf(actor);
				if (queueIndex > -1) {
					skillQueue.splice(queueIndex, 1);
				}
				skillQueue.push(actor);
				actor.moving = false;
			}
		}
		
	});

	return moved;
}
