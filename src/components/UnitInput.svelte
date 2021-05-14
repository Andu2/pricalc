<script>
import { getUnitType, getUnitImg } from "@src/logic";
import UnitSelect from "@src/components/UnitSelect.svelte";
import { showModal, closeModal } from "@src/components/Modal.svelte";

export let unitId;
export let prefabId = null;
export let rarity;

$: charImg = getUnitImg(unitId, { rarity: rarity, useMissingImage: false, usePrefabId: true });

function selectUnit(id) {
	unitId = id;
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

<div class="char-image-wrap">
	<img class="char-image" src={charImg} on:click={showUnitSelect} />
	<div class="icon-pencil"></div>
</div>

<style>
div.char-image-wrap {
	display: inline-block;
	position: relative;
}

div.icon-pencil {
	position: absolute;
	top: 5px;
	right: 5px;
	font-size: 20px;
	pointer-events: none;
	color: #163b5a;
    text-shadow: 0 0 2px #ffffff;
}

img.char-image {
	cursor: pointer;
	width: 128px;
	height: 128px;
	border-radius: 10px;
	box-shadow: 0 1px 3px 1px #163b5a;
	background-color: #e7eef7;
}

div.char-image-wrap:hover img.char-image {
	opacity: 0.8;
}

div.char-image-wrap:hover div.icon-pencil {
	color: var(--linkHover);
}
</style>