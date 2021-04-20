<script>
	import SideMenu from "@src/components/SideMenu.svelte";

	export let tabHeader;
	export let basePath;
	export let savedTabStore;
	export let tabs;
	export let segment;

	$: savedTabStore.set(segment);
</script>
<div class="layout-wrap">
	<div class="layout-row">
		<div class="layout-cell sidemenu">
			<h3>{tabHeader}</h3>
			<SideMenu basePath={basePath} tabs={tabs} segment={segment} />
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