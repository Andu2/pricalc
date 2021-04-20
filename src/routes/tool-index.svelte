<script>
	import PageIndex from "@src/components/PageIndex.svelte";
	import { pages } from "@src/config";

	const toolCategories = ["Calculators", "Analysis", "Reference"];
	let toolPages = pages.filter(function(pageConfig) {
		return toolCategories.indexOf(pageConfig.category) > -1
	});
</script>

<PageIndex pages={toolPages} />
