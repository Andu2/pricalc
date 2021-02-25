<script>
	import config from "@src/config.js";
</script>

<svelte:head>
	<title>PriCalc</title>
</svelte:head>

<h1>Princess Connect! Re:Dive Analysis Tools - Global Server</h1>

<h2>Latest changes - version {config.version} ({config.changeLog[0].date})</h2>
<p>
{@html config.changeLog[0].notes.join("<br />")}
</p>
<hr />
<h2>Bug reports and ideas</h2>
<p>If you notice an issue, have a good idea for an analysis tool, or just want to talk, your input is very welcome! You may message me on reddit: u/AnduCrandu or on Discord: Andu#4916. Bugs may also be reported on <a href="https://github.com/Andu2/pricalc/issues">GitHub</a>.</p>
<h2>Other Useful Tools</h2>
<ul>
	<li><a href="https://expugn.github.io/priconne-quest-helper/">Priconne Quest Helper</a> by S'pugn - Item farming calculator</li>
	<li><a href="https://shioris-library.com/">Shiori's Library</a> by Ruiqi Mao - Unit and equipment database, includes an equipment farming calculator</li>
	<li><a href="https://github.com/Dimbreath/PriconneData">PriconneData</a> by Dimbreath - A repository containing dumps of the game's database</li>
	<li><a href="https://docs.google.com/spreadsheets/d/1JjK7Ws4gfzKChRs5ueoxEZVN5SXK10nhDC1-nbm0NUs/edit?usp=sharing">This spreadsheet</a> contains a bunch of stuff including formulas</li>
	<li><a href="https://www.priconneglobal.info/">Priconne Global Info</a> by YoYoPop is an informational site focused on the Global server</li>
	<li>Massive shoutout to esterTion for making the original datamining tools and S'pugn for making an <a href="https://github.com/Expugn/priconne-en_db-fetch">English version</a></li>
</ul>
<p><a href="https://github.com/Andu2/pricalc">PriCalc Source code</a></p>
