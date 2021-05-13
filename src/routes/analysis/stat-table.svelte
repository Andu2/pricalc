<script>
	import { STAT_NAMES, STAT_DISPLAY_NAMES } from "@src/data/priconnedb";
	import { createActor, calculatePower, calculateEffectivePhysicalHp, calculateEffectiveMagicHp, 
		getUnlockedUnits, getMaxRank, getUnitImg, getMaxLevel, getUnitIdBase, getRankOptions, getCharaCards } from "@src/logic";
	import { escAttr, round, shortNumber } from "@src/utils";
	import DopeAssTable from "@src/components/DopeAssTable.svelte";
	import DataComponent from "@src/components/DataComponent.svelte";
	import RaritySelect from "@src/components/RaritySelect.svelte";
	import { hideImpossibleRarities, includeExSkillStats } from "@src/settings.js";

	const requiredTables = [ "unit_data", "unit_promotion", "skill_data", "unit_skill_data", "skill_action", "unit_rarity",
		"unit_promotion_status", "equipment_data", "equipment_enhance_rate", "unit_status_coefficient", "experience_team", 
		"story_detail", "chara_story_status" ];

	let tableData;
	let tableColumns;
	let dataLoaded = false;

	let UNLOCKED_UNITS = [];
	let RANK_OPTIONS = [];
	let MAX_LEVEL = 1;
	let charaCards = {};

	let rank = -1;
	let rarity = 5;
	let maxBondOutfits = false;

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
			sort: "default",
			displayValue: function(row, attr) {
				return shortNumber(row[attr]);
			}
		},
		"effective_magic_hp": {
			attr: "effective_magic_hp",
			displayName: "Effective Magic HP",
			sort: "default",
			displayValue: function(row, attr) {
				return shortNumber(row[attr]);
			}
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
		"life_steal": false,
		"hp_recovery_rate": true,
		"energy_recovery_rate": true,
		"energy_reduce_rate": false,
		"accuracy": false,
		"effective_physical_hp": true, // calculated value
		"effective_magic_hp": true, // calculated value
		"power": false // calculated value
	}

	$: maxedActors = calculateMaxedActors(rank, rarity, maxBondOutfits);
	$: tableData = calculateTableData(maxedActors);
	$: tableColumns = calculateTableColumns(toggleDisplayCols);

	function calculateMaxedActors(rank, rarity, maxBondOutfits) {
		return UNLOCKED_UNITS.filter(function(unitData) {
			return !($hideImpossibleRarities && rarity < unitData.rarity)
		}).map(function(unitData) {
			let bondLevels = {}
			let unitBaseId = getUnitIdBase(unitData.unit_id);
			charaCards[unitBaseId].cards.forEach(function(id) {
				if (id === unitBaseId) {
					if (rarity >= 6) bondLevels[id] = 12;
					else if (rarity >= 3) bondLevels[id] = 8;
					else bondLevels[id] = 4;
				}
				else {
					if (maxBondOutfits) {
						bondLevels[id] = 12;
					}
				}
			});
			return createActor({
				id: unitData.unit_id,
				rarity: rarity,
				level: MAX_LEVEL,
				bond: bondLevels,
				rank: RANK_OPTIONS[rank].rank,
				equipment: {
					slot1: {
						equipped: (RANK_OPTIONS[rank].equipment["slot" + 1]),
						refine: 5,
					},
					slot2: {
						equipped: (RANK_OPTIONS[rank].equipment["slot" + 2]),
						refine: 5,
					},
					slot3: {
						equipped: (RANK_OPTIONS[rank].equipment["slot" + 3]),
						refine: 5,
					},
					slot4: {
						equipped: (RANK_OPTIONS[rank].equipment["slot" + 4]),
						refine: 5,
					},
					slot5: {
						equipped: (RANK_OPTIONS[rank].equipment["slot" + 5]),
						refine: 5,
					},
					slot6: {
						equipped: (RANK_OPTIONS[rank].equipment["slot" + 6]),
						refine: 5,
					}
				},
				skills: {
					union_burst: MAX_LEVEL,
					main_skill_1: MAX_LEVEL,
					main_skill_2: MAX_LEVEL,
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
			var charImg = getUnitImg(actor.config.id, { rarity: rarity });
			var row = {
				icon: "<img class=\"table-icon\" src=\"" + escAttr(charImg) + "\" />",
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

	function onDataReady() {
		dataLoaded = true;

		UNLOCKED_UNITS = getUnlockedUnits();
		MAX_LEVEL = getMaxLevel();
		charaCards = getCharaCards();
		RANK_OPTIONS = getRankOptions();
		rank = Math.max(RANK_OPTIONS.length - 1, 0);
	}

</script>
<h2>Max Stat Table</h2>
<DataComponent requiredTables={requiredTables} onDataReady={onDataReady} >
	<table id="stats-table-table">
		<tr>
			<td id="stats-table-config">
				<h4>Options</h4> 
				<table>
					<tr><td>Rarity:</td>
						<td><RaritySelect bind:rarity={rarity} /></td>
					</tr>
					<tr><td>Rank:</td>
					<td><select bind:value={rank}>
						{#each RANK_OPTIONS as rankOption, i}
						<option value={i}>{rankOption.rank + "-" + rankOption.numSlots}</option>
						{/each}
					</select></td></tr>
				</table>
				<input type="checkbox" class="input-outside-table" bind:checked={maxBondOutfits} /> <span>Max bond other cards of same character</span>
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
</DataComponent>

<style>
td#stats-table-config {
	width: 180px;
	padding-right: 8px;
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

.input-outside-table {
	vertical-align: text-bottom;
}
</style>