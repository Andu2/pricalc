<script>
	import PageIndex from "@src/components/PageIndex.svelte";
	import { pages } from "@src/config";

	let jpHistoryPages = pages.filter(function(pageConfig) {
		return pageConfig.category === "JP Content History"
	});
</script>

<PageIndex pages={jpHistoryPages} />
