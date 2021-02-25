<script>
	import { STAT_NAMES, STAT_DISPLAY_NAMES, calculatePower, 
		calculateEffectivePhysicalHp, calculateEffectiveMagicHp } from "@src/priconne.js";
	export let actor;

	$: power = calculatePower(actor);
	$: effectivePhysicalHp = calculateEffectivePhysicalHp(actor);
	$: effectiveMagicHp = calculateEffectiveMagicHp(actor);
</script>

<div class="card-section">
	<div class="card-section-header">Stats</div>
	<table>
		<tr><td class="stat-label">Power</td><td class="stat-value">{Math.round(power)}</td></tr>
		{#each STAT_NAMES as stat}
		<tr><td class="stat-label">{STAT_DISPLAY_NAMES[stat]}</td><td class="stat-value">{Math.round(actor[stat])}</td></tr>
		{/each}
		<tr><td class="stat-label">Effective Physical HP</td><td class="stat-value">{Math.round(effectivePhysicalHp)}</td></tr>
		<tr><td class="stat-label">Effective Magic HP</td><td class="stat-value">{Math.round(effectiveMagicHp)}</td></tr>
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
	padding-right: 10px;
}

td.stat-value {
	font-family: monospace;
	font-size: 10pt;
}
</style>