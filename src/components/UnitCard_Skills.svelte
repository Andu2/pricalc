<script>
	import { NUMBER_TO_STAT, SKILL_NAMES, STAT_DISPLAY_NAMES, lookupRows, getUnitSkills } from "@src/data/priconnedb";
	import { getUnitType } from "@src/logic/unit";

	export let unitId;
	export let rank;
	export let skillLevels;
	export let actor; // for skill calcs
	export let level;
	export let rarity;

	$: unitSkills = getUnitSkillsEx(unitId);
	$: attackPattern = lookupRows("unit_attack_pattern", { unit_id: unitId })[0];
	$: skillImages = getSkillImages(unitSkills);
	$: unlockedSkills = getUnlockedSkills(rank, unitId, unitSkills);
	$: unitType = getUnitType(unitId);

	// Avoid it looking like crap when user presses backspace
	$: if (typeof rank !== "number") rank = 1;
	$: if (typeof level !== "number") level = 1;
	$: if (typeof rarity !== "number") rarity = 1;

	function getUnitSkillsEx(unitId) {
		let unitType = getUnitType(unitId);
		let unitSkills = getUnitSkills(unitId);
		if (unitType === "character" && rarity >= 5) {
			unitSkills.ex_skill_1 = unitSkills.ex_skill_evolution_1;
		}
		return unitSkills
	}

	function getUnlockedSkills(rank, unitId, unitSkills) {
		let unitType = getUnitType(unitId);
		let unlockedSkills = [];

		if (typeof rank !== "number") {
			return unlockedSkills || [];
		}
		if (unitType === "boss") {
			for (var skillName in unitSkills) {
				if (unitSkills[skillName].data) {
					unlockedSkills.push(skillName);
				}
			}
			return unlockedSkills;
		}

		if (rank >= 1 && unitSkills.union_burst.data) {
			unlockedSkills.push("union_burst");
		}
		if (rank >= 2 && unitSkills.main_skill_1.data) {
			unlockedSkills.push("main_skill_1");
		}
		if (rank >= 4 && unitSkills.main_skill_2.data) {
			unlockedSkills.push("main_skill_2");
		}
		if (rank >= 7 && unitSkills.ex_skill_1.data) {
			unlockedSkills.push("ex_skill_1");
		}
		return unlockedSkills;
	}

	function getSkillImages(unitSkills) {
		var skillImages = {};
		for (var skillName in unitSkills) {
			if (!unitSkills[skillName].data || !unitSkills[skillName].data.icon_type) {
				skillImages[skillName] = "images/equipment/icon_icon_equipment_999999.png";
			}
			else {
				skillImages[skillName] = "images/skill/icon_icon_skill_" + unitSkills[skillName].data.icon_type + ".png";
			}
		}
		return skillImages;
	}

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

	function getActionDescription(action, skillName) {
		if (!actor.unitData) return "";

		let level = 0;
		if (unitType === "character") {
			level = skillLevels[skillName]
		}
		else if (actor.enemyData) {
			let lvColumn = skillName.replace("skill_", "skill_lv_").replace("burst", "burst_level");
			level = actor.enemyData[lvColumn];
		}

		var replaceVal = "???";
		var additionalVal = "";
		var description = action.description || "";

		if (action.action_type === 1) {
			// damage. val 1 = base, val 2 = per level, val 3 = attack mult
			if (!description) {
				description = "Damage {0}";
			}
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
		else if (action.action_type === 7) {
			if (action.target_type !== 2) {
				additionalVal = "Target enemy in position " + (action.target_number + 1);
			}
		}
		else if (action.action_type === 8) {
			// action speed change, including stun
			// val 3 = stun base time
			if (!description) {
				description = action8Detail[action.action_detail_1];
			}
			additionalVal = action.action_value_3 + " seconds";
			if (action.action_value_1 > 0) {
				additionalVal += ", action speed multiplied by " + action.action_value_1
			}
		}
		else if (action.action_type === 9) {
			// poison, val 1 = base, val 2 = per level, val 3 = time
			if (!description) {
				description = action9Detail[action.action_detail_1] + " {0}";
			}
			replaceVal = Math.round(action.action_value_1 + action.action_value_2 * level)
			additionalVal = action.action_value_3 + " seconds";
		}
		else if (action.action_type === 10) {
			// buff. val 2 = base, val 3 = per level, val 4 = time
			let isDebuff = (action.action_detail_1 % 2 === 1);
			let stat = NUMBER_TO_STAT[Math.floor(action.action_detail_1 / 10) + 1];
			if (!description) {
				description = (isDebuff ? "Lowers " : "Raises ") + STAT_DISPLAY_NAMES[stat] + " by {0}"
			}
			replaceVal = Math.round(action.action_value_2 + action.action_value_3 * level);
			additionalVal = action.action_value_4 + " seconds";
			if (action.target_range > 0 && action.target_range < 2160) {
				additionalVal += ", " + action.target_range + " range";
			}
		}
		else if (action.action_type === 11) {
			// charm
			additionalVal = action.action_value_1 + " seconds";
		}
		else if (action.action_type === 12) {
			//blind
			if (!description) {
				description = "Blind"
			}
			additionalVal = "Causes " + (100 - action.action_detail_1) + "% miss chance on physical attacks for " + action.action_value_1 + " seconds"
		}
		else if (action.action_type === 13) {
			// silence
			if (!description) {
				description = "Silence"
			}
			additionalVal = action.action_value_1 + " seconds"
		}
		else if (action.action_type === 15) {
			additionalVal = "Summon";
		}
		else if (action.action_type === 16) {
			// TP
			replaceVal = Math.round(action.action_value_1 + action.action_value_2 * level);
		}
		else if (action.action_type === 17) {
			// HP activation
			additionalVal = "Activates when below " + action.action_value_3 + "% HP";
		}
		else if (action.action_type === 18) {
			if (action.action_detail_2 === 100300302) {
				 // Rei
				additionalVal = "Charge " + action.action_value_3 + " seconds, then deal additional damage equal to " + action.action_value_1 + " times damage taken";
			}
		}
		else if (action.action_type === 20) {
			// taunt
			additionalVal = (action.action_value_1 + action.action_value_2 * level) + " seconds";
		}
		else if (action.action_type === 21) {
			// ghostie/lima/annasplosion
			var time = action.action_value_1 + action.action_value_2 * level;
			if (time > 0) {
				additionalVal = "invulnerable " + (action.action_value_1 + action.action_value_2 * level) + " seconds";
			}
		}
		else if (action.action_type === 22) {
			// Some kind of percentage damage buff on a skill?
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
		else if (action.action_type === 30) {
			//death
			additionalVal = "Instant death";
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
		else if (action.action_type === 42) {
			// Akino
		}
		else if (action.action_type === 44) {
			// Lima
		}
		else if (action.action_type === 45) {
			// Arisa
		}
		else if (action.action_type === 46) {
			// Ziz percent HP based damage
			if (!description) {
				description = "Damage {0}% of max HP";
			}
			replaceVal = action.action_value_1;
		}
		else if (action.action_type === 90) {
			// skill boost. val 2 = base, val 3 = per level
			replaceVal = Math.round(action.action_value_2 + action.action_value_3 * level)
		}

		if (action.target_type === 2) {
			if (additionalVal) {
				additionalVal += ", target random";
			}
			else {
				additionalVal = "target random";
			}
		}

		description = description.replace("{0}", replaceVal);
		if (additionalVal) {
			description += " (" + additionalVal + ")";
		}

		if (description !== "" && replaceVal === "???") {
			//console.log(action);
		}

		return description;
	}

	function getAttackPattern(unitId) {
		var attackPattern;
		for (var i = 0; i < tables.unit_attack_pattern.length; i++) {
			if (tables.unit_attack_pattern[i].unit_id === unitId) {
				//console.log(tables.unit_attack_pattern[i])
				return tables.unit_attack_pattern[i];
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

				if (rank >= 2 && attackPattern["atk_pattern_" + i] === 1001 && unitSkills["main_skill_1"].data) {
					pattern.push(unitSkills["main_skill_1"].data.name || unitSkills["main_skill_1"].type);
				}
				else if (rank >= 4 && attackPattern["atk_pattern_" + i] === 1002 && unitSkills["main_skill_2"].data) {
					pattern.push(unitSkills["main_skill_2"].data.name || unitSkills["main_skill_2"].type);
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
	{#each unlockedSkills as skill, i}
		<div class="skill-box">
			<img class="skill" src={skillImages[skill]} /> 
			<div class="skill-header">
				<div class="skill-name"><strong>{unitSkills[skill].data.name || unitSkills[skill].type }</strong></div>
				{#if unitType === "character"}
				<div class="skill-level">
					<div class="level-input">Level: <input type="number" min=1 max={level} bind:value={skillLevels[skill]} on:change /></div>
					<div class="button" on:click={maxSkill(skill)}>Max</div>
				</div>
				{/if}
			</div>
			<div class="skill-description">
				{#if unitType !== "boss"}
				<!-- bosses have janky descriptions, exclude them to avoid confusion-->
				{unitSkills[skill].data.description}<br />
				{/if}
				{#each unitSkills[skill].actions as action}
					<em>{getActionDescription(action, skill, actor)}</em>
				{/each}
				<!-- <em>Skill cast time {unitSkills[skill].data.skill_cast_time}</em> -->
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