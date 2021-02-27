<script>
import { UNLOCKED_UNITS } from "@src/data/priconnedb"
export let unitId;
export let rarity;

$: charImg = getCharImg(unitId, rarity);

let isSelecting = false;
const selectionColumns = 7;
let rows = [];
UNLOCKED_UNITS.forEach(function(unit, i) {
	if (i % selectionColumns === 0) {
		rows.push([]);
	}
	rows.slice(-1)[0].push(unit);
});

function getCharImg(unitId, rarity) {
	if (unitId > -1) {
		var unitIdString = unitId + "";
		var unitIdWithRarity = unitIdString.slice(0, 4) + (rarity >= 3 ? "3" : "1") + unitIdString.slice(-1); 
		return "images/unit/unit_icon_unit_" + unitIdWithRarity + ".png";
	}
	else {
		return "images/unit/unit_icon_unit_unknown.png";
	}
}

function getRarityId(unitId, rarity) {
	var unitIdString = unitId + "";
	return unitIdString.slice(0, 4) + rarity + unitIdString.slice(-1);
}

function selectUnit(id) {
	return function() {
		unitId = id;
		isSelecting = false;
	}
}

function startSelect() {
	isSelecting = true;
}
</script>

<img class="char-image" src={charImg} on:click={startSelect} />

<div class="unit-select" class:is-selecting={isSelecting}>
	<div class="fade-background" on:click={selectUnit(unitId)}></div>
	<div class="unit-list">
		<h2>Select a character</h2>
		<table>
			{#each rows as row}
			<tr>
				{#each row as unit}
				<td class="select-unit" on:click={selectUnit(unit.unit_id)}>
					<img class="select-icon" src={"images/unit/unit_icon_unit_" + getRarityId(unit.unit_id, 1) + ".png"} /><br />
					<span class="select-unit-name">{unit.unit_name}</span>
				</td>
				{/each}
			</tr>
			{/each}
		</table>
	</div>
</div>

<style>
h2 {
/*	position: sticky;
	background-color: white;*/
}

table {
	border-spacing: 8px;
	margin: 0 auto;
}

img.char-image {
	cursor: pointer;
	width: 128px;
	height: 128px;
}
img.char-image:hover {
	opacity: 0.8;
}

img.select-icon {
	width: 64px;
	height: 64px;
}

div.unit-select {
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

div.unit-list {
	position: absolute;
	margin: 0 auto;
	top: 0; left: 0; right: 0; bottom :0;
	background-color: white;
	width: 550px;
	padding: 20px;
	overflow-y: auto;
	text-align: center;
}

td.select-unit {
	cursor: pointer;
	color: #303b5a;
	text-align: center;
}
td.select-unit:hover {
	opacity: 0.8;
}

span.select-unit-name {
	padding-bottom: 5px;
}
</style>