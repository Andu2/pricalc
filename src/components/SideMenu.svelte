<script>
	import { pages } from "@src/config";
	import { stores } from "@sapper/app";
	const { page } = stores();

	export let segment;

	let menuPages = pages.filter(function(pageConfig) {
		return (pageConfig.category !== "Featured PriCalc Tools" && pageConfig.category !== "Quizzes")
	});
	let categories = {};
	menuPages.forEach(function(pageConfig) {
		let category = pageConfig.category || "Uncategorized";
		if (categories[category] === undefined) {
			categories[category] = [];
		}
		categories[category].push(pageConfig);
	});

	let categoryOrder = Object.keys(categories).sort();
</script>

<div id="menu-wrap">
	{#each categoryOrder as category}
	<h3>{category}</h3>
	<ul>
		{#each categories[category] as pageConfig}
		<li class:is-selected={pageConfig.path === $page.path.slice(1)}><a href={pageConfig.path}>{pageConfig.displayName}</a></li>
		{/each}
	</ul>
	{/each}
</div>

<style>
	h3 {
		margin: 0;
		margin-top: 20px;
		padding-bottom: 5px;
	}

	div#menu-wrap {
		width: 179px;
		top: 0;
		left: 0;
		height: calc(100% - 60px);
		padding-left: 20px;
		padding-right: 10px;
		border-right: 3px solid #cfe4ff;
		margin: 30px 0;
	}

	li {
		list-style-type: none;
	}

	ul {
		margin: 0;
		padding: 0;
	}
</style>