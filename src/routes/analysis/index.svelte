<script>
	import PageIndex from "@src/components/PageIndex.svelte";
	import { pages } from "@src/config";

	let analysisPages = pages.filter(function(pageConfig) {
		return pageConfig.category === "Analysis"
	});
</script>

<PageIndex pages={analysisPages} />
