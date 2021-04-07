<script>
	import TabbedLayout from "@src/components/TabbedLayout.svelte";
	import { lastAnalysis } from "@src/settings";
	import { analysisPages } from "@src/config";

	export let segment;
</script>

<TabbedLayout 
	tabHeader="Analysis Tools"
	basePath="analysis/"
	savedTabStore={lastAnalysis}
	tabs={analysisPages}
	segment={segment}
>
<slot></slot>
</TabbedLayout>