<script>
// This component creates a bunch of tooltip boxes rather than reusing one, which seems dum,
// but I don't know how else to do it using Svelte components

export let header = "";
export let text;

let display = false;
let tooltipBox;

function showTooltip(event) {
	let bufferTop = 60; // avoid going under the nav
	let bufferHorizontal = 10;
	let bufferBottom = 10;
	let leftIfCentered = event.clientX - tooltipBox.offsetWidth / 2;
	if (leftIfCentered <= bufferHorizontal) {
		tooltipBox.style.left = bufferHorizontal + "px";
	}
	else if (leftIfCentered + tooltipBox.offsetWidth >= document.documentElement.clientWidth - bufferHorizontal) {
		tooltipBox.style.left = (document.documentElement.clientWidth - bufferHorizontal - tooltipBox.offsetWidth) + "px";
	}
	else {
		tooltipBox.style.left = leftIfCentered + "px";
	}

	let topIfBelow = event.clientY + 30;
	if (topIfBelow + tooltipBox.offsetHeight >= document.documentElement.clientHeight - bufferBottom) {
		tooltipBox.style.top = (event.clientY - 30 - tooltipBox.offsetHeight) + "px";
	}
	else {
		tooltipBox.style.top = topIfBelow + "px";
	}

	display = true;
	event.stopPropagation()
}

function hideTooltip(event) {
	display = false;
	event.stopPropagation()
}
</script>

<img class="tooltip-icon" src="images/tooltip.svg" on:click={showTooltip} />

<div class="tooltip" class:is-displayed={display}>
	<div class="fade-background" on:click={hideTooltip}></div>
	<div class="tooltip-box" bind:this={tooltipBox}>
		<h2 class="tooltip-control">{header}<img src="images/close.svg" on:click={hideTooltip} /></h2>
		<div class="tooltip-text">
			{text}
		</div>
	</div>
</div>

<style>
img.tooltip-icon {
	cursor: pointer;
	opacity: 0.6;
	fill: black;
	width: 16px;
	height: 16px;
	vertical-align: baseline;
}

img.tooltip-icon:hover {
	opacity: 1;
}

div.tooltip {
	visibility: hidden;
	position: fixed;
	z-index: 50;
	top: 0; left: 0; right: 0; bottom: 0;
}

div.is-displayed {
	visibility: visible;
}

div.fade-background {
	background-color: black;
	opacity: 0.5;
	position: absolute;
	left:0; right: 0; top: 0; bottom: 0;
}

div.tooltip-box {
	background-color: white;
	color: #232323;
	padding: 20px;
	font-size: 12pt;
	font-weight: normal;
	position: absolute;
	width: 400px;
	text-align: left;
}

h2.tooltip-control {
	margin: 0 0 10px 0;
}

h2.tooltip-control img {
	position: absolute;
	top: 15px; right: 15px;
	width: 20px;
	height: 20px;
	cursor: pointer;
	opacity: 0.8;
}

h2.tooltip-control img:hover {
	opacity: 1;
}
</style>