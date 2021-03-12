<script>
	import SideMenu from "@src/components/SideMenu.svelte";
	import { lastGuide } from "@src/settings.js";
	import { sortByAttr } from "@src/utils";

	let tabs = [{
		path: "formulas",
		displayName: "Formulas"
	}, {
		path: "arena-jewels",
		displayName: "Arena Jewels"
	}, {
		path: "chara-profiles",
		displayName: "Character Profiles"
	}, {
		path: "clan-battle-laps",
		displayName: "Clan Battle Laps"
	}, {
		path: "position",
		displayName: "Unit Positions"
	}].sort(sortByAttr("displayName"));

	export let segment;
	$: lastGuide.set(segment);

</script>

<div class="layout-wrap">
	<div class="layout-row">
		<div class="layout-cell sidemenu">
			<h3>Guides</h3>
			<SideMenu basePath="guides/" tabs={tabs} segment={segment} />
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