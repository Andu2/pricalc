<script>
	import Nav from '@src/components/Nav.svelte';
	import { lastVersion } from "@src/settings.js";
	import config from "@src/config.js";

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
</style>

<Nav {segment}/>

<main>
	<slot></slot>
</main>