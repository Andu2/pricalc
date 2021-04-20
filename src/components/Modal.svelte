<script context="module">
	// help from:
	// https://svelte.dev/repl/033e824fad0a4e34907666e7196caec4?version=3.4.1
	
	import { writable } from "svelte/store";
	import { fade } from "svelte/transition";
	import { onMount } from "svelte";

	export const component = writable(null);
	// This is a store so we can switch modal type reactively
	// when switching between modals without closing
	const windowed = writable(false); 
	const event = writable(null);
	
	export function showModal(modalComponent, options = {}) {
		if (options.props) {
			// We have to kind of tap into Svelte internals to get props sent
			// This sets up the component like normal but passes in options.props as well
			component.set(function ModalComponent(componentOpts) {
				return new modalComponent({
					...componentOpts,
					props: {
						...options.props,
						...componentOpts.props
					}
				})
			});
		}
		else {
			component.set(modalComponent);
		}

		windowed.set(!!options.windowed);
		if (options.event) {
			event.set(options.event);
		}
	}

	export function closeModal() {
		component.set(null);
		windowed.set(false);
		event.set(null);
	}
</script>

<script>
	let modalWindow;

	$: showWindow(modalWindow);

	function showWindow() {
		if ($windowed && $event) {
			let bufferTop = 75; // avoid going under the nav
			let bufferHorizontal = 15;
			let bufferBottom = 15;
			let navHeight = 45;
			let leftIfCentered = $event.clientX - modalWindow.offsetWidth / 2;
			if (leftIfCentered <= bufferHorizontal) {
				modalWindow.style.left = bufferHorizontal + "px";
			}
			else if (leftIfCentered + modalWindow.offsetWidth >= document.documentElement.clientWidth + bufferHorizontal) {
				modalWindow.style.left = (document.documentElement.clientWidth - bufferHorizontal - modalWindow.offsetWidth) + "px";
			}
			else {
				modalWindow.style.left = leftIfCentered + "px";
			}

			let topIfBelow = $event.clientY - navHeight - 15;
			if (topIfBelow + modalWindow.offsetHeight + navHeight >= document.documentElement.clientHeight - bufferBottom) {
				modalWindow.style.top = (document.documentElement.clientHeight - bufferBottom - modalWindow.offsetHeight - navHeight) + "px";
			}
			else {
				modalWindow.style.top = topIfBelow + "px";
			}

			$event.stopPropagation()
		}
	}
</script>

{#if $component}
<div class="modal-wrap" transition:fade="{{ duration: 70 }}">
	<div class="fade-background" on:click={closeModal}></div>
	{#if $windowed}
	<div class="modal-window" bind:this={modalWindow}>	
		<svelte:component this={$component} />
	</div>
	{:else}
	<div class="modal-column">
		<svelte:component this={$component} />
	</div>
	{/if}
</div>
{/if}

<style>
div.modal-wrap {
	position: fixed;
	z-index: 50;
	display: block;
	top: 45px;
	left: 0; right: 0; bottom: 0;
}

div.fade-background {
	background-color: black;
	opacity: 0.5;
	position: absolute;
	left:0; right: 0; top: 0; bottom: 0;
}

div.modal-column {
	position: absolute;
	margin: 0 auto;
	top: 0; left: 0; right: 0; bottom :0;
	background-color: white;
	width: 550px;
	padding: 20px;
	overflow: hidden;
}

div.modal-window {
	background-color: white;
	color: #232323;
	padding: 20px;
	font-size: 12pt;
	font-weight: normal;
	position: absolute;
	width: 400px;
	text-align: left;
}
</style>