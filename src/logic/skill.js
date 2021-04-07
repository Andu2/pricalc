import { NUMBER_TO_STAT, STAT_DISPLAY_NAMES, lookupRows } from "@src/data/priconnedb";

// action 8 is speed manip
const action8Detail = {
	1: "Slow",
	2: "Haste",
	3: "Paralyze",
	4: "Freeze",
	5: "Bind",
	6: "Sleep",
	7: "Stun",
	8: "Petrify",
	9: "Confine"
}
const action9Detail = {
	0: "Confine Damage",
	1: "Poison",
	2: "Burn",
	3: "Curse"
}

function getActionAtkType(action) {
	if (action.action_detail_1 === 2) {
		return "magic_str";
	}
	else if (action.action_detail_1 === 1) {
		return "atk";
	}
	else return "atk"; // for safety
}

export function describeEffect(action, actor, level) {
	// action detail 2 = follow up action?
	var replaceVal = "???";
	var description = "";

	// For those actions that use it
	var actionStat = getActionAtkType(action);

	if (action.action_type === 1) {
		// damage. val 1 = base, val 2 = per level, val 3 = attack mult
		let describeStat = "physical"
		if (actionStat === "magic_str") {
			describeStat = "magic";
		}
		description = "{0} " + describeStat + " damage.";
		replaceVal = Math.round(action.action_value_1 + action.action_value_2 * level + action.action_value_3 * actor[actionStat]);
	}
	else if (action.action_type === 2) {
		// detail 1 = move to range of target
		// detail 5 = some kind of gradual move (Mimi UB, Lima skill 1)
		// I have no clue honestly why Mimi permanently moves but others don't
		// Enemies move up to Mimi while she's doing her animation, but not to others who have an animation where they move back
		// see Kaori: https://www.youtube.com/watch?v=WQQU6E0UPcE
		if (action.action_detail_1 === 1) {
			if (action.target_range === -1 || action.target_type !== 3) {
				description = "Temporarily move to range " + action.action_value_1 + " of target.";
			}
			else {
				description = "Permanently move to range " + action.action_value_1 + " of target.";
			}
		}
	}
	else if (action.action_type === 3) {
		// knockback
		if (action.action_detail_1 === 3) {
			if (action.action_value_3 > 250) { // I have no idea why this is. But Lima's UB does NOT have knockback despite having this action
				description = "Knockback " + action.action_value_1 + "."
			}
		}
	}
	else if (action.action_type === 4) {
		// heal
		if (action.action_value_1 === 2) {
			// Percentage heal
			description = "Heal " + action.action_value_2 + "% of max health.";
		}
		else {
			description = "Heal {0}.";
			replaceVal = Math.round((action.action_value_2 + action.action_value_3 * level + action.action_value_4 * actor[actionStat]) 
				* (1 + actor.hp_recovery_rate / 100));
		}
	}
	else if (action.action_type === 6) {
		// barrier
		let describeStat = "physical"
		let mechanism = "blocks";
		if (action.action_detail_1 === 2 || action.action_detail_1 === 4) {
			describeStat = "magic";
		}
		else if (action.action_detail_1 === 6) {
			describeStat = "physical and magic";
		}
		if (action.action_detail_1 === 3 || action.action_detail_1 === 4 || action.action_detail_1 === 6) {
			mechanism = "absorbs"
		}
		replaceVal = Math.round(action.action_value_1 + action.action_value_2 * level);
		description = "Deploy barrier that " + mechanism + " up to {0} " + describeStat + " damage for " + action.action_value_3 + " seconds.";
	}
	else if (action.action_type === 7) {
		description = "Change target."
	}
	else if (action.action_type === 8) {
		// action speed change, including stun
		// val 3 = stun base time
		if (action.action_value_1 > 0) {
			description = "Multiply action speed by " + action.action_value_1
		}
		else {
			description = action8Detail[action.action_detail_1];
		}
		description += " for " + Math.round((action.action_value_3 + action.action_value_4 * level) * 100) / 100 + " seconds.";
	}
	else if (action.action_type === 9) {
		// poison, val 1 = base, val 2 = per level, val 3 = time
		description = action9Detail[action.action_detail_1] + " {0} for " + action.action_value_3 + " seconds.";
		replaceVal = Math.round(action.action_value_1 + action.action_value_2 * level)
	}
	else if (action.action_type === 10) {
		// buff. val 2 = base, val 3 = per level, val 4 = time
		let isDebuff = (action.action_detail_1 % 2 === 1);
		let stat = NUMBER_TO_STAT[Math.floor(action.action_detail_1 / 10) + 1];
		description = (isDebuff ? "Lowers " : "Raises ") + STAT_DISPLAY_NAMES[stat] + " by {0}"
		if (action.action_value_1 === 2) {
			description += "%" 
		}
		description += " for " + Math.round((action.action_value_4 + action.action_value_5 * level) * 100) / 100 + " seconds.";
		replaceVal = Math.round(action.action_value_2 + action.action_value_3 * level);
	}
	else if (action.action_type === 11) {
		// charm
		description = "Charm for " + action.action_value_1 + " seconds.";
	}
	else if (action.action_type === 12) {
		//blind
		description = "Blind - cause " + (100 - action.action_detail_1) + "% miss chance on physical attacks for " + action.action_value_1 + " seconds."
	}
	else if (action.action_type === 13) {
		// silence
		description = "Silence for " + action.action_value_1 + " seconds."
	}
	else if (action.action_type === 15) {
		let summonData = lookupRows("unit_data", { unit_id: action.action_detail_2 })[0];
		if (summonData) {
			description = "Summon " + summonData.unit_name + ".";
		}
		else {
			description = "Summon.";
		}
	}
	else if (action.action_type === 16) {
		// TP
		let direction = "Boost";
		if (action.action_detail_1 === 2) {
			direction = "Reduce";
		}
		description = direction + " TP by {0}.";
		replaceVal = Math.round(action.action_value_1 + action.action_value_2 * level);
	}
	else if (action.action_type === 17) {
		// HP activation
		description = "Activates when below " + action.action_value_3 + "% HP.";
	}
	else if (action.action_type === 18) {
		if (action.action_detail_2 === 100300302) {
			 // Rei
			description = "Charge " + action.action_value_3 + " seconds, then deal additional damage equal to " + action.action_value_1 + " times damage taken.";
		}
	}
	else if (action.action_type === 20) {
		// taunt
		description = "Taunt for " + (action.action_value_1 + action.action_value_2 * level) + " seconds.";
	}
	else if (action.action_type === 21) {
		// ghostie/lima/annasplosion
		var time = action.action_value_1 + action.action_value_2 * level;
		if (time > 0) {
			description = "Invulnerable for " + (action.action_value_1 + action.action_value_2 * level) + " seconds.";
		}
	}
	else if (action.action_type === 22) {
		// Some kind of percentage damage buff on a skill?
		for (var skillName in actor.skills) {
			if (actor.skills[skillName].data && actor.skills[skillName].data.skill_id === action.action_detail_2) {
				let buffSkillName = actor.skills[skillName].data.name;
				if (!buffSkillName) {
					buffSkillName = skillName;
				}
				description = "Some sort of buff to skill " + buffSkillName + "?"
			}
		}
	}
	else if (action.action_type === 23) {
		if (action.action_detail_1 === 999) {
			// Cyclops
			description = "(Trigger an action if target has full HP)"	
		}
		else if (action.action_detail_1 === 100) {
			// Mesarthim
			description = "(Trigger an action if target is bound)"	
		}
	}
	else if (action.action_type === 26) {
		// Saren's berserk
		description = "Deal damage equal to " + action.action_value_2 + " times missing HP."
	}
	else if (action.action_type === 27) {
		description = "(Trigger an action after killing an enemy)"
	}
	else if (action.action_type === 28) {
		// Suzume's chance-based action branching
		if (action.action_detail_2 === 102500103) {
			description = "Choose action based on " + action.action_detail_1 + "% chance to \"succeed\".";
		}
		else if (action.action_detail_1 === 1211) {
			description = "(Choose an action depending on whether a Union Burst has been used.)"
		}
	}
	else if (action.action_type === 30) {
		//death
		description = "Instant death.";
	}
	else if (action.action_type === 32) {
		// Akari's HP Drain thing
		//val 1 = base, val 2 = per level, val 3 = attack mult
		description = "Increases HP drain by " + Math.round(action.action_value_1 + action.action_value_2 * level + action.action_value_3)
			+ " on next attack."
	}
	else if (action.action_type === 34) {
		// Kaori's added damage
		//val 1 = base, val 2 = per level, val 3 = attack mult
		//replaceVal = Math.round(action.action_value_1 + action.action_value_2 * level + action.action_value_3);
		description = "The target takes {0} more damage from Kaori per attack for each time Kaori has attacked them, up to 5 times."
		replaceVal = Math.round(action.action_value_1 + action.action_value_2 * level);
	}
	else if (action.action_type === 37) {
		// Akino's HP regen thing
		// value 1 = base, value 2 = per level, value 3 = per atk, value 5 = duration, value 7 = range
		var stat = "atk";
		if (actor.unitData.atk_type === 2) {
			stat = "magic_str"
		}
		replaceVal = Math.round(action.action_value_1 + action.action_value_2 * level + action.action_value_3 * actor[stat]);
		description = "Deploy a field with radius " + action.action_value_7 + " which heals allies by {0} per second for " + action.action_value_5 + " seconds.";
	}
	else if (action.action_type === 38) {
		// Mitsuki's debuff area
		replaceVal = Math.round(action.action_value_1 + action.action_value_2 * level);
		description = "Deploy a field with radius " + action.action_value_5 + " which reduces enemy defense by {0} for " + action.action_value_3 + " seconds.";
	}
	else if (action.action_type === 42) {
		// Akino
		description = "(Queue an action if attacked)"
	}
	else if (action.action_type === 44) {
		// Lima
	}
	else if (action.action_type === 45) {
		// Arisa - noting that UB has been used
		//description = "(Trigger changes to actions based on UB having been used)"
	}
	else if (action.action_type === 46) {
		// Ziz percent HP based damage
		let describeStat = "physical"
		if (action.action_detail_2 === 2) {
			describeStat = "magic";
		}
		description = "Deal " + describeStat + " damage equal to {0}% of max HP.";
		replaceVal = action.action_value_1;
	}
	else if (action.action_type === 47) {
		// Ziz/Alma random area damage
		var stat = "atk";
		let describeStat = "physical"
		if (action.action_detail_1 === 2) {
			stat = "magic_str"
			describeStat = "magic";
		}

		// ???????
		description = "Deal {0} " + describeStat + " damage.";

		replaceVal = Math.round(action.action_value_1 + action.action_value_2 * level + action.action_value_3 * actor[stat]);
	}
	else if (action.action_type === 48) {
		// Misato HP regen
		description = "Grant {0} HP regen per second for " + action.action_value_5 + " seconds.";
		replaceVal = Math.round((action.action_value_1 + action.action_value_2 * level + action.action_value_3 * actor[actionStat]) 
			* (1 + actor.hp_recovery_rate / 100)) + "?";
	}
	else if (action.action_type === 90) {
		// skill boost. val 2 = base, val 3 = per level
		let stat = NUMBER_TO_STAT[action.action_detail_1]
		let statDisplay = STAT_DISPLAY_NAMES[stat];
		replaceVal = Math.round(action.action_value_2 + action.action_value_3 * level)
		description = "Permanently increase " + statDisplay + " by {0}."
	}

	// Differentiate between our description and the given description
	if (action.description) {
		description = action.description + "\n" + description;
	}
	description = description.replace(/\{0\}/g, replaceVal);
	return description;
}

