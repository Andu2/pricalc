<script>
	export var selectedTab = 0;
	export var tabs = [];
</script>
<div id="menu">
{#each tabs as tab, i}
	<div data-tabid={i} class="tab" class:active={selectedTab === i} on:click>{tab.label}</div>
{/each}
</div>

<style>
div.tab {
	display: inline-block;
	padding: 10px 20px;
	background-color: #dddddd;
	cursor: pointer;
}

div.tab:hover {
	background-color: #bbbbbb;
}

div.tab.active {
	background-color: #bbbbbb;
	font-weight: bold;
}
</style>