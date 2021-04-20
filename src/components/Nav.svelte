<script>
	export let segment;

	import { version, nav } from "@src/config";
	import { showMenu } from "@src/settings";
	import { showModal, closeModal, component } from "@src/components/Modal.svelte";
	import Settings from "@src/components/Settings.svelte";

	// $: if ($lastAnalysis) {
	// 	nav[1].path = "analysis/" + $lastAnalysis;
	// }
	// $: if ($lastGuide) {
	// 	nav[2].path = "guides/" + $lastGuide;
	// }
	
	function showSettings() {
		if ($component === Settings) {
			closeModal();
		}
		else {
			showModal(Settings);
		}
	}

	function toggleMenu() {
		if ($showMenu) {
			showMenu.set(false)
		}
		else {
			showMenu.set(true)
		}
	}
</script>

<nav>
	<div id="nav-wrap">
		<div id="menu" class="icon-menu" class:toggled={$showMenu} on:click={toggleMenu}></div>
		<a href="."><h1>PriCalc</h1></a>
		<ul>
			{#each nav as navData}
			<a href={navData.path}><li aria-selected="{segment === navData.path.split('/')[0] ? "true" : undefined}">{navData.displayName}</li></a>
			{/each}
		</ul>
		<div class="nav-right">
			<a href="about"><span id="version">Version {version}</span></a>
			<div id="settings" class="icon-cog" on:click={showSettings} ></div>
		</div>
	</div>
</nav>

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
		min-width: 850px;
		user-select: none
	}

	div#menu {
		display: inline-block;
		cursor: pointer;
		font-size:  32px;
		height: 45px;
		line-height: 45px;
		margin-left: 14px;
		padding: 0 6px;
	}

	div#menu:hover {
		color: #ef7485;
	}

	div#menu.toggled {
		/*background-color: #11afa0;*/
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
		padding-left: 10px;
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

	div.nav-right {
		position: absolute;
		right: 20px;
		line-height: 45px;
		top: 0;
		bottom: 0;
	}

	div#settings {
		display: inline-block;
		cursor: pointer;
		font-size:  25px;
		height: 45px;
		line-height: 45px;
	}

	div#settings:hover {
		color: #ef7485;
	}

	div#nav-wrap {
		position: absolute;
		margin: 0 auto;
		width: 80%;
		left: 0; right: 0;
	}

	span#version {
		display: inline-block;
		height: 45px;
		vertical-align: top;
		margin-right: 15px;
	}

	@media only screen and (max-width: 1260px) {
		div#nav-wrap {
			width: 100%;
		}
	}
</style>
