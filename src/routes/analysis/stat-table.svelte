<script>
	import { STAT_NAMES, STAT_DISPLAY_NAMES, UNLOCKED_UNITS, MAX_LEVEL, MAX_RANK, MAX_RANK_EQUIPMENT } from "@src/data/priconnedb";
	import { createActor, calculatePower, calculateEffectivePhysicalHp, calculateEffectiveMagicHp } from "@src/logic/unit";
	import DopeAssTable from "@src/components/DopeAssTable.svelte";
	import { includeExSkillStats } from "@src/settings.js";

	let tableData;
	let tableColumns;

	const alwaysDisplayCols = ["icon", "name"];
	let columnConfig = {
		"icon": {
			attr: "icon",
			displayName: "Icon",
			sort: null,
			html: true
		},
		"name": {
			attr: "name",
			displayName: "Name",
			sort: "default"
		},
		"effective_physical_hp": {
			attr: "effective_physical_hp",
			displayName: "Effective Physical HP",
			sort: "default"
		},
		"effective_magic_hp": {
			attr: "effective_magic_hp",
			displayName: "Effective Magic HP",
			sort: "default"
		},
		"power": {
			attr: "power",
			displayName: "Power",
			sort: "default"
		}
	}
	STAT_NAMES.forEach(function(stat) {
		columnConfig[stat] = {
			attr: stat,
			displayName: STAT_DISPLAY_NAMES[stat],
			sort: "default"
		}
	});

	let toggleDisplayCols = {
		"hp": true,
		"atk": true,
		"def": true,
		"magic_str": true, 
		"magic_def": true,
		"physical_critical": false,
		"magic_critical": false, 
		"wave_hp_recovery": false,
		"wave_energy_recovery": false,
		"dodge": false,
		"life_steal": false,
		"hp_recovery_rate": false,
		"energy_recovery_rate": false,
		"energy_reduce_rate": false,
		"accuracy": false,
		"effective_physical_hp": true, // calculated value
		"effective_magic_hp": true, // calculated value
		"power": false // calculated value
	}

	let maxedActors = calculateMaxedActors();
	tableData = calculateTableData(maxedActors);
	$: tableColumns = calculateTableColumns(toggleDisplayCols);

	function calculateMaxedActors() {
		return UNLOCKED_UNITS.map(function(unitData) {
			return createActor({
				id: unitData.unit_id,
				rarity: 5,
				level: MAX_LEVEL,
				bond: 8,
				rank: MAX_RANK,
				equipment: {
					slot1: {
						equipped: true,
						refine: 5,
					},
					slot2: {
						equipped: true,
						refine: 5,
					},
					slot3: {
						equipped: true,
						refine: 5,
					},
					slot4: {
						equipped: true,
						refine: 5,
					},
					slot5: {
						equipped: true,
						refine: 5,
					},
					slot6: {
						equipped: true,
						refine: 5,
					}
				},
				skills: {
					union_burst: 1,
					main_skill_1: 1,
					main_skill_2: 1,
					ex_skill_1: MAX_LEVEL
				}
			}, {
				includeExSkillStats: $includeExSkillStats
			});
		});
	}

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

	function calculateTableData() {
		return maxedActors.map(function(actor) {
			var unitIdString = actor.id + "";
			var unitIdWithRarity = unitIdString.slice(0, 4) + "3" + unitIdString.slice(-1); 
			var charImg = "images/unit/unit_icon_unit_" + unitIdWithRarity + ".png";

			var row = {
				icon: "<img class=\"table-icon\" src=\"" + charImg + "\" />",
				name: actor.unitData.unit_name,
				power: Math.round(calculatePower(actor)),
				effective_physical_hp: Math.round(calculateEffectivePhysicalHp(actor)),
				effective_magic_hp: Math.round(calculateEffectiveMagicHp(actor))
			};
			STAT_NAMES.forEach(function(stat) {
				row[stat] = Math.round(actor[stat]);
			})
			
			return row;
		});
	}

</script>
<table id="stats-table-table">
	<tr>
		<td id="stats-table-config">
			<p>Stats listed are for 5* rarity at the maximum current rank.
			</p>
			<h4>Stats to include</h4>
			{#each Object.keys(toggleDisplayCols) as attr}
			<input type="checkbox" bind:checked={toggleDisplayCols[attr]} /> {columnConfig[attr].displayName}<br />
			{/each}
		</td>
		<td id="stats-table">
			<div class="table-wrap">
				<DopeAssTable data={tableData} columns={tableColumns} />
			</div>
		</td>
	</tr>
</table>
<p>
	Effective physical HP takes dodge chance into account. Numbers may be a bit off because of rounding errors. (If you have an example of some numbers that are off, I would like to know, because I would like to figure out exactly where and how the game decides to round values.)
</p>

<style>
td#stats-table-config {
	width: 180px;
	border-right: 2px solid #cfe4ff;
}

table#stats-table-table {
	table-layout: fixed;
	width: 100%;
}

td#stats-table {
	padding-left: 10px;
}

div.table-wrap {
	overflow-x: auto;
}
</style>