<script>
	import { includeExSkillStats, hideImpossibleRarities, dataSource, theme } from "@src/settings.js";
	import { onMount } from "svelte";
	import { closeModal } from "@src/components/Modal.svelte";
	import themes from "@src/../themes.json";

	const serverOptions = [ "en", "jp" ];
	let [ dataSourceServer, dataSourceVersion ] = [...$dataSource.split("-")];
	let versionConfig = {};
	const namedVersions = {
		en: {
			"latest": "Latest EN version",
			"10000000": "Soft launch",
			"10000120": "Official release"
		},
		jp: {
			"latest": "Latest JP version",
			"10010810": "First available JP version"
		}
	}

	$: versionOptions = getVersionOptions(dataSourceServer, versionConfig);
	$: $dataSource = getDataSource(dataSourceServer, dataSourceVersion);

	function getDataSource(dataSourceServer, dataSourceVersion) {
		return dataSourceServer + "-" + dataSourceVersion;
	}

	function getVersionOptions(server, versionConfig) {
		if (!versionConfig[server]) {
			return [{
				version: dataSourceVersion,
				name: "Loading version options...",
				date: ""
			}]
		}
		else {
			let options = Object.keys(versionConfig[server]).map(function(versionOption) {
				return {
					version: versionOption,
					name: namedVersions[server][versionOption] || "",
					date: new Date(versionConfig[server][versionOption].date)
				}
			});

			options.sort(function(a, b) {
				if (a.version === "latest") return -1;
				if (b.version === "latest") return 1;

				if (a.name && !b.name) return -1;
				if (!a.name && b.name) return 1;
				if (a.name && b.name) {
					if (a.name < b.name) return -1;
					else if (a.name > b.name) return 1;
					else return 0;
				}

				if (a.version < b.version) return -1;
				else if (a.version > b.version) return 1;
				else return 0;
			});

			let selectedVersionInList = false;
			options.forEach(function(versionOption) {
				if (versionOption.version === dataSourceVersion) {
					selectedVersionInList = true;
				}
			});

			if (!selectedVersionInList) {
				dataSourceVersion = options[0].version;
			}

			return options;
		}
	}

	onMount(function() {
		Promise.all(serverOptions.map(function(server) {
			return fetch("https://pricalc.b-cdn.net/" + server + "/masterdata/asset-versions.json")
				.then(function(response) {
					return response.json()
				})
				.then(function(json) {
					return {
						server: server,
						data: json
					}
				}).catch(function(error) {
					return { 
						server: server,
						data: null
					};
				})
		})).then(function(assetVersions) {
			versionConfig = {};
			assetVersions.forEach(function(versionInfo) {
				if (versionInfo.data !== null) {
					let fileName = Object.keys(versionInfo.data.files)[0];
					versionConfig[versionInfo.server] = {
						...versionInfo.data.files[fileName].versions
					}
					versionConfig[versionInfo.server].latest = versionConfig[versionInfo.server][versionInfo.data.latestVersion]
				}
			});
		});
	});
</script>

<h2>Settings</h2>

<div>
	<input type="checkbox" bind:checked={$includeExSkillStats} /> Include EX skill in stat calculations <br />
	<input type="checkbox" bind:checked={$hideImpossibleRarities} /> Hide 1* and 2* versions of units that are impossible to acquire <br />
	Theme: <select bind:value={$theme}>
		{#each Object.keys(themes) as theme}
		<option value={theme}>{themes[theme].name}</option>
		{/each}
	</select><br />
	Data source server:
	<select bind:value={dataSourceServer}>
		{#each serverOptions as server}
		<option value={server}>{server.toUpperCase()}</option>
		{/each}
	</select><br />
	Data source version:
	<select bind:value={dataSourceVersion}>
		{#each versionOptions as versionOpt}
		<option value={versionOpt.version}>
			{versionOpt.version}
			{#if versionOpt.name}
			 ({versionOpt.name})
			{/if}
			{#if versionOpt.date}
			 - {versionOpt.date.toLocaleDateString()}
			{/if}
		</option>
		{/each}
	</select>
	<div class="button" on:click={closeModal}>OK</div>
</div>

<style>
	h2 {
		text-align: center;
	}
</style>