<script>
	import { createEventDispatcher } from "svelte";
	import priconneDb from "@src/priconnedb.js";
	import { NUMBER_TO_STAT } from "@src/priconne.js";

	export let unitId;
	export let rank;
	export let skillLevels;
	export let actor; // for skill calcs
	export let level;
	export let rarity;

	let skillIds;
	$: skillIds = getSkillIds(unitId);
	let skillData;
	$: skillData = getSkillData(skillIds, rarity);
	let skillActions;
	$: skillActions = getSkillActions(skillData);
	let attackPattern;
	$: attackPattern = getAttackPattern(unitId);
	let skillImages;
	$: skillImages = getSkillImages(skillData);
	let unlockedSkills;
	$: unlockedSkills = getUnlockedSkills(rank);

	function getSkillIds(unitId) {
		for (var i = 0; i < priconneDb.unit_skill_data.length; i++) {
			if (priconneDb.unit_skill_data[i].unit_id === unitId) {
				return priconneDb.unit_skill_data[i];
			}
		}
	}

	const SKILL_NAMES = ["union_burst", "main_skill_1", "main_skill_2", "ex_skill_1"];

	function getUnlockedSkills(rank) {
		var unlockedSkills = [];
		if (rank >= 1) {
			unlockedSkills.push("union_burst");
		}
		if (rank >= 2) {
			unlockedSkills.push("main_skill_1");
		}
		if (rank >= 4) {
			unlockedSkills.push("main_skill_2");
		}
		if (rank >= 7) {
			unlockedSkills.push("ex_skill_1");
		}
		return unlockedSkills;
	}

	function getSkillData(unitSkillData) {
		var allSkillData = {};
		SKILL_NAMES.forEach(function(skill) {
			allSkillData[skill] = {};
		});
		if (unitSkillData) {
			priconneDb.skill_data.forEach(function(skillData) {
				SKILL_NAMES.forEach(function(skill) {
					if (rarity >= 5 && skill === "ex_skill_1" && skillData.skill_id === unitSkillData["ex_skill_evolution_1"]) {
						allSkillData[skill] = skillData;
					}
					else if (skillData.skill_id === unitSkillData[skill]) {
						allSkillData[skill] = skillData;
					}
				});
			});
		}
		console.log(allSkillData)
		return allSkillData;
	}

	function getSkillActions(skillData) {
		var skillActions = {};
		SKILL_NAMES.forEach(function(skill) {
			skillActions[skill] = [];
		});
		priconneDb.skill_action.forEach(function(skillAction) {
			SKILL_NAMES.forEach(function(skill) {
				for (var i = 1; i <= 7; i++) {
					if (skillAction.action_id === skillData[skill]["action_" + i]) {
						skillActions[skill].push(skillAction)
					}
				}
			});
		});
		//console.log(skillActions);
		return skillActions;
	}

	function getSkillImages(skillData) {
		var skillImages = {};
		SKILL_NAMES.forEach(function(skill) {
			if (!skillData[skill].icon_type) {
				skillImages[skill] = "images/equipment/icon_icon_equipment_999999.png";
			}
			else {
				skillImages[skill] = "images/skill/icon_icon_skill_" + skillData[skill].icon_type + ".png";
			}
		});
		return skillImages;
	}

	function getActionDescription(action, level) {
		var replaceVal = "???";
		var additionalVal = "";

		if (action.action_type === 1) {
			// damage. val 1 = base, val 2 = per level, val 3 = attack mult
			var stat = "atk";
			if (actor.unitData.atk_type === 2) {
				stat = "magic_str"
			}
			replaceVal = Math.round(action.action_value_1 + action.action_value_2 * level + action.action_value_3 * actor[stat]);
			if (action.target_range > 0 && action.target_range < 2160) {
				additionalVal = action.target_range + " range";
			}
		}
		else if (action.action_type === 2) {
			//additionalVal = "Laugh for " + action.action_value_4 + " seconds";
		}
		else if (action.action_type === 3) {
			// knockback
			additionalVal = action.action_value_1 + " knockback"
		}
		else if (action.action_type === 4) {
			// heal
			var stat = "atk";
			if (actor.unitData.atk_type === 2) {
				stat = "magic_str"
			}
			replaceVal = Math.round((action.action_value_2 + action.action_value_3 * level + action.action_value_4 * actor[stat]) 
				* (1 + actor.hp_recovery_rate / 100));
			if (action.target_range > 0 && action.target_range < 2160) {
				additionalVal = action.target_range + " range";
			}
		}
		else if (action.action_type === 6) {
			// barrier
			replaceVal = Math.round(action.action_value_1 + action.action_value_2 * level);
			additionalVal = action.action_value_3 + " seconds";
		}
		else if (action.action_type === 8) {
			// action speed change, including stun
			// val 3 = stun base time
			additionalVal = action.action_value_3 + " seconds";
			if (action.action_value_1 > 0) {
				additionalVal += ", action speed multiplied by " + action.action_value_1
			}
		}
		else if (action.action_type === 9) {
			// poison, val 1 = base, val 2 = per level, val 3 = time
			replaceVal = Math.round(action.action_value_1 + action.action_value_2 * level)
			additionalVal = action.action_value_3 + " seconds";
		}
		else if (action.action_type === 10) {
			// buff. val 2 = base, val 3 = per level, val 4 = time
			replaceVal = Math.round(action.action_value_2 + action.action_value_3 * level);
			additionalVal = action.action_value_4 + " seconds";
			if (action.target_range > 0 && action.target_range < 2160) {
				additionalVal += ", " + action.target_range + " range";
			}
		}
		else if (action.action_type === 12) {
			//blind
			additionalVal = action.action_value_1 + " seconds, " + action.action_value_3 + "% base chance";
		}
		else if (action.action_type === 16) {
			// TP
			replaceVal = Math.round(action.action_value_1 + action.action_value_2 * level);
		}
		else if (action.action_type === 26) {
			// Saren's berserk
			additionalVal = "Deal additional damage equal to " + action.action_value_2 + " times missing HP"
		}
		else if (action.action_type === 28) {
			// Suzume's chance-based action branching
			if (action.action_detail_2 === 102500103) {
				additionalVal = action.action_detail_1 + "% chance to succeed";
			}
		}
		else if (action.action_type === 32) {
			// Akari's HP Drain thing
			//val 1 = base, val 2 = per level, val 3 = attack mult
			additionalVal = "Increases HP drain by " + Math.round(action.action_value_1 + action.action_value_2 * level + action.action_value_3)
				+ " on all allies' next attack."
		}
		else if (action.action_type === 34) {
			// Kaori's added damage
			//val 1 = base, val 2 = per level, val 3 = attack mult
			//replaceVal = Math.round(action.action_value_1 + action.action_value_2 * level + action.action_value_3);
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
			additionalVal = action.action_value_5 + " seconds, " + action.action_value_7 + " range";
		}
		else if (action.action_type === 38) {
			// Mitsuki's debuff area
			replaceVal = Math.round(action.action_value_1 + action.action_value_2 * level);
			additionalVal = action.action_value_3 + " seconds, " + action.action_value_5 + " range";
		}
		else if (action.action_type === 18) {
			if (action.action_detail_2 === 100300302) {
				 // Rei
				additionalVal = "Charge " + action.action_value_3 + " seconds, then deal additional damage equal to " + action.action_value_1 + " times damage taken";
			}
		}
		else if (action.action_type === 21) {
			// ghostie/lima/annasplosion
			var time = action.action_value_1 + action.action_value_2 * level;
			if (time > 0) {
				additionalVal = "invulnerable " + (action.action_value_1 + action.action_value_2 * level) + " seconds";
			}
		}
		else if (action.action_type === 90) {
			// skill boost. val 2 = base, val 3 = per level
			replaceVal = Math.round(action.action_value_2 + action.action_value_3 * level)
		}

		var description = action.description.replace("{0}", replaceVal);
		if (additionalVal) {
			description += " (" + additionalVal + ")";
		}

		if (description !== "" && replaceVal === "???") {
			console.log(action);
		}

		return description;
	}

	function getAttackPattern(unitId) {
		var attackPattern;
		for (var i = 0; i < priconneDb.unit_attack_pattern.length; i++) {
			if (priconneDb.unit_attack_pattern[i].unit_id === unitId) {
				//console.log(priconneDb.unit_attack_pattern[i])
				return priconneDb.unit_attack_pattern[i];
			}
		}
	}

	function describeAttackPattern() {
		var pattern = [];
		if (attackPattern) {
			for (var i = 1; i <= 20; i++) {
				if (i === attackPattern.loop_start) {
					pattern.push("LOOP START");
				}

				if (rank >= 2 && attackPattern["atk_pattern_" + i] === 1001) {
					pattern.push(skillData["main_skill_1"].name);
				}
				else if (rank >= 4 && attackPattern["atk_pattern_" + i] === 1002) {
					pattern.push(skillData["main_skill_2"].name);
				}
				else {
					pattern.push("Attack");
				}

				if (i === attackPattern.loop_end) {
					break;
				}
			}
		}
		return pattern.join("; ");
	}

	function maxSkill(skill) {
		return function() {
			skillLevels[skill] = level;
		}
	}

	function boundValues(level, skillLevels) {
		SKILL_NAMES.forEach(function(skill) {
			if (skillLevels[skill] > level) skillLevels[skill] = level;
			else if (skillLevels[skill] < 1) skillLevels[skill] = 1;
		});
	}

	$: boundValues(level, skillLevels)
