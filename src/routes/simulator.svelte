<script>
	import Team from "@src/components/Team.svelte";
	import UnitConfig from "@src/components/UnitConfig.svelte";
	import DistanceMatrix from "@src/components/DistanceMatrix.svelte";
	import { setContext } from "svelte";
	import { writable } from "svelte/store";
	import { baseUnitConfig } from "@src/settings.js"
	import { isValidUnitConfiguration } from "@src/logic/unit";
	import { createBattlefield } from "@src/logic/battle";

	let unitConfigs = {
		offense: {
			unit1: baseUnitConfig,
			unit2: baseUnitConfig,
			unit3: baseUnitConfig,
			unit4: baseUnitConfig,
			unit5: baseUnitConfig
		},
		defense: {
			unit1: baseUnitConfig,
			unit2: baseUnitConfig,
			unit3: baseUnitConfig,
			unit4: baseUnitConfig,
			unit5: baseUnitConfig
		}
	}

	let slotEditing = writable(null);
	$: configEditing = getConfigEditing($slotEditing);
	$: setConfig(configEditing);

	setContext("unitSlot", slotEditing)

	$: battlefield = createBattlefield(unitConfigs.offense, unitConfigs.defense);
	$: console.log(battlefield);

	function getConfigEditing(slotId) {
		if (slotId === null) return null;
		let slotSplit = slotId.split(".");
		return {...unitConfigs[slotSplit[0]][slotSplit[1]]};
	}

	function setConfig(configEditing) {
		if ($slotEditing) {
			let slotSplit = $slotEditing.split(".");
			unitConfigs[slotSplit[0]][slotSplit[1]] = {...configEditing};
		}
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
</script>

<h2>Team Configuration</h2>
<div id="teams" on:click={deselect}>
	<div class="team-wrap">
		<h3>Offense</h3>
		<Team team={unitConfigs.offense} />
	</div>
	<div class="icon-swap" on:click={swapTeams}></div>
	<div class="team-wrap">
		<h3>Defense</h3>
		<Team team={unitConfigs.defense} isDefense={true} />
	</div>
</div>

<div id="unit-config">
	<UnitConfig bind:unitConfig={configEditing} />
</div>

<h2>Simulation</h2>
<div id="simulation">
	<DistanceMatrix battlefield={battlefield} />
</div>

<style>
	div#teams {
		display: flex;
		align-items: center;
	}

	div.team-wrap {
		text-align: center;
	}

	div.team-wrap h3 {
		margin: 4px 0;
	}

	div.icon-swap {
		font-size: 30px;
		padding: 10px;
		cursor: pointer;
		color: #ef7485;
	}

	div.icon-swap:hover {
		color: #566590;
	}
</style>

