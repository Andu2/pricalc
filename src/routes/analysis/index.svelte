<script>
	// import Menu from "../Menu.svelte";
	// import Home from "../Home.svelte";
	// import StatTable from "./StatTable.svelte";

	// var tabs = [{
	// 	label: "Damage Scaling",
	// 	component: Home
	// }, {
	// 	label: "Max Stat Table",
	// 	component: StatTable
	// }];

	// var selectedTab = 0;
	// var selectedComponent = Home;

	// function switchTab(event) {
	// 	selectedTab = event.target.getAttribute("data-tabid") * 1;
	// 	selectedComponent = tabs[selectedTab].component;
	// }
</script>

yeah

<!-- <div class="side-menu">
	<Menu tabs={tabs} selectedTab={selectedTab} on:click={switchTab} />
</div>
<div class="analysis-wrap">
	<svelte:component this={selectedComponent}/>
</div>
 -->
<style>
div.side-menu {
	position: absolute;
	left: 0;
	top: 0;
	bottom: 0;
	width: 200px;
}

div.analysis-wrap {
	position: absolute;
	right: 0;
	top: 0;
	bottom: 0;
	left: 200px;
	overflow-y: auto;
}
</style>