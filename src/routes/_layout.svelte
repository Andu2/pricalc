<script>
	import Nav from '@src/components/Nav.svelte';
	import Loading from '@src/components/Loading.svelte';
	import Modal from "@src/components/Modal.svelte";
	import SideMenu from "@src/components/SideMenu.svelte";
	import { horizontalSlide } from "@src/horizontal-slide";
	import { lastVersion, showMenu } from "@src/settings";
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

<Nav {segment} />

<Modal />

<div id="content-wrap">
	<div id="menu" class:hidden={!$showMenu}>
		<SideMenu {segment} />
	</div>
	<div id="content">
		<main>
			{#if $preloading && $isLongLoad}
			<Loading />
			{:else}
			<slot></slot>
			{/if}
		</main>
	</div>
</div>

<div class="footer">
</div>

<style>
	div#content-wrap {
		position: relative;
		width: 80%;
		margin: 0 auto;
		box-sizing: border-box;
		display: flex;
		margin-top: 45px;
		background-color: white;
	}

	div#content {
		position: relative;
		padding: 30px;
		width: 100%;
		overflow-x: auto;

		/* https://codepen.io/astro87/pen/LYRQNbd?editors=1100 */
		background:
			/* Shadow covers  */
			linear-gradient(90deg, white 30%, rgba(255,255,255,0)),
			linear-gradient(90deg, rgba(255,255,255,0), white 70%) 0 100%,
			
			/* Shadows */
			linear-gradient(90deg, rgba(22,59,90,0.25) 0%, rgba(22,59,90,0)),
			linear-gradient(90deg, rgba(22,59,90,0), rgba(22,59,90,0.25) 100%) 0 100%;
		
		background-repeat: no-repeat;
		background-color: white;
		background-position: top left, top right, top left, top right;
		background-size: 50px 100%, 50px 100%, 15px 100%, 15px 100%;
		background-attachment: local, local, scroll, scroll;

		background-color: white;
	}

	div#menu {
		overflow: hidden;
		user-select: none;
		width: 212px;
		transition: width 200ms ease;
		flex-shrink: 0;
	}

	div#menu.hidden {
		width: 0;
	}

	div.footer {
		color:#999999;
		text-align: center;
	}

	div.footer a {
		color:#999999;
	}

	@media only screen and (max-width: 1260px) {
		div#content-wrap {
			width: 100%;
		}
	}
</style>
