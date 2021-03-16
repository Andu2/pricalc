<script>
	import SideMenu from "@src/components/SideMenu.svelte";
	import { lastAnalysis } from "@src/settings.js";
	import { sortByAttr } from "@src/utils";

	let tabs = [{
		path: "stat-table",
		displayName: "Max Stat Table"
	}, {
		path: "rank-comparison",
		displayName: "Rank Comparison"
	}, {
		path: "damage-scaling",
		displayName: "Skill Damage Scaling"
	}, {
		path: "drops",
		displayName: "Drops Per Stamina"
	}, {
		path: "equipment-demand",
		displayName: "Equipment Demand"
	}].sort(sortByAttr("displayName"));

	export let segment;
	$: lastAnalysis.set(segment);

</script>
<div class="layout-wrap">
	<div class="layout-row">
		<div class="layout-cell sidemenu">
			<h3>Analysis Tools</h3>
			<SideMenu basePath="analysis/" tabs={tabs} segment={segment} />
		</div>
		<div class="layout-cell content">
			<main><slot></slot></main>
		</div>
	</div>
</div>

<style>
div.layout-wrap {
	display: table;
	table-layout: fixed;
	width: 100%;
}

div.layout-row {
	display: table-row;
}

div.layout-cell {
	display: table-cell;
	vertical-align: top;
}

div.sidemenu {
	width: 170px;
	border-right: 2px solid #cfe4ff;
}

div.content {
	padding-left: 20px;
}
</style>