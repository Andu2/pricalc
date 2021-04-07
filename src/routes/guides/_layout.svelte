<script>
	import TabbedLayout from "@src/components/TabbedLayout.svelte";
	import { lastGuide } from "@src/settings";
	import { guidePages } from "@src/config";

	export let segment;
</script>

<TabbedLayout 
	tabHeader="Guides and Reference"
	basePath="guides/"
	savedTabStore={lastGuide}
	tabs={guidePages}
	segment={segment}
>
<slot></slot>
</TabbedLayout>