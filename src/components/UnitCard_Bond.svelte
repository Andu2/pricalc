<script>
import Tooltip from "@src/components/Tooltip.svelte";
import { lookupRows } from "@src/data/priconnedb";
import { getUnitIdBase, storyAffectsUnit } from "@src/logic/unit";

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
		return Math.floor(storyId / 1000);
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
		if (bond[storyGroup] === undefined) {
			bond[storyGroup] = carryNumber;
		}
	});
}

function getCharImg(storyGroup) {
	return "images/unit/unit_icon_unit_" + storyGroup + "11.png";
}

let bondTooltip = "Reading bond stories boosts stats for every version of that character. In Priconne Global, we currently do not have any alternate outfits, so this is irrelevant. But, when our first limited character, Summer Pecorine, arrives, she will be affected by regular Pecorine's bond boosts, and regular Pecorine will be affected by Summer Pecorine's bond boosts."
</script>

<div>
	<div class="heading">Bond Levels <Tooltip header={"Bond characters"} text={bondTooltip} /></div>
	<div class="bond-row">
		{#each Object.keys(bond) as storyGroup}
		<div class="bond-cell">
			<img src={getCharImg(storyGroup)} /><br />
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

input {
	width: 50px;
}

img {
	width: 50px;
	height: 50px;
}
</style>