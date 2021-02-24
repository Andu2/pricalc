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
li[aria-selected="true"] {
	color: #303b5a;
}

li {
	list-style-type: none;
	padding: 1px 0;
}

ul {
	padding-left: 0px;
}
</style>