<script>
	import { createEventDispatcher } from "svelte";
	import priconneDb from "@src/priconnedb.js";
	import { NUMBER_TO_STAT } from "@src/priconne.js";

	export let unitId;
	export let rank;
	export let skillLevels;
	export let actor; // for skill calcs

	let skillIds;
	$: skillIds = getSkillIds(unitId);
	let skillData;
	$: skillData = getSkillData(skillIds);
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
					if (skillData.skill_id === unitSkillData[skill]) {
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
		console.log(skillActions);
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
		var replaceVal = "FUCK";
		var additionalVal = "";

		if (action.action_type === 1) {
			// damage. val 1 = base, val 2 = per level, val 3 = attack mult
			var stat = "atk";
			if (actor.unitData.atk_type === 2) {
				stat = "magic_str"
			}
			replaceVal = Math.round(action.action_value_1 + action.action_value_2 * level + action.action_value_3 * actor[stat]);
		}
		else if (action.action_type === 8) {
			// val 3 = stun base time
			additionalVal = action.action_value_3 + " seconds";
		}
		else if (action.action_type === 10) {
			// buff. val 2 = base, val 3 = per level, val 4 = time
			replaceVal = Math.round(action.action_value_2 + action.action_value_3 * level);
			additionalVal = action.action_value_4 + " seconds";
		}
		else if (action.action_type === 21) {
			// ghostie/others?
			additionalVal = action.action_value_1 + action.action_value_2 * level + " seconds";
		}
		else if (action.action_type === 90) {
			// skill boost. val 2 = base, val 3 = per level
			replaceVal = Math.round(action.action_value_2 + action.action_value_3 * level)
		}

		var description = action.description.replace("{0}", replaceVal);
		if (additionalVal) {
			description += " (" + additionalVal + ")";
		}

		if (!description) description = "NONE";
		return description;
	}

	function getAttackPattern(unitId) {
		var attackPattern;
		for (var i = 0; i < priconneDb.unit_attack_pattern.length; i++) {
			if (priconneDb.unit_attack_pattern[i].unit_id === unitId) {
				console.log(priconneDb.unit_attack_pattern[i])
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
</script>

<div class="card-section">
	<div class="card-section-header">Skills</div>
	{#each unlockedSkills as skill}
		<div class="skill-box">
			<img class="skill" src={skillImages[skill]} /> 
			<div class="skill-header">
				<div class="skill-name"><strong>{skillData[skill].name}</strong></div>
				<div class="skill-level">
					Level: <input type="number" min=1 max=85 bind:value={skillLevels[skill]} on:change />
					<div class="button">Max</div>
				</div>
			</div>
			<div class="skill-description">
				{skillData[skill].description}<br />
				{#each skillActions[skill] as action}
					<em>{getActionDescription(action, skillLevels[skill])}</em><br />
				{/each}
			</div>
		</div>
	{/each}
	<div class="attack-pattern">
		<strong>Attack sequence:</strong> {describeAttackPattern(unitId, rank)}
	</div>
</div>

<style>
img.skill {
	width: 60px;
}

div.skill-box + div.skill-box {
	margin-top: 20px;
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