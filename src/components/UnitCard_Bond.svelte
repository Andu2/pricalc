<script>
import Tooltip from "@src/components/Tooltip.svelte";
import { lookupRows } from "@src/data/priconnedb";
import { getUnitIdBase, storyAffectsUnit } from "@src/logic/unit";
import { getUnitImg } from "@src/logic/ui";

export let unitId;
export let bond;

let bondTooltip = "Bond stories boost stats for every version of that character. In Priconne Global, we currently do not have any alternate outfits, so this is currently irrelevant. We will first see this in action when the summer cards arrive. Summer Pecorine, for example, will be affected by regular Pecorine's bond boosts, and regular Pecorine will be affected by Summer Pecorine's bond boosts."
</script>

<div>
	<div class="heading">Bond Levels <Tooltip header={"Bond characters"} text={bondTooltip} /></div>
	<div class="bond-row">
		{#each Object.keys(bond) as storyGroup}
		<div class="bond-cell">
			<img src={getUnitImg(storyGroup + "11", { rarity: 3 })} /><br />
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