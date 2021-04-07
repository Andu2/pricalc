<script>
import { showModal } from "@src/components/Modal.svelte";
import TooltipContent from "@src/components/TooltipContent.svelte";

export let header = "";
export let text = "";

function showTooltip(event) {
	showModal(TooltipContent, {
		props: {
			header: header,
			text: text
		},
		windowed: true,
		event: event
	});
}

</script>

<div class="icon-tooltip" on:click={showTooltip} ></div>

<style>
div.icon-tooltip {
	display: inline-block;
	cursor: pointer;
	opacity: 0.6;
	width: 16px;
	height: 16px;
	font-size: 16px;
	vertical-align: baseline;
	color: #7080af;
}

div.icon-tooltip:hover {
	opacity: 1;
}
</style>