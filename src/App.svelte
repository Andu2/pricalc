<script>
	import Menu from "./Menu.svelte";
	import Home from "./Home.svelte";
	import Dex from "./Dex.svelte";
	import StatTable from "./StatTable.svelte";
	import About from "./About.svelte";

	var tabs = [{
		label: "Home",
		component: Home
	}, {
		label: "Dex",
		component: Dex
	}, {
		label: "Stat Table",
		component: StatTable
	}, {
		label: "About",
		component: About
	}];

	var selectedTab = 0;
	var selectedComponent = Home;

	function switchTab(event) {
		selectedTab = event.target.getAttribute("data-tabid") * 1;
		selectedComponent = tabs[selectedTab].component;
	}
</script>

<Menu tabs={tabs} selectedTab={selectedTab} on:click={switchTab} />
<main>
	<svelte:component this={selectedComponent}/>
</main>

<style>
	main {
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
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