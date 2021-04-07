<script>
	import { closeModal } from "@src/components/Modal.svelte";
	export let header = "";
	export let text = "";
</script>

<h2 class="tooltip-control">{header}<span class="icon-close" on:click={closeModal} ></span></h2>
<div class="tooltip-text">
	{text}
</div>

<style>
h2.tooltip-control {
	margin: 0 0 10px 0;
}

h2.tooltip-control span {
	position: absolute;
	top: 15px; right: 15px;
	width: 20px;
	height: 20px;
	font-size: 20px;
	cursor: pointer;
	color: #ef7485;
	opacity: 0.8;
}

h2.tooltip-control span:hover {
	opacity: 1;
}
</style>