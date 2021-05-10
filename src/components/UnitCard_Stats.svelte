<script>
	import Tooltip from "@src/components/Tooltip.svelte";
	import { STAT_NAMES, STAT_DISPLAY_NAMES } from "@src/data/priconnedb";
	import { calculatePower, calculateEffectivePhysicalHp, calculateEffectiveMagicHp, getUnitType } from "@src/logic/unit";
	import { getIcon } from "@src/logic/ui";
	import { shortNumber } from "@src/utils";

	export let actor;

	const STAT_ICONS = {
		"hp": "icon_equipment_102312",
		"atk": "icon_equipment_101011",
		"magic_str": "icon_equipment_101251",
		"def": "icon_equipment_101401",
		"magic_def": "icon_equipment_101521",
		"physical_critical": "icon_equipment_104043",
		"magic_critical": "icon_equipment_104223",
		"wave_hp_recovery": "icon_equipment_103551",
		"wave_energy_recovery": "icon_equipment_103611",
		"dodge": "icon_equipment_101431",
		"life_steal": "icon_equipment_103072",
		"hp_recovery_rate": "icon_equipment_103614",
		"energy_recovery_rate": "icon_equipment_104551",
		"energy_reduce_rate": "icon_equipment_104253",
		"accuracy": "icon_equipment_101131"
	}

	$: power = calculatePower(actor);
	$: effectivePhysicalHp = calculateEffectivePhysicalHp(actor);
	$: effectiveMagicHp = calculateEffectiveMagicHp(actor);
	$: unitType = getActorType(actor);

	function getActorType(actor) {
		if (actor && actor.config) {
			return getUnitType(actor.config.id);
		}
		return "???";
	}

	let effectivePhysHpTooltip = "Effective physical HP represents the average amount of raw physical damage a unit can expect to take before dying, after accounting for defense and dodge. It does NOT account for HP drain or skills.";
	let effectiveMagHpTooltip = "Effective magic HP represents the average amount of raw magic damage a unit can expect to take before dying, after accounting for magic defense. It does NOT account for HP drain or skills.";
</script>

<div class="card-section">
	<div class="card-section-header centered">Stats</div>
	<div class="card-section-content">
		<table>
			{#each STAT_NAMES as stat}
			<tr><td class="stat-label"><img class="stat-icon" src={getIcon(STAT_ICONS[stat])} />{STAT_DISPLAY_NAMES[stat]}</td><td class="stat-value">{shortNumber(Math.round(actor[stat]))}</td></tr>
			{/each}
			{#if unitType === "character"}
			<tr class="calculated"><td class="stat-label">Power</td><td class="stat-value">{shortNumber(Math.round(power))}</td></tr>
			{/if}
			<tr class="calculated"><td class="stat-label">Eff. Physical HP <Tooltip header={"Effective Physical HP"} text={effectivePhysHpTooltip} /></td><td class="stat-value">
				{shortNumber(Math.round(effectivePhysicalHp))}
			</td></tr>
			<tr class="calculated"><td class="stat-label">Eff. Magic HP <Tooltip header={"Effective Magic HP"} text={effectiveMagHpTooltip} /></td><td class="stat-value">
				{shortNumber(Math.round(effectiveMagicHp))}
			</td></tr>
			{#if unitType === "character"}
			<tr class="cost"><td class="stat-label">Equipment Mana Cost</td><td class="stat-value">{shortNumber(50)}</td></tr>
			<tr class="cost"><td class="stat-label">Skill Mana Cost</td><td class="stat-value">{shortNumber(50)}</td></tr>
			<tr class="cost"><td class="stat-label">Mana Cost Total</td><td class="stat-value">{shortNumber(50)}</td></tr>
			<tr class="cost"><td class="stat-label">Exp Cost</td><td class="stat-value">{shortNumber(50)}</td></tr>
			<tr class="cost"><td class="stat-label">Shards</td><td class="stat-value">{shortNumber(50)}</td></tr>
			{/if}
		</table>
	</div>
</div>

<style>
div.card-section {
	min-width: 240px;
	max-width: 280px;
	flex-grow: 1;
}

td {
	vertical-align: text-bottom;
}

td.stat-label {
	padding-right: 6px;
	
}

img.stat-icon {
	width: 24px;
	height: 24px;
	vertical-align: middle;
	user-select: none;
	margin-right: 5px;
}

tr.calculated {
	color: blue;
}

tr.calculated td.stat-label {
	font-weight: bold;
}

tr.cost {
	color: #0ab770;
}

td.stat-value {
	font-family: "Roboto Mono", monospace;
	font-size: 11pt;
}
</style>