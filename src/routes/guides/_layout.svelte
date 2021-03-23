<script>
	import TabbedLayout from "@src/components/TabbedLayout.svelte";
	import { lastGuide } from "@src/settings";
	import { guidePages } from "@src/config";

	export let segment;
</script>

<TabbedLayout 
	tabHeader="Guides"
	basePath="guides/"
	savedTabStore={lastGuide}
	tabs={guidePages}
	segment={segment}
>
<slot></slot>
</TabbedLayout>