<script>
	import { STAT_NAMES, STAT_DISPLAY_NAMES } from "@src/data/priconnedb";
	import { createActor, calculatePower, calculateEffectivePhysicalHp, calculateEffectiveMagicHp, getUnlockedUnits } from "@src/logic/unit";
	import DopeAssTable from "@src/components/DopeAssTable.svelte";
	import RaritySelect from "@src/components/RaritySelect.svelte";
	import { hideImpossibleRarities } from "@src/settings.js";

	let tableData;
	let tableColumns;

	let UNLOCKED_UNITS = [];

	const RANK_OPTIONS = [{
		rank: 7,
		slots: [1,2,3,4,5,6]
	}, {
		rank: 8,
		slots: [2,4,6] // TODO: do automatically isntead of manual
	}, {
		rank: 8,
		slots: [2,3,4,5,6] // TODO: do automatically isntead of manual
	}, {
		rank: 8,
		slots: [1,2,3,4,5,6]
	}, {
		rank: 9,
		slots: [2,4,6]
	}]
	let rank1 = 4;
	let rank2 = 3;
	let rarity = 3;

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
		"physical_critical": true,
		"magic_critical": true, 
		"wave_hp_recovery": false,
		"wave_energy_recovery": false,
		"dodge": true,
		"life_steal": true,
		"hp_recovery_rate": true,
		"energy_recovery_rate": true,
		"energy_reduce_rate": false,
		"accuracy": false,
		"effective_physical_hp": true, // calculated value
		"effective_magic_hp": true, // calculated value
		"power": false // calculated value
	}

	$: tableData = calculateStatDifferences(rank1, rank2, rarity, $hideImpossibleRarities);
	$: tableColumns = calculateTableColumns(toggleDisplayCols);

	function calculateStatDifferences(rank1, rank2, rarity) {
		let differences = [];
		UNLOCKED_UNITS.forEach(function(unitData) {
			if ($hideImpossibleRarities && rarity < unitData.rarity) {
				return;
			}
			let actor1 = createActor({
				id: unitData.unit_id,
				rarity: rarity,
				level: 1, // doesn't matter
				bond: {},
				rank: RANK_OPTIONS[rank1].rank,
				equipment: {
					slot1: {
						equipped: (RANK_OPTIONS[rank1].slots.indexOf(1) > -1),
						refine: 5,
					},
					slot2: {
						equipped: (RANK_OPTIONS[rank1].slots.indexOf(2) > -1),
						refine: 5,
					},
					slot3: {
						equipped: (RANK_OPTIONS[rank1].slots.indexOf(3) > -1),
						refine: 5,
					},
					slot4: {
						equipped: (RANK_OPTIONS[rank1].slots.indexOf(4) > -1),
						refine: 5,
					},
					slot5: {
						equipped: (RANK_OPTIONS[rank1].slots.indexOf(5) > -1),
						refine: 5,
					},
					slot6: {
						equipped: (RANK_OPTIONS[rank1].slots.indexOf(6) > -1),
						refine: 5,
					}
				},
				skills: {
					union_burst: 1,
					main_skill_1: 1,
					main_skill_2: 1,
					ex_skill_1: 1
				},
				includeExSkillStats: false
			});

			let actor2 = createActor({
				id: unitData.unit_id,
				rarity: rarity,
				level: 1,
				bond: {},
				rank: RANK_OPTIONS[rank2].rank,
				equipment: {
					slot1: {
						equipped: (RANK_OPTIONS[rank2].slots.indexOf(1) > -1),
						refine: 5,
					},
					slot2: {
						equipped: (RANK_OPTIONS[rank2].slots.indexOf(2) > -1),
						refine: 5,
					},
					slot3: {
						equipped: (RANK_OPTIONS[rank2].slots.indexOf(3) > -1),
						refine: 5,
					},
					slot4: {
						equipped: (RANK_OPTIONS[rank2].slots.indexOf(4) > -1),
						refine: 5,
					},
					slot5: {
						equipped: (RANK_OPTIONS[rank2].slots.indexOf(5) > -1),
						refine: 5,
					},
					slot6: {
						equipped: (RANK_OPTIONS[rank2].slots.indexOf(6) > -1),
						refine: 5,
					}
				},
				skills: {
					union_burst: 1,
					main_skill_1: 1,
					main_skill_2: 1,
					ex_skill_1: 1
				},
				includeExSkillStats: false
			});

			var unitIdString = actor1.config.id + "";
			let rarityString = (rarity >= 3) ? "3" : "1";
			var unitIdWithRarity = unitIdString.slice(0, 4) + rarityString + unitIdString.slice(-1); 
			var charImg = "images/unit/unit_icon_unit_" + unitIdWithRarity + ".png";

			let diff = {
				icon: "<img class=\"table-icon\" src=\"" + charImg + "\" />",
				name: actor1.unitData.unit_name,
				power: Math.round(calculatePower(actor1) - calculatePower(actor2)),
				effective_physical_hp: Math.round(calculateEffectivePhysicalHp(actor1) - calculateEffectivePhysicalHp(actor2)),
				effective_magic_hp: Math.round(calculateEffectiveMagicHp(actor1) - calculateEffectiveMagicHp(actor2))
			};
			STAT_NAMES.forEach(function(stat) {
				diff[stat] = Math.round(actor1[stat] - actor2[stat]);
			})
			
			differences.push(diff);

		});

		return differences;
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

</script>

<h2>Equipment Rank Stat Comparison</h2>
<table id="stats-table-table">
	<tr>
		<td id="stats-table-config">
			<h4>Options</h4> 
			<table>
				<tr><td>Rarity:</td>
					<td><RaritySelect bind:rarity={rarity} /></td>
				</tr>
				<tr><td>Compare:</td>
				<td><select bind:value={rank1}>
					{#each RANK_OPTIONS as rankOption, i}
					<option value={i}>{rankOption.rank + "-" + rankOption.slots.length}</option>
					{/each}
				</select></td></tr>
				<tr><td>To:</td>
				<td><select bind:value={rank2}>
					{#each RANK_OPTIONS as rankOption, i}
					<option value={i}>{rankOption.rank + "-" + rankOption.slots.length}</option>
					{/each}
				</select></td></tr>
			</table>
			<p>Positive numbers mean rank {RANK_OPTIONS[rank1].rank + "-" + RANK_OPTIONS[rank1].slots.length}
			has a higher value than rank {RANK_OPTIONS[rank2].rank + "-" + RANK_OPTIONS[rank2].slots.length}.</p>
			<h4>Stats to include</h4>
			{#each Object.keys(toggleDisplayCols) as attr}
			<input type="checkbox" bind:checked={toggleDisplayCols[attr]} /> {columnConfig[attr].displayName}<br />
			{/each}
			<p>
				All equipment assumed to be max refined.
			</p>
		</td>
		<td id="stats-table">
			<div class="table-wrap">
				<DopeAssTable data={tableData} columns={tableColumns} options={{colorValues: true}} />
			</div>
		</td>
	</tr>
</table>

<style>
td#stats-table-config {
	width: 180px;
	border-right: 3px solid #cfe4ff;
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