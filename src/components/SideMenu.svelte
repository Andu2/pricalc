<script>
	export let tabs = [];
	export let basePath = "";
	export let segment;
</script>
<nav>
	<ul id="menu">
	{#each tabs as navData}
		<a href={basePath + navData.path}><li aria-selected="{segment === navData.path ? "true" : undefined}">{navData.displayName}</li></a>
	{/each}
	</ul>
</nav>

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

li {
	list-style-type: none;
}

ul {
	padding-left: 10px;
}
</style>