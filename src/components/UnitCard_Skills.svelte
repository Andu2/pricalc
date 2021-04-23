<script>
	import { NUMBER_TO_STAT, SKILL_NAMES, STAT_DISPLAY_NAMES, lookupRows, getUnitSkills } from "@src/data/priconnedb";
	import { getUnitType } from "@src/logic/unit";
	import { describeEffect, describeTarget } from "@src/logic/skill";
	import Tooltip from "@src/components/Tooltip.svelte";

	export let unitId;
	export let rank;
	export let skillLevels;
	export let actor; // for skill calcs
	export let level;
	export let rarity;

	$: unitSkills = getUnitSkillsEx(unitId, rarity);
	$: attackPattern = lookupRows("unit_attack_pattern", { unit_id: unitId })[0];
	$: skillImages = getSkillImages(unitSkills);
	$: unlockedSkills = getUnlockedSkills(rank, unitId, unitSkills);
	$: unitType = getUnitType(unitId);
	$: basicAttackDescription = getBasicAttackDescription(actor);

	// Avoid it looking like crap when user presses backspace
	$: if (typeof rank !== "number") rank = 1;
	$: if (typeof level !== "number") level = 1;
	$: if (typeof rarity !== "number") rarity = 1;

	function getUnitSkillsEx(unitId) {
		let unitType = getUnitType(unitId);
		let unitSkills = getUnitSkills(unitId);
		let unitSkillsCopy = {};
		for (var key in unitSkills) {
			unitSkillsCopy[key] = unitSkills[key];
		}
		if (unitType === "character" && rarity >= 5) {
			unitSkillsCopy.ex_skill_1 = unitSkillsCopy.ex_skill_evolution_1;
		}
		return unitSkillsCopy
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

	function getActionDescription(action, skillName) {
		if (!actor.unitData) return "";

		let level = 0;
		if (actor) {
			if (actor.type === "character" && actor.config.skills) {
				level = actor.config.skills[skillName]
			}
			else if (actor.enemyData) {
				let lvColumn = skillName.replace("skill_", "skill_lv_").replace("burst", "burst_level");
				level = actor.enemyData[lvColumn];
			}
		}
		let description = describeEffect(action, actor, level);
		let htmlDescription = "";
		if (description.length) {
			let descriptionSplit = description.split("\n");
			
			if (descriptionSplit.length > 1) {
				htmlDescription = "<span class='skill-game-description'>" + descriptionSplit[0] + "</span>";
			}
			htmlDescription += "<span class='skill-technical-description'>" + descriptionSplit.slice(-1)[0];
			let targetInfo = describeTarget(action);
			if (targetInfo) {
				// get rid of Hiyori's knockback that affects nobody
				if (targetInfo.indexOf("within range -1") > -1) {
					if (process.env.NODE_ENV === 'development') {
						console.warn("Removed action with range -1", action);
					}
					return "";
				}
				htmlDescription += " Target: " + targetInfo;
			}
			htmlDescription += "</span>"
		}

		return htmlDescription;
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

	function getBasicAttackDescription(actor) {
		if (!actor || !actor.unitData) return "";
		let damageType = "physical"
		let damageAmount = actor.atk;
		if (actor.unitData.atk_type === 2) {
			damageType = "magic";
			damageAmount = actor.magic_str;
		}
		if (damageAmount <= 0) return "";
		return "Deal " + damageAmount + " " + damageType + " damage. Target: closest enemy. Cast time: " + actor.unitData.normal_atk_cast_time + " seconds."
		//return "Deal " + damageAmount + " " + damageType + " damage. Target: 1st enemy. Charge time: " + actor.unitData.normal_atk_cast_time + " seconds";
	}

	$: boundValues(level, skillLevels)
</script>

<div class="card-section">
	<div class="card-section-header">Skills</div>
	{#if basicAttackDescription}
	<p class="basic-attack">
		<strong>Basic attack:</strong> {basicAttackDescription} <Tooltip 
			header={"Cast Time"} 
			text={"Cast time is the idle time before an attack. It does not include animation time. Attack speed buffs reduce cast time, but they do not speed up animations."} />
	</p>
	{/if}
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
				{#if unitType !== "boss" && unitType !== "enemy"}
				<!-- bosses have janky descriptions, exclude them to avoid confusion-->
				{unitSkills[skill].data.description}<br />
				{/if}
				{#each unitSkills[skill].actions as action}
					<em>{@html getActionDescription(action, skill, actor)}</em>
				{/each}
				{#if unitSkills[skill].data.skill_cast_time}
				<span class='skill-technical-description'><em>Cast time: {unitSkills[skill].data.skill_cast_time} seconds</em></span>
				{/if}
			</div>
		</div>
	{/each}
	<div class="attack-pattern">
		<strong>Attack sequence:</strong> {describeAttackPattern(unitId, rank)}
	</div>
	{#if unitType === "boss" || unitType === "enemy"}
	<p><em>Technical skill descriptions are still being worked on, especially for bosses and enemies, as I have not had the chance to go through them all yet.</em></p>
	{/if}
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
p.basic-attack {
	margin: 20px 0;
}

</style>