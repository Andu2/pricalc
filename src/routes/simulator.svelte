<script>
import DistanceMatrix from "@src/components/DistanceMatrix.svelte";
import UnitInput from "@src/components/UnitInput.svelte";
import { UNLOCKED_UNITS } from "@src/data/priconnedb";

const LIMA_ID = 105201;

let positionData = UNLOCKED_UNITS.reduce(function(accumulator, unitData) {
    accumulator[unitData.unit_id] = unitData.search_area_width;
	return accumulator;
}, {});

class Unit {
	constructor(slot) {
		this.slot = slot;
		this.resetPosition();
	}

	resetPosition() {
		this.position = 800 + (this.slot * 200);
		this.range = positionData[this.id] || 2000;
		this.inPosition = (this.id == LIMA_ID);
	}

	checkEnemyInRange(team) {
		if (this.inPosition) {
			return true;
		}

		for (var i = 0; i < team.length; i++) {
			if ((this.position + team[i].position) <= this.range) {
				this.inPosition = true;

				return true;
			}
		}

		this.inPosition = false;

		return false;
	}

	approach() {
		this.position -= 12;
	}
}

let slots = [5, 4, 3, 2, 1];

let defenseUnits = slots.map(function(i) { return new Unit(i) });
let offenseUnits = slots.map(function(i) { return new Unit(i) });

function advanceFrame() {
	var defenseApproach = defenseUnits.map((x) => x.checkEnemyInRange(offenseUnits));

	for (var i = 0; i < defenseApproach.length; i++) {
		if (!defenseApproach[i]) {
			defenseUnits[i].approach();
		}
	}

	var attackApproach = offenseUnits.map((x) => x.checkEnemyInRange(defenseUnits));

	for (var i = 0; i < attackApproach.length; i++) {
		if (!attackApproach[i]) {
			offenseUnits[i].approach();
		}
	}

	return !(defenseApproach.every(x => x) && attackApproach.every(x => x));
}

function runSimulation() {
	for (var i = 4; i >= 0; i--) {
		defenseUnits[i].resetPosition();
	}

	for (var i = 4; i >= 0; i--) {
		offenseUnits[i].resetPosition();
	}

	var canCalculate = false;

	for (var i = 4; i >= 0 && !canCalculate; i--) {
		if (defenseUnits[i].id && (defenseUnits[i].id != LIMA_ID)) {
			canCalculate = true;
		}
	}

	if (!canCalculate) {
		return false;
	}

	for (var i = 4; i >= 0 && !canCalculate; i--) {
		if (offenseUnits[i].id && (offenseUnits[i].id != LIMA_ID)) {
			canCalculate = true;
		}
	}

	if (!canCalculate) {
		return false;
	}

	while (advanceFrame()) {
	}

	defenseUnits = defenseUnits;
	offenseUnits = offenseUnits;

	return true;
}
</script>

todo

<!-- <h2>Team on Defense</h2>

{#each defenseUnits as unit}
  <UnitInput bind:unitId={unit.id} rarity={0} enemyId={-1} on:change={runSimulation} />
{/each}

<h2>Team on Offense</h2>

{#each offenseUnits as unit}
  <UnitInput bind:unitId={unit.id} rarity={0} enemyId={-1} on:change={runSimulation} />
{/each}

<h2>Predicted Initial Between-Opponent Distance</h2>

<DistanceMatrix bind:team1={defenseUnits} bind:team2={offenseUnits} />

<h2>Predicted Initial Between-Member Distance</h2>

<div style="display: flex;">

	<DistanceMatrix bind:team1={defenseUnits} bind:team2={defenseUnits} />

	<div style="width: 10em;" />

	<DistanceMatrix bind:team1={offenseUnits} bind:team2={offenseUnits} />

</div> -->

