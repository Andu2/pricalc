<script>
import { lookupRows, DROPPABLE_ITEMS } from "@src/data/priconnedb"
import { sortByAttr } from "@src/utils"

export let itemId;

$: itemType = getItemType(itemId);

function getItemType(itemId) {
	if (itemId / 100000 < 1) return "item";
	else return "equipment";
}

// TODO: If this component is used in a context other than drops, move this filter out of this component
let items = lookupRows("item_data", {}).filter(function(item) {
	return (DROPPABLE_ITEMS.indexOf(item.item_id) > -1)
}).sort(sortByAttr("item_type"));
let equipment = lookupRows("equipment_data", {}).filter(function(equipment) {
	return (DROPPABLE_ITEMS.indexOf(equipment.equipment_id) > -1)
}).sort(sortByAttr("promotion_level"));

let options = {
	items: items.map(function(item) {
		return {
			id: item.item_id,
			name: item.item_name
		}
	}),
	equipment: equipment.map(function(equipment) {
		return {
			id: equipment.equipment_id,
			name: equipment.equipment_name
		}
	})
}

let isSelecting = false;
let selectTab = getInitialSelectTab(itemId);

function getInitialSelectTab(itemId) {
	let itemType = getItemType(itemId);
	if (itemType === "equipment") return "equipment";
	else return "items";
}

$: selectRows = getItemSelectionRows(selectTab);

$: itemImg = getItemImg(itemId);

function getItemSelectionRows(selectTab) {
	let rows = [];
	let selectionColumns = 6;
	options[selectTab].forEach(function(item, i) {
		if (i % selectionColumns === 0) {
			rows.push([]);
		}
		rows.slice(-1)[0].push(item);
	});
	return rows;
}

function getItemImg(itemId) {
	if (itemId > -1) {
		let itemType = getItemType(itemId);
		if (itemType === "item") {
			return "images/item/icon_icon_item_" + itemId + ".png";
		}
		else if (itemType === "equipment") {
			return "images/equipment/icon_icon_equipment_" + itemId + ".png";
		}
	}
		
	return "images/unit/unit_icon_unit_unknown.png";
}

function selectItem(id) {
	return function() {
		itemId = id;
		isSelecting = false;
	}
}

function startSelect() {
	isSelecting = true;
}

function switchTab(tabName) {
	return function() {
		selectTab = tabName;
	}
}
</script>

<img class="item-image" src={itemImg} on:click={startSelect} />

<div class="item-select" class:is-selecting={isSelecting}>
	<div class="fade-background" on:click={selectItem(itemId)}></div>
	<div class="item-list-wrap">
		<div class="item-list-header">
			<h2>Select an item</h2>
			<div class="item-tabs-wrap">
				<table class="item-tabs"><tr>
					<td><div class="tab" class:selected={selectTab === "items"} on:click={switchTab("items")}>Items</div></td>
					<td><div class="tab" class:selected={selectTab === "equipment"} on:click={switchTab("equipment")}>Equipment</div></td>
				</tr></table>
			</div>
			<!-- <div class="tabs-shadow"></div> -->
		</div>
		<div class="item-list">
			<table class="items">
				{#each selectRows as selectRow}
				<tr>
					{#each selectRow as item}
					<td class="select-item" on:click={selectItem(item.id)}>
						<img class="select-icon" src={getItemImg(item.id)} /><br />
						<!-- <span class="select-item-name">{item.name}</span> -->
					</td>
					{/each}
				</tr>
				{/each}
			</table>
		</div>
	</div>
</div>

<style>
h2 {
/*	position: sticky;
	background-color: white;*/
}

table.items {
	border-spacing: 8px;
	margin: 0 auto;
}

table.item-tabs {
	position: absolute;
	top:0; left: 0; right: 0;
	width: 100%;
	height: 40px;
	overflow-y: visible;
	table-layout: fixed;
	font-size: 14pt;
	border-spacing: 0;
	padding: 0; margin: 0;
}

div.item-tabs-wrap {
	position: absolute;
	right: 0; left: 0; bottom: 3px;
	height: 40px;
	z-index: 1000;
	overflow-y: visible;
	background-color: #e7eef8;
	box-shadow: 0 0 7px #163b5a;
	/* You would not believe how fucking mad I got trying to get the tab border to
	show on top of the box shadow. Had to avoid using a background color on the tabs */
}

table.item-tabs td {
	height: 40px;
	overflow-y: visible;
	padding: 0; margin: 0;
}

div.tab {
	color: #303b5a;
	height: 40px;
	overflow-y: visible;
	line-height: 40px;
	border-bottom: 3px solid transparent;
	cursor: pointer;
}

/*div.tabs-shadow {
	position: absolute;
	bottom: 3px; left: 0; right: 0;
	height: 10px;
	box-shadow: 0 0 7px #163b5a;
}*/

div.tab.selected {
	border-bottom-color: #7080af;
}

div.tab:hover {
	color: #ef7485;
	border-bottom-color: #ef7485;
}

img.item-image {
	cursor: pointer;
	width: 128px;
	height: 128px;
}
img.item-image:hover {
	opacity: 0.8;
}

img.select-icon {
	width: 76px;
	height: 76px;
}
img.select-icon.large-icon {
	width: 115px;
	height: 115px;
}

div.item-select {
	display: none;
	position: fixed;
	z-index: 50;
}
div.is-selecting {
	display: block;
	top: 45px;
	left: 0; right: 0; bottom: 0;
}
div.fade-background {
	background-color: black;
	opacity: 0.5;
	position: absolute;
	left:0; right: 0; top: 0; bottom: 0;
}

div.item-list-wrap {
	position: absolute;
	margin: 0 auto;
	top: 0; left: 0; right: 0; bottom :0;
	background-color: white;
	width: 550px;
	padding: 20px;
	text-align: center;
	overflow: hidden;
}

div.item-list-header {
	position: absolute;
	top: 0;	left: 0; right: 0;
	height: 113px;
}

div.item-list-header h2 {
	position: absolute;
	top: 0;	left: 0; right: 0; bottom: 43px;
	margin: 0;
	line-height: 70px;
	z-index: 2000;
	background-color: white;
}

div.item-list {
	position: absolute;
	padding: 10px 0;
	top: 110px; left: 0; right: 0; bottom :0;
	overflow-y: auto;
}

td.select-item {
	cursor: pointer;
	color: #303b5a;
	text-align: center;
	max-width: 76px;
}
td.select-item.large-icon {
	max-width: 115px;
	height: 163px;
}
td.select-item:hover {
	opacity: 0.8;
}

span.select-item-name {
	padding-bottom: 5px;
}
</style>