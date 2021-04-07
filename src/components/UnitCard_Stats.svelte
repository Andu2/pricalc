<script>
	import Tooltip from "@src/components/Tooltip.svelte";
	import { STAT_NAMES, STAT_DISPLAY_NAMES } from "@src/data/priconnedb";
	import { calculatePower, calculateEffectivePhysicalHp, calculateEffectiveMagicHp } from "@src/logic/unit";
	import { shortNumber } from "@src/utils";

	export let actor;

	$: power = calculatePower(actor);
	$: effectivePhysicalHp = calculateEffectivePhysicalHp(actor);
	$: effectiveMagicHp = calculateEffectiveMagicHp(actor);

	let effectivePhysHpTooltip = "Effective physical HP represents the average amount of raw damage a unit can expect to take before dying, after accounting for defense and dodge. It does NOT account for HP drain or skills.";
	let effectiveMagHpTooltip = "Effective magic HP represents the average amount of raw damage a unit can expect to take before dying, after accounting for magic defense. It does NOT account for HP drain or skills.";
</script>

<div class="card-section">
	<div class="card-section-header">Stats</div>
	<table>
		<tr><td class="stat-label">Power</td><td class="stat-value">{shortNumber(Math.round(power))}</td></tr>
		{#each STAT_NAMES as stat}
		<tr><td class="stat-label">{STAT_DISPLAY_NAMES[stat]}</td><td class="stat-value">{shortNumber(Math.round(actor[stat]))}</td></tr>
		{/each}
		<tr><td class="stat-label">Eff. Physical HP <Tooltip header={"Effective Physical HP"} text={effectivePhysHpTooltip} /></td><td class="stat-value">
			{shortNumber(Math.round(effectivePhysicalHp))}
		</td></tr>
		<tr><td class="stat-label">Eff. Magic HP <Tooltip header={"Effective Magic HP"} text={effectivePhysHpTooltip} /></td><td class="stat-value">
			{shortNumber(Math.round(effectiveMagicHp))}
		</td></tr>
	</table>
</div>

<style>
div.card-section {
	min-width: 210px;
}

td {
	vertical-align: text-bottom;
}

td.stat-label {
	padding-right: 6px;
}

td.stat-value {
	font-family: monospace;
	font-size: 10pt;
}
</style>