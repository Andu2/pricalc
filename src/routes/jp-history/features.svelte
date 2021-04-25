<script>
	import { jpContentHistory, UNLOCKED_UNITS } from "@src/data/priconnedb";
	import JPContentHeader from "@src/components/JPContentHeader.svelte";
	import JPContentFooter from "@src/components/JPContentFooter.svelte";

	const jpLaunchDate = new Date(jpContentHistory.jpLaunchDate);

	function getArenaName(arena) {
		if (arena === "arena") return "Arena";
		else if (arena === "princessArena") return "Princess Arena";
		else return "???";
	}
</script>

<h2>JP Misc Features Timeline</h2>

<JPContentHeader />

<h3>Features</h3>
<table class="info-table">
	<tr><th>Feature</th><th>JP Release Date</th><th>Days After JP Launch</th></tr>
	{#each jpContentHistory.features as releaseData, i}
	<tr class:even={i % 2 === 0}>
		<td>{releaseData.description}</td>
		<td>{releaseData.jpDate}</td>
		<td>{Math.round((new Date(releaseData.jpDate) - jpLaunchDate) / 1000 / 60 / 60 / 24)}</td>
	</tr>
	{/each}
</table>

<h3>Dungeons</h3>
<table class="info-table">
	<tr><th>Dungeon</th><th>JP Release Date</th><th>Days After JP Launch</th></tr>
	{#each jpContentHistory.dungeon as releaseData, i}
	<tr class:even={i % 2 === 0}>
		<td>{releaseData.level}</td>
		<td>{releaseData.jpDate}</td>
		<td>{Math.round((new Date(releaseData.jpDate) - jpLaunchDate) / 1000 / 60 / 60 / 24)}</td>
	</tr>
	{/each}
</table>

<h3>Grotto Quests</h3>
<table class="info-table">
	<tr><th>Grotto Level</th><th>JP Release Date</th><th>Days After JP Launch</th></tr>
	{#each jpContentHistory.grotto as releaseData, i}
	<tr class:even={i % 2 === 0}>
		<td>{releaseData.level}</td>
		<td>{releaseData.jpDate}</td>
		<td>{Math.round((new Date(releaseData.jpDate) - jpLaunchDate) / 1000 / 60 / 60 / 24)}</td>
	</tr>
	{/each}
</table>

<h3>Arena Shuffles</h3>
<table class="info-table">
	<tr><th>Arena</th><th>JP Date</th><th>Days After JP Launch</th></tr>
	{#each jpContentHistory.arenaShuffle as releaseData, i}
	<tr class:even={i % 2 === 0}>
		<td>{getArenaName(releaseData.type)}</td>
		<td>{releaseData.jpDate}</td>
		<td>{Math.round((new Date(releaseData.jpDate) - jpLaunchDate) / 1000 / 60 / 60 / 24)}</td>
	</tr>
	{/each}
</table>

<h3>Furniture Levels</h3>
<table class="info-table">
	<tr><th>Furniture Level Cap</th><th>JP Release Date</th><th>Days After JP Launch</th></tr>
	{#each jpContentHistory.furnitureLevelCap as releaseData, i}
	<tr class:even={i % 2 === 0}>
		<td>{releaseData.level}</td>
		<td>{releaseData.jpDate}</td>
		<td>{Math.round((new Date(releaseData.jpDate) - jpLaunchDate) / 1000 / 60 / 60 / 24)}</td>
	</tr>
	{/each}
</table>

<JPContentFooter />

<style>
	table + h3 {
		margin-top: 40px;
	}

	table.info-table th {
		color: #303b5a;
		border-bottom: 2px solid #566590;
		padding: 0 2px;
	}

	table.info-table td {
		padding: 0 2px;
	}

	table.info-table tr.even {
		background-color: #cfe4ff;
	}
</style>
