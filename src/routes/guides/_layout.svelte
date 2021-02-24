<script>
	import SideMenu from "@src/components/SideMenu.svelte";
	import { lastGuide } from "@src/settings.js";

	let tabs = [{
		path: "formulas",
		displayName: "Formulas"
	}];

	export let segment;
	$: lastGuide.set(segment);

</script>

<div class="layout-wrap">
	<div class="layout-row">
		<div class="layout-cell sidemenu">
			<SideMenu basePath="guides/" tabs={tabs} segment={segment}/>
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
	width: 170px;
}
</style>