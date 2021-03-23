<script>
	import { changeLog } from "@src/config";
</script>

<h2>Changelog</h2>
<table>
<tr><th>Version</th><th>Date</th><th>Notes</th></tr>
{#each changeLog as changeData}
<tr><td>{changeData.version}</td><td>{changeData.date}</td><td>{@html changeData.notes.join("<br />")}</td></tr>
{/each}
</table>

<style>
table {
	border-spacing: 8px;
}

td {
	padding: 8px;
	border: 2px solid #cfe4ff;
	border-radius: 8px;
}
</style>
