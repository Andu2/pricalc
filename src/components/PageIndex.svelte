<script>
	export let pages;
	export let priority = [];

	import { CDN_URL } from "@src/logic/ui";

	let categories = {};
	pages.forEach(function(pageConfig) {
		let category = pageConfig.category || "Uncategorized";
		if (categories[category] === undefined) {
			categories[category] = [];
		}
		categories[category].push(pageConfig);
	});

	let categoryOrder;
	if (priority.length > 0) {
		categoryOrder = Object.keys(categories).sort(function(a, b) {
			let aPriority = priority.indexOf(a);
			let bPriority = priority.indexOf(b);
			if (aPriority === -1) aPriority = 999;
			if (bPriority === -1) bPriority = 999;
			return aPriority - bPriority;
		});
	}
	else {
		categoryOrder = Object.keys(categories).sort();
	}
</script>

{#each categoryOrder as category}
	<h2 class="category-header">{category}</h2>
	<div class="category-content">
	{#each categories[category] as pageConfig}
		<div class="page-card">
			<div class="page-icon"><a href={pageConfig.path}><img src={CDN_URL + "/" + pageConfig.icon} /></a></div>
			<div class="page-info">
				<div class="page-name"><a href={pageConfig.path}>{pageConfig.displayName}</a></div>
				<div class="description">{pageConfig.description}</div>
			</div>
		</div>
	{/each}
	</div>
{/each}

<style>
h2.category-header {
	padding-left: 20px;
	margin-bottom: 10px;
	padding-bottom: 2px;
	border-bottom: 3px solid #7080af;
}

div.category-content {
	position: relative;
	column-width: 450px;
}

div.page-card {
	height: 148px;
	position: relative;
	page-break-inside: avoid;
}

div.page-icon {
	position: absolute;
	left: 10px;
	top: 10px;
	width: 128px;
}

div.page-info {
	position: absolute;
	top: 15px;
	left: 148px;
	right: 0;
}

img {
	width:128px;
	height: 128px;
	cursor: pointer;
}

img:hover {
	opacity: 0.8;
}
</style>
