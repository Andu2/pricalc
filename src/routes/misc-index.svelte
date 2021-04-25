<script>
	import PageIndex from "@src/components/PageIndex.svelte";
	import { pages } from "@src/config";

	const miscCategories = ["Fun Stuff", "JP Content History", "Misc Data"];
	let miscPages = pages.filter(function(pageConfig) {
		return miscCategories.indexOf(pageConfig.category) > -1
	});
</script>

<PageIndex pages={miscPages} priority={["Misc Data", "JP Content History", "Fun Stuff"]} />
