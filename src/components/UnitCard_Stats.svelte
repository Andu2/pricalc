<script>
	import { STAT_NAMES, STAT_DISPLAY_NAMES, calculatePower } from "@src/priconne.js";
	export let actor;

	$: power = calculatePower(actor);
</script>

<div class="card-section">
	<div class="card-section-header">Stats</div>
	<div class="stat-power">
		Power: {Math.round(power)}
	</div>
	<table>
		{#each STAT_NAMES as stat}
		<tr><td class="stat-label">{STAT_DISPLAY_NAMES[stat]}</td><td class="stat-value">{Math.round(actor[stat])}</td></tr>
		{/each}
	</table>
</div>

<style>
div.card-section {
	min-width: 210px;
}

div.stat-power {
	margin-bottom: 8px;
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