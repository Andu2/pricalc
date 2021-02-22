<script>
	import Nav from '@src/components/Nav.svelte';

	export let segment;
</script>

<style>
	main {
		position: relative;
		width: 80%;
		background-color: white;
		padding: 2em;
		margin: 0 auto;
		box-sizing: border-box;
	}
</style>

<Nav {segment}/>

<main>
	<slot></slot>
</main>