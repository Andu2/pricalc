<script>
import { getUnitType } from "@src/logic/unit";
import { getUnitImg } from "@src/logic/ui";
import { lookupRows } from "@src/data/priconnedb"
import UnitSelect from "@src/components/UnitSelect.svelte";
import { showModal, closeModal } from "@src/components/Modal.svelte";

export let unitId;
export let enemyId;
export let rarity;

$: charImg = getUnitImg(unitId, rarity, enemyId);

function selectUnit(id) {
	unitId = id;
	// if (getUnitType(unitId) !== "character") {
	// 	let enemies = lookupRows("enemy_parameter", { unit_id: id });
	// 	if (enemies.length) {
	// 		enemyId = enemies[0].enemy_id;
	// 	}
	// }
	closeModal();
}

function showUnitSelect() {
	showModal(UnitSelect, { 
		props: { 
			unitId: unitId,
			selectCallback: selectUnit
		}
	});
}

</script>

<img class="char-image" src={charImg} on:click={showUnitSelect} />

<style>
img.char-image {
	cursor: pointer;
	width: 128px;
	height: 128px;
}
img.char-image:hover {
	opacity: 0.8;
}
</style>