<script>
	// Config isn't managed in this component, this just represents a unit config that can be selected
	import { getUnitImg } from "@src/logic/ui";
	import { getContext } from "svelte";

	export let slotId;
	export let unitId = -1;
	export let enemyId = -1;
	export let rarity = 1;

	$: charImg = getUnitImg(unitId, rarity, enemyId);

	let unitSlot = getContext("unitSlot");
	$: isSelected = $unitSlot === slotId;

	function toggleSlotSelect() {
		if (isSelected) {
			unitSlot.set(null)
		}
		else {
			unitSlot.set(slotId);
		}
	}

</script>

<img class="char-image" class:selected={isSelected} src={charImg} on:click={toggleSlotSelect} />

<style>
img.char-image {
	cursor: pointer;
	width: 64px;
	height: 64px;
	border-radius: 6px;
}

img.char-image:hover {
	opacity: 0.8;
}

img.selected {
	box-shadow: 0 0 3px 2px #303b5a;
}
</style>