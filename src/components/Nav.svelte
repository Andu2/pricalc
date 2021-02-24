<script>
	export let segment;

	import config from "@src/config.js";
	import { lastAnalysis, lastGuide } from "@src/settings.js";

	const pages = [{
		path: "units",
		displayName: "Units"
	}, {
		path: "analysis",
		displayName: "Analysis"
	}, {
		path: "guides",
		displayName: "Guides"
	}, {
		path: "settings",
		displayName: "Settings"
	}];

	$: if ($lastAnalysis) {
		pages[1].path = "analysis/" + $lastAnalysis;
	}
	$: if ($lastGuide) {
		pages[2].path = "guides/" + $lastGuide;
	}
	
</script>

<style>
	nav {
		color: #303b5a;
		background-color: #83f9e3;
		box-shadow: 0 0 7px #163b5a;
		z-index: 9000;
		position: fixed;
		top: 0; left: 0; right: 0;
		height: 45px;
		width: 100%;
		min-width: 1000px;
	}

	ul {
		vertical-align: top;
		height: 45px;
		line-height: 45px;
		display: inline-block;
		margin: 0;
		margin-left: 30px;
		padding: 0;
	}

	li {
		font-size: 14pt;
		display: inline-block;
		padding: 0 20px;
		height: 45px;
		line-height: 45px;
		border-bottom-style: solid;
		border-bottom-width: 3px;
		border-bottom-color: transparent;
	}

	li[aria-selected="true"] {
		border-bottom-color: #7080af;
	}

	li:hover {
		color: #ef7485;
		border-bottom-color: #ef7485;
	}

	h1 {
		/*letter-spacing: 0.02em;*/
		font-family: "Liberation Serif", serif;
		font-size: 24pt;
		font-weight: bold;
		height: 45px;
		margin: 0;
		padding-left: 20px;
		line-height: 45px;
		display: inline-block;
		vertical-align: top;
	}

	h1:hover {
		color: #ef7485;
	}

	a {
		text-decoration: none;
		color: #303b5a;
	}

	a:hover {
		color: #ef7485;
	}

	div#version {
		position: absolute;
		right: 20px;
		line-height: 45px;
		top: 0;
		bottom: 0;
	}

	div#nav-wrap {
		position: absolute;
		margin: 0 auto;
		width: 80%;
		left: 0; right: 0;
	}
</style>

<nav>
	<div id="nav-wrap">
		<a href="."><h1>PriCalc</h1></a>
		<ul>
			{#each pages as navData}
			<a href={navData.path}><li aria-selected="{segment === navData.path.split('/')[0] ? "true" : undefined}">{navData.displayName}</li></a>
			{/each}
		</ul>
		<a href="changelog"><div id="version">Version {config.version}</div></a>
	</div>
</nav>