</script>

<div class="card-section">
	<div class="card-section-header">Skills</div>
	{#each unlockedSkills as skill}
		<div class="skill-box">
			<img class="skill" src={skillImages[skill]} /> 
			<div class="skill-header">
				<div class="skill-name"><strong>{skillData[skill].name}</strong></div>
				<div class="skill-level">
					<div class="level-input">Level: <input type="number" min=1 max={level} bind:value={skillLevels[skill]} on:change /></div>
					<div class="button" on:click={maxSkill(skill)}>Max</div>
				</div>
			</div>
			<div class="skill-description">
				{skillData[skill].description}<br />
				{#each skillActions[skill] as action}
					<em>{getActionDescription(action, skillLevels[skill])}</em>
				{/each}
			</div>
		</div>
	{/each}
	<div class="attack-pattern">
		<strong>Attack sequence:</strong> {describeAttackPattern(unitId, rank)}
	</div>
</div>

<style>
em {
	display: block;
	font-size: 10pt;
}
em:empty {
	display: none;
}

div.card-section {
	min-width: 350px;
}

img.skill {
	width: 60px;
}

div.skill-box + div.skill-box {
	margin-top: 20px;
}

div.level-input {
	display: inline-block;
	padding-top: 6px;
	padding-right: 4px;
}

div.skill-level div {
	vertical-align: top;
}

div.skill-header {
	display: inline-block;
	vertical-align: top;
	margin-left: 10px;
	line-height: 1.5em;
}

div.attack-pattern {
	margin-top: 20px;
}

div.button {
	display: inline-block;
	padding: 2px;
	width: 60px;
	margin: 5px 0;
}

</style>