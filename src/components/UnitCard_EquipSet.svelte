<script>
	import { lookupEquipmentSet, lookupEquipmentData, lookupRefineData, getMaxRefine } from "@src/priconne.js"
	import { createEventDispatcher } from "svelte";

	export let unitId = -1;
	export let rank = 1;
	export let equipment = {
		slot1: {
			equipped: false,
			refine: 0,
			id: -1
		},
		slot2: {
			equipped: false,
			refine: 0,
			id: -1
		},
		slot3: {
			equipped: false,
			refine: 0,
			id: -1
		},
		slot4: {
			equipped: false,
			refine: 0,
			id: -1
		},
		slot5: {
			equipped: false,
			refine: 0,
			id: -1
		},
		slot6: {
			equipped: false,
			refine: 0,
			id: -1
		}
	}

	const dispatch = createEventDispatcher();

	let equipmentSet;
	let equipmentSetData;
	let equipmentRefineData;
	let equipmentImages;
	$: equipmentSet = lookupEquipmentSet(unitId, rank);
	$: equipmentData = getEquipmentDataSet(equipmentSet);
	$: equipmentMaxRefine = getMaxRefineSet(equipmentSet);
	$: equipmentImages = getEquipmentImages(equipment, equipmentSet);

	let allEquipped = false;
	let allRefined = false;
	$: allEquipped = isAllEquipped(equipment);
	$: allRefined = isAllRefined(equipment, equipmentMaxRefine);

	function isAllEquipped(equipment) {
		for (var i = 1; i <= 6; i++) {
			if (!equipment["slot" + i].equipped) {
				return false;
			}
		}
		return true;
	}

	function isAllRefined(equipment, equipmentMaxRefine) {
		for (var i = 1; i <= 6; i++) {
			if (!equipment["slot" + i].equipped || equipment["slot" + i].refine < equipmentMaxRefine["slot" + i]) {
				return false;
			}
		}
		return true;
	}

	function getEquipmentDataSet(equipmentSet) {
		var equipmentData = {};
		if (equipmentSet) {
			for (var i = 1; i <= 6; i++) {
				equipmentData["slot" + i] = lookupEquipmentData(equipmentSet["equip_slot_" + i]);
			}
		}
		return equipmentData;
	}

	function getMaxRefineSet(equipmentSet) {
		var maxRefine = {};
		for (var i = 1; i <= 6; i++) {
			if (equipmentSet) {
				maxRefine["slot" + i] = getMaxRefine(lookupRefineData(equipmentSet["equip_slot_" + i]));
			}
			else {
				maxRefine["slot" + i] = 0;
			}
		}
		return maxRefine;
	}

	function getEquipmentImages(equipment, equipmentSet) {
		var equipmentImages = {}
		for (var i = 1; i <= 6; i++) {
			if (!equipmentSet || equipmentSet["equip_slot_" + i] === 999999) {
				equipmentImages["slot" + i] = "images/equipment/icon_icon_equipment_999999.png";
			}
			else {
				if (equipment["slot" + i].equipped) {
					equipmentImages["slot" + i] = "images/equipment/icon_icon_equipment_" + equipmentSet["equip_slot_" + i] + ".png";
				}
				else {
					equipmentImages["slot" + i] = "images/equipment/icon_icon_equipment_invalid_" + equipmentSet["equip_slot_" + i] + ".png";
				}
			}
		}
		return equipmentImages;
	}

	function toggleEquip(slot) {
		return function(e) {
			equipment["slot" + slot].equipped = !equipment["slot" + slot].equipped;
			if (!equipment["slot" + slot].equipped) {
				equipment["slot" + slot].refine = 0;
			}
			dispatch("change", {})
		}
	}

	function setRefine(slot, refineNum) {
		return function(e) {
			if (equipment["slot" + slot].refine === refineNum) {
				equipment["slot" + slot].refine = 0;
			}
			else {
				equipment["slot" + slot].refine = refineNum;
				if (!equipment["slot" + slot].equipped) {
					equipment["slot" + slot].equipped = true;
				}
			}
			dispatch("change", {})
		}
	}

	function toggleAllEquip() {
		for (var i = 1; i <= 6; i++) {
			if (allEquipped) {
				equipment["slot" + i].equipped = false;
				equipment["slot" + i].refine = 0;
			}
			else {
				equipment["slot" + i].equipped = true;
			}
		}
		dispatch("change", {})
	}

	function toggleAllRefine() {
		for (var i = 1; i <= 6; i++) {
			if (allRefined) {
				equipment["slot" + i].refine = 0;
			}
			else {
				equipment["slot" + i].equipped = true;
				equipment["slot" + i].refine = equipmentMaxRefine["slot" + i];
			}
		}
		dispatch("change", {})
	}
</script>

<div class="card-section">
	<div class="card-section-header">Equipment</div>
	<table class="equipment-set">
	{#each [0,1,2] as row}
		<!-- wanted to do it this way but svelte doesn't like it: {#if slot % 2 === 1} -->
		<tr>
		{#each [row*2+1, row*2+2] as slot}
			<td>
				<img class="equipment" src={equipmentImages["slot" + slot]} on:click={toggleEquip(slot)} />
				<div class="rarity-toggle">
					{#each [1,2,3,4,5] as refineNum}
						{#if equipmentMaxRefine["slot" + slot] >= refineNum}
							{#if equipment["slot" + slot].refine >= refineNum}
								<img class="rarity-star" src="images/star_filled.svg" on:click={setRefine(slot, refineNum)} />
							{:else}
								<img class="rarity-star" src="images/star_empty.svg" on:click={setRefine(slot, refineNum)} />
							{/if}
						{/if}
					{/each}
				</div>
			</td>
		{/each}
		</tr>

	{/each}
	</table>
	<div class="buttons">
		<div class="button" id="button-equip" on:click={toggleAllEquip}>
			{#if !allEquipped}
			Equip All
			{:else}
			Unequip All
			{/if}
		</div>
		<div class="button" id="button-refine" on:click={toggleAllRefine}>
			{#if !allRefined}
			Refine All
			{:else}
			Unrefine All
			{/if}
		</div>
	</div>
</div>

<style>
td {
	padding: 5px 10px;
}

img.equipment {
	width: 90px;
	cursor: pointer;
}

img.rarity-star {
	opacity: 0.7;
	width: 15px;
	cursor: pointer;
}

img.rarity-star:hover {
	opacity: 1;
}

div.rarity-toggle {
	height: 15px;
}

div.button {
	padding: 5px;
	width: 210px;
	margin: 5px 0;
}
</style>