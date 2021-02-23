<script>
	import SideMenu from "@src/components/SideMenu.svelte";

	let tabs = [{
		path: "stat-table",
		displayName: "Max Stat Table"
	}];

	export let segment;
</script>

<div class="layout-wrap">
	<div class="layout-row">
		<div class="layout-cell sidemenu">
			<SideMenu basePath="analysis/" tabs={tabs} segment={segment} />
		</div>
		<div class="layout-cell">
			<main><slot></slot></main>
		</div>
	</div>
</div>

<style>
div.layout-wrap {
	display: table;
}

div.layout-row {
	display: table-row;
}

div.layout-cell {
	display: table-cell;
	vertical-align: top;
}

div.sidemenu {
	padding-right: 20px;
	min-width: 150px;
}
</style>