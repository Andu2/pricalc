<script>
	export let status;
	export let error;

	import { stores } from "@sapper/app";
	const { page } = stores();

	const dev = process.env.NODE_ENV === 'development';

	// Redirect to home analysis/guide page if we did something dumb with localstorage getting the last page
	if (typeof window !== "undefined") {
		if (status === 404 && $page.path.split("/")[1] === "analysis") {
			window.location.pathname = "/analysis";
		}
		else if (status === 404 && $page.path.split("/")[1] === "guides") {
			window.location.pathname = "/guides";
		}
	}
</script>

<style>
	h1, p {
		margin: 0 auto;
	}

	h1 {
		font-size: 2.8em;
		font-weight: 700;
		margin: 0 0 0.5em 0;
	}

	p {
		margin: 1em auto;
	}

	@media (min-width: 480px) {
		h1 {
			font-size: 4em;
		}
	}
</style>

<svelte:head>
	<title>{status}</title>
</svelte:head>

<h1>{status}</h1>

<p>{error.message}</p>
{#if dev}
<p>{JSON.stringify(status)}</p>
<p>{JSON.stringify(error)}</p>
<p>{JSON.stringify($page)}</p>
{/if}

{#if dev && error.stack}
	<pre>{error.stack}</pre>
{/if}
