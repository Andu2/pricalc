<script>
	import Nav from '@src/components/Nav.svelte';
	import { lastVersion } from "@src/settings.js";
	import config from "@src/config.js";

	let isNewVersion = ($lastVersion !== config.version);
	if (isNewVersion) {
		console.log("NEW VERSION DETECTED (" + $lastVersion + " -> " + config.version + ")");
	}
	lastVersion.set(config.version);

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

	@media only screen and (max-width: 1260px) {
		main {
			width: 100%;
		}
	}
</style>

<Nav {segment}/>

<main>
	<slot></slot>
</main>