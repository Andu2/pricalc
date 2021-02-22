<script>
	import Menu from "./Menu.svelte";
	import Home from "./Home.svelte";
	import Dex from "./Dex.svelte";
	import BattleSimulator from "./BattleSimulator.svelte";
	import Analysis from "./analysis/Analysis.svelte";
	import Settings from "./Settings.svelte";
	import About from "./About.svelte";

	var tabs = [{
		label: "Home",
		component: Home
	}, {
		label: "Dex",
		component: Dex
	}, {
		label: "Battle Simulator",
		component: BattleSimulator
	}, {
		label: "Analysis",
		component: Analysis
	}, {
		label: "Settings",
		component: Settings
	}, {
		label: "About",
		component: About
	}];

	var selectedTab = 1;
	var selectedComponent = Dex;

	function switchTab(event) {
		selectedTab = event.target.getAttribute("data-tabid") * 1;
		selectedComponent = tabs[selectedTab].component;
	}
</script>

<div class="top-menu">
	<Menu tabs={tabs} selectedTab={selectedTab} on:click={switchTab} />
</div>
<main>
	<svelte:component this={selectedComponent}/>
</main>

<style>
	div.top-menu {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		height: 30px;
	}

	main {
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
		position: fixed;
		top: 30px; bottom: 0; left: 0; right: 0;
		overflow-y: auto;
	}

	h1 {
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>