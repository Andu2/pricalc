<script>
	let changeLog = [{
		version: "0.1",
		date: "2020-xx-xx",
		notes: ["Unit viewer", "Analysis: Rank comparison, max stats comparison, skill damage scaling", "Guides: Calculations"]
	}]
</script>

<svelte:head>
	<title>PriCalc</title>
</svelte:head>

<h1>Princess Connect! Re:Dive Global Server Analysis Tools</h1>
<p>This app does not yet have a mobile interface.</p>
<table>
	<tr><th>Version</th><th>Date</th><th>Notes</th></tr>
	{#each changeLog as changeData}
	<tr><td>{changeData.version}</td><td>{changeData.date}</td><td>{@html changeData.notes.join("<br />")}</td></tr>
	{/each}
</table>

<style>
th {
	text-align: left;
}

td {
	vertical-align: top;
	border: 1px solid #7080af;
	padding: 8px;
}

table {
	border-spacing: 8px;
}
</style>