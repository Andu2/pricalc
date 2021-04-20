<script>
	import { changeLog } from "@src/config";
</script>

<p><a href="https://github.com/Andu2/pricalc">PriCalc Source code</a></p>

<h2>Contributors</h2>
<ul>
	<li>Andu - Creator! Message me on Discord: Andu#4916 or reddit: /u/AnduCrandu</li>
	<li><a href="https://github.com/holatuwol">holatuwol</a> - Unit positioning simulation</li>
</ul>

<h2>Changelog</h2>
<table>
<tr><th>Version</th><th>Date</th><th>Notes</th></tr>
{#each changeLog as changeData}
<tr><td>{changeData.version}</td><td>{changeData.date}</td><td>{@html changeData.notes.join("<br />")}</td></tr>
{/each}
</table>

<h2>Stupid stuff</h2>
<a href="guides/cute">Cuteness Reference</a>

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
