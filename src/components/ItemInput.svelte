<script>
import { getItemImg } from "@src/logic/ui";
import ItemSelect from "@src/components/ItemSelect.svelte";
import { showModal, closeModal } from "@src/components/Modal.svelte";

export let itemId;

$: itemImg = getItemImg(itemId);

function selectItem(id) {
	itemId = id;
	closeModal();
}

function showItemSelect() {
	showModal(ItemSelect, { 
		props: { 
			itemId: itemId,
			selectCallback: selectItem
		}
	});
}

</script>

<img class="item-image" src={itemImg} on:click={showItemSelect} />

<style>
img.item-image {
	cursor: pointer;
	width: 128px;
	height: 128px;
}
img.item-image:hover {
	opacity: 0.8;
}
</style>