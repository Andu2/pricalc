<script>
	import { version, changeLog, pages } from "@src/config";
	import PageIndex from "@src/components/PageIndex.svelte";

	let featuredPages = pages.filter(function(pageConfig) {
		return pageConfig.category === "Featured PriCalc Tools"
	});
</script>

<svelte:head>
	<title>PriCalc</title>
</svelte:head>

<h1>Princess Connect! Re:Dive Analysis Tools - Global Server</h1>

<p>Welcome! This website hosts Priconne calculators and references that are in English and focused on the global server. My goal is to give players access to accurate game data they might struggle to find otherwise, and enable deeper overanalysis of the game. The data for this website comes directly from the global version's database. Future content will be added as it is released.</p>

<PageIndex pages={featuredPages} />

<h2>Other Useful Tools</h2>
<ul>
	<li><a href="https://expugn.github.io/priconne-quest-helper/">Priconne Quest Helper</a> by S'pugn - Item farming calculator</li>
	<li><a href="https://shioris-library.com/">Shiori's Library</a> by Ruiqi Mao - Unit and equipment database, includes an equipment farming calculator</li>
	<li><a href="https://kenofnz.github.io/priconne-en-event-timer/">PriConne EN Event Schedule</a> by KenOfNZ - Get exact amount of time left before the start/end of game events, super useful for converting UTC time</li>
	<li><a href="https://github.com/Dimbreath/PriconneData">PriconneData</a> by Dimbreath - A repository containing dumps of the game's database</li>
	<li><a href="https://www.priconneglobal.info/">Priconne Global Info</a> by YoYoPop is an informational site focused on the Global server</li>
	<li>Massive shoutout to esterTion for making the original datamining tools and S'pugn for making an <a href="https://github.com/Expugn/priconne-en_db-fetch">English version</a></li>
</ul>

<h2>Bug reports and ideas</h2>
<p>If you notice an issue, have a good idea for an analysis tool, or just want to talk, your input is very welcome! You may message me on reddit: u/AnduCrandu or on Discord: Andu#4916. Bugs may also be reported on <a href="https://github.com/Andu2/pricalc/issues">GitHub</a>.</p>
