<script>
import Tooltip from "@src/components/Tooltip.svelte";
import { lookupRows } from "@src/data/priconnedb";
import { getUnitIdBase, storyAffectsUnit } from "@src/logic/unit";
import { getUnitImg } from "@src/logic/ui";

export let unitId;
export let bond;

$: storyGroups = getRelevantStoryGroups(unitId);
$: setBondIds(storyGroups);

function getRelevantStoryGroups(unitId) {
	let relevantStoryIds = [];
	var charaStoryStatus = lookupRows("chara_story_status", {});
	charaStoryStatus.forEach(function(storyStatus) {
		if (storyAffectsUnit(storyStatus, unitId) && relevantStoryIds.indexOf(storyStatus.story_id) === -1) {
			relevantStoryIds.push(storyStatus.story_id);
		}
	});
	return relevantStoryIds.map(function(storyId) {
		return Math.floor(storyId / 1000) + "";
	});
}

function setBondIds(storyGroups) {
	bond = bond || {};

	// If the user has the units at the same bond, attempt to carry it over when switching units
	let carryNumber = 0;
	Object.keys(bond).forEach(function(key, i) {
		if (i === 0) {
			carryNumber = bond[key];
		}
		else if (bond[key] !== carryNumber) {
			carryNumber = 0;
		}
	});

	for (var storyGroup in bond) {
		if (storyGroups.indexOf(storyGroup) === -1) {
			delete bond[storyGroup];
		}
	}
	storyGroups.forEach(function(storyGroup) {
		let key = storyGroup + ""; // Need to force string keys. Number keys makes weird things happen
		if (bond[key] === undefined) {
			bond[key] = carryNumber;
		}
	});
}

let bondTooltip = "Bond stories boost stats for every version of that character. In Priconne Global, we currently do not have any alternate outfits, so this is currently irrelevant. We will first see this in action when the summer cards arrive. Summer Pecorine, for example, will be affected by regular Pecorine's bond boosts, and regular Pecorine will be affected by Summer Pecorine's bond boosts."
</script>

<div>
	<div class="heading">Bond Levels <Tooltip header={"Bond characters"} text={bondTooltip} /></div>
	<div class="bond-row">
		{#each Object.keys(bond) as storyGroup}
		<div class="bond-cell">
			<img src={getUnitImg(storyGroup + "11")} /><br />
			<input type="number" min=0 max=8 bind:value={bond[storyGroup]} />
		</div>
		{/each}
	</div>
</div>

<style>
div.heading {
	padding-bottom: 5px;
}

div.bond-cell {
	text-align: center;
	display: inline-block;
}

div.bond-cell + div.bond-cell {
	margin-left: 5px;
}

input {
	width: 50px;
}

img {
	width: 50px;
	height: 50px;
}
</style>