export function describeTarget(action) {
	// Converting these to strings mostly just to make notes of what I've figured out

	let targetSide = "???";
	if (action.target_assignment === 1) {
		targetSide = "enemy"
	}
	else if (action.target_assignment === 2) {
		targetSide = "ally";
	}

	let targetCenter = "???";
	if (action.target_area === 1) {
		// range is from self
		targetCenter = "self";
	}
	else if (action.target_area === 2) {
		// range is from target
		targetCenter = "target";
	}
	else if (action.target_area === 3) {
		targetCenter = "all";
	}

	let targetType = "???";
	if (action.target_type === 0) {
		targetType = "ex skill";
	}
	else if (action.target_type === 1) {
		targetType = "current target";
	}
	else if (action.target_type === 2) {
		targetType = "random";
	}
	else if (action.target_type === 3) {
		targetType = "closest";
	}
	else if (action.target_type === 4) {
		targetType = "furthest";
	}
	else if (action.target_type === 5) {
		targetType = "lowest %HP";
	}
	else if (action.target_type === 6) {
		targetType = "highest %HP";
	}
	else if (action.target_type === 7) {
		targetType = "self";
	}
	else if (action.target_type === 8) {
		targetType = "random"; // why two randoms?
	}
	else if (action.target_type === 10) {
		targetType = "foremost";
	}
	else if (action.target_type === 11) {
		targetType = "location"; // Mitsuki field
	}
	else if (action.target_type === 12) {
		targetType = "highest TP";
	}
	else if (action.target_type === 13) {
		targetType = "lowest TP";
	}
	else if (action.target_type === 14) {
		targetType = "highest attack";
	}
	else if (action.target_type === 16) {
		targetType = "highest magic attack";
	}
	else if (action.target_type === 20) {
		targetType = "physical";
	}

	if (targetType === "ex skill") return "";

	let isPlural = (action.target_count > 1);
	let isRange = (action.target_range > 0 || targetCenter === "all");

	let targetPhrase;
	let pluralTargetPhrase;
	switch (targetType) {
		case "current target":
		case "self":
			targetPhrase = targetType;
			pluralTargetPhrase = pluralize(targetPhrase);
			break;
		case "closest":
			let rankWord;
			let rankWords = {
				0: "closest",
				1: "2nd closest",
				2: "3rd closest",
				3: "4th closest",
				4: "5th closest"
			}
			if (targetSide === "enemy") {
				rankWord = rankWords[action.target_number];
			}
			else {
				if (action.target_number === 0) {
					targetPhrase = "self";
					pluralTargetPhrase = "allies";
					break;
				}
				else {
					rankWord = rankWords[action.target_number - 1];
				}
			}
			targetPhrase = rankWord + " " + targetSide;
			pluralTargetPhrase = pluralize(targetSide);
			break;
		case "random":
			if (action.action_id === 104000202) {
				// I guess? I mean what the fuck are you doing here Aoi
				targetPhrase = "current target*"
				pluralTargetPhrase = pluralize(targetSide);
			}
			else if (action.target_range < 0 || action.target_range >= 2160) {
				// Io? I guess?
				targetPhrase = "random " + targetSide;
				pluralTargetPhrase = "random " + pluralize(targetSide);
			} 
			else {
				targetPhrase = "random " + targetSide + " within range " + action.target_range;
				pluralTargetPhrase = "random " + pluralize(targetSide) + " within range " + action.target_range;
			}
			break;
		case "lowest HP":
		case "highest HP":
		case "highest TP":
		case "lowest TP":
		case "highest attack":
		case "highest magic attack":
		case "physical":
		case "furthest":
		case "foremost":
		case "an":
			targetPhrase = targetType + " " + targetSide;
			pluralTargetPhrase = pluralize(targetPhrase);
			break;
		case "location":
			if (action.action_type === 7 && action.action_value_1 > 0) {
				// Subtracting 125 as the "gap distance" between the sides based on the fact that mitsuki can hit some enemies she has debuffed
				// But she can't hit debuffed enemies with her curse
				targetPhrase = "location at range " + (action.action_value_1 - 125) + " from self";
				pluralTargetPhrase = targetPhrase;
				break;
			}
			// Intentionally no break here
		default:
			targetPhrase = targetType;
			pluralTargetPhrase = pluralize(targetPhrase);
			break;
	}

	if (isPlural) {
		let countPhrase = "all";
		if (action.target_count > 1) {
			if (action.target_count < 5) {
				countPhrase = action.target_count;
			}
		}

		if (targetCenter === "all") {
			return countPhrase + " " + pluralTargetPhrase;
		}
		else {
			let rangePhrase = "";
			if (action.target_range < 2160) {
				if (targetCenter === "self") {
					rangePhrase = " within range " + action.target_range + " of self";
				}
				else if (targetCenter === "target") {
					rangePhrase = " within range " + action.target_range + " of " + targetPhrase;
				}
			}

			return countPhrase + " " + pluralTargetPhrase + " " + rangePhrase;
		}
	}
	else {
		if (action.target_range > 0 && action.target_range < 2160) {
			return targetPhrase + " within range " + action.target_range
		}
		else {
			return targetPhrase;
		}
	}

	return "";
}

function pluralize(side) {
	if (side.slice(-1) === "y") {
		return side.slice(0, -1) + "ies";
	}
	else if (side.slice(-1) !== "s") {
		return side + "s";
	}
	else return side;
}