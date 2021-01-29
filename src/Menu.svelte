<script>
	export var selectedTab = 0;
	export var tabs = [{
		label: "Home",
		component: null
	}];
</script>
<div id="menu">
{#each tabs as tab, i}
	<span data-tabid={i} class="tab" class:active={selectedTab === i} on:click>{tab.label}</span>
{/each}
</div>

<style>
span.tab {
	padding: 10px 20px;
	background-color: #dddddd;
	cursor: pointer;
}

span.tab:hover {
	background-color: #bbbbbb;
}

span.tab.active {
	background-color: #bbbbbb;
	font-weight: bold;
}
</style>