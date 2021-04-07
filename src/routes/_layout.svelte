<script>
	import Nav from '@src/components/Nav.svelte';
	import Loading from '@src/components/Loading.svelte';
	import Modal from "@src/components/Modal.svelte";
	import { lastVersion } from "@src/settings.js";
	import { version } from "@src/config";
	import { stores } from "@sapper/app";
	import { derived } from "svelte/store";
	const { preloading } = stores();
	let isLongLoad = derived(preloading, function(current, set) {
		setTimeout(function() {
			set(current)
		}, 250)
	});

	let isNewVersion = ($lastVersion !== version);
	if (isNewVersion) {
		console.log("NEW VERSION DETECTED (" + $lastVersion + " -> " + version + ")");
	}
	lastVersion.set(version);

	export let segment;
</script>

<style>
	main {
		position: relative;
		width: 80%;
		background-color: white;
		padding: 30px;
		padding-top: 75px;
		margin: 0 auto;
		box-sizing: border-box;
		overflow-x: auto;
	}

	div.footer {
		color:#999999;
		text-align: center;
	}

	div.footer a {
		color:#999999;
	}

	@media only screen and (max-width: 1260px) {
		main {
			width: 100%;
		}
	}
</style>

<Nav {segment}/>

<Modal />

<main>
	{#if $preloading && $isLongLoad}
	<Loading />
	{:else}
	<slot></slot>
	{/if}
</main>

<div class="footer">
</div>
