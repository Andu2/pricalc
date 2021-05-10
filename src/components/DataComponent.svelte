<script>
	export let requiredTables = [];
	export let onDataReady = function(){};

	import { loadTables } from "@src/data/priconnedb";
	import { onMount, onDestroy } from "svelte";
	import { dataSource } from "@src/settings";

	let loaded = false;
	let failed = false;
	const dataUnsubscribe = dataSource.subscribe(function(value) {
		if (loaded || failed) {
			mountFunction();
		}
	});

	$: [ dataSourceServer, dataSourceVersion ] = $dataSource.split("-");

	function mountFunction() {
		loaded = false;
		failed = false;
		loadTables(requiredTables).then(function(tableDatas) {
			let success = true;
			tableDatas.forEach(function(tableData) {
				if (tableData === null) {
					success = false;
				}
			})
			if (success) {
				loaded = true;
				onDataReady();
			}
			else {
				failed = true;
			}
		});
	}

	function resetDataSource() {
		$dataSource = "en-latest";
		mountFunction();
	}

	onMount(mountFunction);
	onDestroy(dataUnsubscribe);
</script>

<div class="data-component-wrap">
	{#if loaded}
		{#if $dataSource !== "en-latest"}
		<div id="data-source-disclaimer">
			DATA SOURCE IS {$dataSource}.
			{#if dataSourceServer !== "en"}
			Analysis for JP data sources is not guaranteed to be accurate, especially regarding content that has not yet been added to EN.
			{/if}
		</div>
		{/if}
	<slot></slot>
	{:else}
	<div class="loading-display-wrap">
		<div class="loading-display">
			{#if failed}
			<div>
				<div>Loading data {$dataSource} failed.</div>
				<div class="link-button" on:click={mountFunction} >Try again?</div>
				{#if $dataSource !== "en-latest"}
				<div class="link-button" on:click={resetDataSource} >Reset data source to latest EN version?</div>
				{/if}
			</div>
			{:else}
			<div class="loading-spinner">
				<div class="lds-dual-ring"></div>
				<div>Loading data ({$dataSource})</div>
			</div>
			{/if}
		</div>
	</div>
	{/if}
</div>

<style>
	div.data-component-wrap {
		position: relative;
		width: 100%;
		height: 100%;
	}

	div.link-button {
		margin-top: 4px;
	}

	div.loading-display-wrap {
		text-align: center;
	}

	div.loading-display {
		display: inline-block;
		text-align: left;
	}

	div.loading-spinner {
		text-align: center;
	}

	div#data-source-disclaimer {
		color: red;
		margin-bottom: 10px;
	}
</style>
