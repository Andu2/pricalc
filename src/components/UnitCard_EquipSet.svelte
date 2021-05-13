<script>
	import { lookupRows } from "@src/data/priconnedb"
	import { getMaxRefine } from "@src/logic/unit"
	import { getItemImg } from "@src/logic/ui";

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

	let equipmentSet;
	let equipmentSetData;
	let equipmentRefineData;
	let equipmentImages;
	$: equipmentSet = lookupRows("unit_promotion", { unit_id: unitId, promotion_level: rank })[0];
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
				equipmentData["slot" + i] = lookupRows("equipment_data", { equipment_id: equipmentSet["equip_slot_" + i] })[0];
			}
		}
		return equipmentData;
	}

	function getMaxRefineSet(equipmentSet) {
		var maxRefine = {};
		for (var i = 1; i <= 6; i++) {
			if (equipmentSet) {
				maxRefine["slot" + i] = getMaxRefine(lookupRows("equipment_enhance_rate", { equipment_id: equipmentSet["equip_slot_" + i] })[0]);
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
				equipmentImages["slot" + i] = getItemImg(999999);
			}
			else {
				if (equipment["slot" + i].equipped) {
					equipmentImages["slot" + i] = getItemImg(equipmentSet["equip_slot_" + i]);
				}
				else {
					equipmentImages["slot" + i] = getItemImg(equipmentSet["equip_slot_" + i], { invalid: true });
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
	}
</script>

<div class="card-section">
	<div class="card-section-header centered">Equipment</div>
	<div class="equipment-wrap">
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
									<div class="icon-star-full" on:click={setRefine(slot, refineNum)} ></div>
								{:else}
									<div class="icon-star-full unfull" on:click={setRefine(slot, refineNum)} ></div>
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
</div>

<style>
	div.card-section {
		min-width: 210px;
		/*max-width: 250px;*/
		flex-grow: 1;
		text-align: center;
	}

	div.equipment-wrap {
		display: inline-block;
	}

	td {
		padding: 5px 10px;
	}

	img.equipment {
		width: 90px;
		cursor: pointer;
	}

	img.equipment:hover {
		opacity: 0.8;
	}

	div.icon-star-full {
		display: inline-block;
		padding-right: 1px;
		font-size: 17px;
		cursor: pointer;
		color: #ffd049;
	}

	div.icon-star-full:hover {
		opacity: 0.8;
	}

	div.unfull {
		color: #ccd7e2;
	}

	div.rarity-toggle {
		height: 17px;
		padding-bottom: 5px;
	}

	div.button {
		padding: 5px;
		width: 210px;
		margin: 5px 0;
	}
</style>