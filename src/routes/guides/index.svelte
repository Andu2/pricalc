<script>
	import PageIndex from "@src/components/PageIndex.svelte";
	import { pages } from "@src/config";

	let guidePages = pages.filter(function(pageConfig) {
		return (pageConfig.category === "Calculators" || pageConfig.category === "Reference")
	});
</script>

<PageIndex pages={guidePages} />
