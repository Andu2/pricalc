<script>
	import { includeExSkillStats, hideImpossibleRarities, enScheduleOffset, dataSource, theme } from "@src/settings.js";
	import { getAssetVersions, SERVER_OPTIONS } from "@src/data";
	import { onMount, onDestroy } from "svelte";
	import { closeModal } from "@src/components/Modal.svelte";
	import themes from "@src/../themes.json";

	// This is not reactive. It will save to dataSource when settings is closed.
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

	const preferredVersion = {
		"en": "latest",
		// "jp": "10010810"
		"jp": "latest"
	}

	$: versionOptions = getVersionOptions(dataSourceServer, versionConfig);
	//$: $dataSource = getDataSource(dataSourceServer, dataSourceVersion);

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
				if (a.version === preferredVersion[server]) return -1;
				if (b.version === preferredVersion[server]) return 1;

				if (a.name && !b.name) return -1;
				if (!a.name && b.name) return 1;

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
				dataSourceVersion = preferredVersion[server];
			}

			return options;
		}
	}

	onMount(function() {
		Promise.all(SERVER_OPTIONS.map(getAssetVersions)).then(function(assetVersions) {
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

	onDestroy(function() {
		$dataSource = getDataSource(dataSourceServer, dataSourceVersion);
	});
</script>

<h2>Settings</h2>

<div>
	<table>
		<tr><td>
			<input type="checkbox" bind:checked={$includeExSkillStats} /> Include EX skill in stat calculations
		</td></tr>
		<tr><td>
			<input type="checkbox" bind:checked={$hideImpossibleRarities} /> Hide 1* and 2* versions of units that are impossible to acquire
		</td></tr>
<!-- 		<tr><td>
			Theme: <select bind:value={$theme}>
				{#each Object.keys(themes) as theme}
				<option value={theme}>{themes[theme].name}</option>
				{/each}
			</select>
		</td></tr> -->
	</table>

	<h3>Data Source</h3>

	<table>
		<tr><td>
			Data source server:
		</td><td>
			<select bind:value={dataSourceServer}>
				{#each SERVER_OPTIONS as server}
				<option value={server}>{server.toUpperCase()}</option>
				{/each}
			</select><br />
		</td>
		</tr><tr><td>
			Data source version:
		</td><td>
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
		</td></tr>
	</table>

	<h3>EN Schedule Offsets</h3>
	<table>
		<tr><td>Banner:</td><td><input bind:value={$enScheduleOffset.banner} type="number" size="2"> days</td></tr>
		<tr><td>Quest:</td><td><input bind:value={$enScheduleOffset.quest} type="number" size="2"> days</td></tr>
		<tr><td>Feature:</td><td><input bind:value={$enScheduleOffset.feature} type="number" size="2"> days</td></tr>
		<tr><td>Dungeon:</td><td><input bind:value={$enScheduleOffset.dungeon} type="number" size="2"> days</td></tr>
		<tr><td>Grotto:</td><td><input bind:value={$enScheduleOffset.grotto} type="number" size="2"> days</td></tr>
		<tr><td>Shards:</td><td><input bind:value={$enScheduleOffset.shards} type="number" size="2"> days</td></tr>
		<tr><td>Arena Shuffle:</td><td><input bind:value={$enScheduleOffset.arenaShuffle} type="number" size="2"> days</td></tr>
		<tr><td>Furniture Level Cap:</td><td><input bind:value={$enScheduleOffset.furnitureLevelCap} type="number" size="2"> days</td></tr>
		<tr><td>Six Stars:</td><td><input bind:value={$enScheduleOffset.sixStars} type="number" size="2"> days</td></tr>
		<tr><td>Unique Equipment:</td><td><input bind:value={$enScheduleOffset.uniqueEquipment} type="number" size="2"> days</td></tr>
	</table>

	<div class="button" on:click={closeModal}>OK</div>
</div>

<style>
	h2 {
		text-align: center;
	}

	h3 {
		margin-bottom: 6px;
	}

	div.button {
		margin-top: 16px;
		margin-left: 150px;
		margin-right: 150px;
	}
</style>
