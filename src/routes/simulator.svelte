<script>
	import Team from "@src/components/Team.svelte";
	import Tooltip from "@src/components/Tooltip.svelte";
	import UnitConfig from "@src/components/UnitConfig.svelte";
	import DistanceMatrix from "@src/components/DistanceMatrix.svelte";
	import { setContext } from "svelte";
	import { writable } from "svelte/store";
	import { baseUnitConfig, savedSimTeam } from "@src/settings.js"
	import { isValidUnitConfiguration } from "@src/logic/unit";
	import { createBattlefield } from "@src/logic/battle";

	let unitConfigs = $savedSimTeam;
	for (var key in unitConfigs.offense) {
		if (!isValidUnitConfiguration(unitConfigs.offense[key])) {
			unitConfigs.offense[key] = baseUnitConfig;
		}
	}
	for (var key in unitConfigs.defense) {
		if (!isValidUnitConfiguration(unitConfigs.defense[key])) {
			unitConfigs.defense[key] = baseUnitConfig;
		}
	}

	let tabs = [{
		tabId: "team",
		displayName: "Configuration"
	}, {
		tabId: "sim",
		displayName: "Simulation"
	}, {
		tabId: "distance",
		displayName: "Distances"
	}];
	let currentTab = tabs[0].tabId;

	let slotEditing = writable(null);
	$: configEditing = getConfigEditing($slotEditing);
	$: setConfig(configEditing);

	setContext("unitSlot", slotEditing)

	$: battlefield = createBattlefield(unitConfigs.offense, unitConfigs.defense);
	$: console.log(battlefield);

	function getConfigEditing(slotId) {
		if (slotId === null) return null;
		let slotSplit = slotId.split(".");
		return unitConfigs[slotSplit[0]][slotSplit[1]];
	}

	function setConfig(configEditing) {
		if ($slotEditing) {
			let slotSplit = $slotEditing.split(".");
			unitConfigs[slotSplit[0]][slotSplit[1]] = {...configEditing};
		}

		savedSimTeam.set(unitConfigs)
	}

	function swapTeams() {
		let temp = unitConfigs.defense;
		unitConfigs.defense = unitConfigs.offense;
		unitConfigs.offense = temp;
		if ($slotEditing.indexOf("offense") > -1) {
			slotEditing.set($slotEditing.replace("offense", "defense"));
		}
		else {
			slotEditing.set($slotEditing.replace("defense", "offense"));
		}
	}

	function deselect(event) {
		return;
		if (event.target.id === "teams") {
			slotEditing.set(null);
		}
	}

	function createSelectTabHandler(tabId) {
		return function(e) {
			currentTab = tabId;
		}
	}
</script>

<div id="simulator-tabs-wrap">
	<div id="simulator-tabs">
		{#each tabs as tabData}
		<div class="tab" class:selected={currentTab === tabData.tabId} on:click={createSelectTabHandler(tabData.tabId)}>{tabData.displayName}</div>
		{/each}
	</div>
</div>

{#if currentTab === "team"}
<h2>Battle Settings</h2>
<div>
	Battle type: <select>
		<option value="arena">Arena / Princess Arena</option>
		<option value="story">Story / Dungeon / Clan Battle</option>
	</select>
</div>

<h2>Teams</h2>
<div id="teams" on:click={deselect}>
	<Team team={unitConfigs.offense} name={"Offense"} isDefense={false} />
	<div class="icon-swap" on:click={swapTeams}></div>
	<Team team={unitConfigs.defense} name={"Defense"} isDefense={true} />
</div>

<div id="unit-config">
	<UnitConfig bind:unitConfig={configEditing} />
</div>
{/if}

{#if currentTab === "sim"}
<h2>Manual Simulation</h2>
{/if}

{#if currentTab === "distance"}
<h2>Unit Distance</h2>
<div id="simulation">
	<DistanceMatrix battlefield={battlefield} />
	<h3>Skill priority 
		<Tooltip header={"Skill Priority"} text={"The unit that moved last will act last. Offense moves before defense."} />
	</h3>
	<ul>
		{#each battlefield.skillQueue as queuedActor}
		<li>{queuedActor.side} {queuedActor.name}</li>
		{/each}
	</ul>
</div>
{/if}

{#if currentTab === "help"}
<p>
	This early version of the simulator is only able to show initial unit distances. 
	It's not much, but it's useful for checking area attack ranges and Saren charges.
	The next step is to add a "manual mode" which will let you trigger skill effects manually.
	After that, once I figure out precise animation timings, will be an actual auto battle simulator! All coming soon™
</p>
{/if}

<style>
	div#simulator-tabs-wrap {
		height: 70px;
		overflow: hidden;
		position: relative;
	}

	div#simulator-tabs {
		position: absolute;
		left: 0; right: 0; top: 0;
		height: 40px;
		overflow-y: visible;
/*		background-color: #e7eef8;*/
		box-shadow: 0 0 7px #163b5a;
	}

/*	table.unit-tabs td {
		height: 40px;
		overflow-y: visible;
		padding: 0; margin: 0;
	}*/

	div.tab {
		color: #303b5a;
		height: 40px;
		overflow-y: visible;
		line-height: 40px;
		border-bottom: 3px solid transparent;
		cursor: pointer;
		display: inline-block;
		padding:0 20px;
		font-size: 13pt;
	}

	div.tab.selected {
		border-bottom-color: #7080af;
	}

	div.tab:hover {
		color: #ef7485;
		border-bottom-color: #ef7485;
	}

	div#teams {
		display: flex;
		align-items: center;
	}

	div.icon-swap {
		font-size: 30px;
		padding: 10px;
		cursor: pointer;
		color: #7080af;
	}

	div.icon-swap:hover {
		color: #ef7485;
	}
</style>

