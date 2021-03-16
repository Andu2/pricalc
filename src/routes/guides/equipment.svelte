<script>
import DopeAssTable from "@src/components/DopeAssTable.svelte";
import { lookupRows, STAT_NAMES, STAT_DISPLAY_NAMES } from "@src/data/priconnedb";
import { getMaxRefine } from "@src/logic/unit";
import { sortByAttr } from "@src/utils";

let equipment = lookupRows("equipment_data", {});
let maxRefine = false;

$: data = getEquipmentTableData(maxRefine);

function getEquipmentTableData(maxRefine) {
	return equipment.filter(isNotFragment).map(function(equipData) {
		let rowData = {
			icon: "<img class=\"table-icon\" src=\"images/equipment/icon_icon_equipment_" + equipData.equipment_id + ".png\">",
			name: equipData.equipment_name,
			rarity: equipData.promotion_level,
			refine: getMaxRefine(equipData),
			level: equipData.require_level,
			price: equipData.sale_price,
			description: equipData.description
		}

		let craftData = lookupRows("equipment_craft", { equipment_id: equipData.equipment_id })[0];
		if (craftData === undefined) {
			rowData.fragments = 0;
		}
		else {
			// It's always the first item
			rowData.fragments = craftData.consume_num_1;
			// for (var i = 1; i <= 5; i++) {
			// 	if (craftData["condition_equipment_id_" + i])
			// }
		}

		STAT_NAMES.forEach(function(stat) {
			rowData[stat] = Math.ceil(equipData[stat]);
		});

		if (maxRefine) {
			let refineData = lookupRows("equipment_enhance_rate", { equipment_id: equipData.equipment_id })[0];
			STAT_NAMES.forEach(function(stat) {
				rowData[stat] += Math.ceil(refineData[stat] * rowData.refine);
			});
		}
		rowData.power = calculatePowerSimple(rowData);

		return rowData;
	}).sort(sortByAttr("level"));
}

function isNotFragment(equipData) {
	return (equipData.enable_donation === 0 || equipData.promotion_level <= 1);
}

function calculatePowerSimple(stats) {
	var power = 0;
	var weights = lookupRows("unit_status_coefficient", {})[0]
	STAT_NAMES.forEach(function(stat) {
		power += stats[stat] * weights[stat + "_coefficient"];
	});
	power = Math.round(power);
	return power;
}

const alwaysDisplayCols = ["icon", "name"];
let columnConfig = {
	"icon": {
		attr: "icon",
		sort: null,
		html: true,
		displayName: "Icon"
	}, 
	"name": {
		attr: "name",
		sort: "default",
		displayName: "Name"
	}, 
	"rarity": {
		attr: "rarity",
		sort: "default",
		displayName: "Rarity"
	}, 
	"refine": {
		attr: "refine",
		sort: "default",
		displayName: "Refine Levels"
	},
	"fragments": {
		attr: "fragments",
		sort: "default",
		displayName: "Fragments"
	}, 
	"level": {
		attr: "level",
		sort: "default",
		displayName: "Required Level"
	}, 
	"price": {
		attr: "price",
		sort: "default",
		displayName: "Sell Price"
	}, 
	"power": {
		attr: "power",
		displayName: "Power",
		sort: "default"
	},
	"description": {
		attr: "description",
		sort: "default",
		displayName: "Description"
	}
};

STAT_NAMES.forEach(function(stat) {
	columnConfig[stat] = {
		attr: stat,
		displayName: STAT_DISPLAY_NAMES[stat],
		sort: "default"
	}
});

let toggleDisplayCols = {
	"rarity": false,
	"fragments": true,
	"refine": false,
	"level": true,
	"price": false,
	"hp": true,
	"atk": true,
	"def": true,
	"magic_str": true, 
	"magic_def": true,
	"physical_critical": true,
	"magic_critical": true, 
	"wave_hp_recovery": true,
	"wave_energy_recovery": true,
	"dodge": true,
	"life_steal": true,
	"hp_recovery_rate": true,
	"energy_recovery_rate": true,
	"energy_reduce_rate": false,
	"accuracy": false,
	"power": false, // calculated value
	"description": false
}

$: columns = calculateTableColumns(toggleDisplayCols);

function calculateTableColumns(toggleDisplayCols) {
	var tableColumns = [];
	alwaysDisplayCols.forEach(function(attr) {
		tableColumns.push(columnConfig[attr]);
	});

	for (var attr in toggleDisplayCols) {
		if (toggleDisplayCols[attr]) {
			tableColumns.push(columnConfig[attr]);
		}
	}

	return tableColumns;
}

function resetColumns() {
	for (var col in toggleDisplayCols) {
		toggleDisplayCols[col] = false;
	}
}

function showStats() {
	for (var col in toggleDisplayCols) {
		if (STAT_NAMES.indexOf(col) > -1) {
			toggleDisplayCols[col] = true;
		}
	}
}
</script>

<table id="equip-table-table">
	<tr>
		<td id="equip-table-config">
			<h4>Options</h4>
			<input type="checkbox" bind:checked={maxRefine} /> Max refine
			<h4>Columns to include</h4>
			{#each Object.keys(toggleDisplayCols) as attr}
			<input type="checkbox" bind:checked={toggleDisplayCols[attr]} /> {columnConfig[attr].displayName}<br />
			{/each}
			<div class="button" on:click={showStats}>Show stat columns</div>
			<div class="button" on:click={resetColumns}>Hide all columns</div>
		</td>
		<td id="equip-table">
			<div class="table-wrap">
				<DopeAssTable data={data} columns={columns} />
			</div>
		</td>
	</tr>
</table>

<style>
td#equip-table-config {
	width: 180px;
	border-right: 2px solid #cfe4ff;
}

table#equip-table-table {
	table-layout: fixed;
	width: 100%;
}

td#equip-table {
	padding-left: 10px;
}

div.table-wrap {
	overflow-x: auto;
}

div.button {
	margin: 10px 0;
	padding: 5px 0;
	width: 160px;
}
</style>