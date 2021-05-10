<script>
import { getItemImg } from "@src/logic";
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

<div class="item-image-wrap">
	<img class="item-image" src={itemImg} on:click={showItemSelect} />
	<div class="icon-pencil"></div>
</div>

<style>
div.item-image-wrap {
	display: inline-block;
	position: relative;
}

div.icon-pencil {
	position: absolute;
	top: 10px;
	right: 10px;
	font-size: 20px;
	pointer-events: none;
	color: #163b5a;
    text-shadow: 0 0 2px #ffffff;
}

img.item-image {
	cursor: pointer;
	width: 128px;
	height: 128px;
	/*border-radius: 11px;
	box-shadow: 0 1px 3px 1px #303b5a*/
}

div.item-image-wrap:hover img.item-image {
	opacity: 0.8;
}

div.item-image-wrap:hover div.icon-pencil {
	color: var(--funkyHighlight);
}
</style>
