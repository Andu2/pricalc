<script>
	export let segment;

	import config from "@src/config.js";

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
	}, {
		path: "about",
		displayName: "About"
	}]
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
	}

	ul {
		margin: 0;
		padding: 0;
		position: absolute;
		top: 0; bottom: 0;
		left: 10%;
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
		font-family: serif;
		font-size: 24pt;
		font-weight: bold;
		position: absolute;
		margin: 0;
		line-height: 45px;
		left: 30px; top: 0; bottom: 0;
		vertical-align: middle;
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

	ul {
		display: inline-block;
	}

	div#version {
		position: absolute;
		right: 30px;
		line-height: 45px;
		top: 0;
		bottom: 0;
	}
</style>

<nav>
	<a href="."><h1>PriCalc</h1></a>
	<ul>
		{#each pages as navData}
		<a href={navData.path}><li aria-selected="{segment === navData.path ? "true" : undefined}">{navData.displayName}</li></a>
		{/each}
	</ul>
	<div id="version">Version {config.version}</div>
</nav>
