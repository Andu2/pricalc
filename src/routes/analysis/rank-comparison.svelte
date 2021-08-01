<script>
	import { STAT_NAMES, STAT_DISPLAY_NAMES } from "@src/data";
	import { createActor, calculatePower, calculateEffectivePhysicalHp, calculateEffectiveMagicHp, 
		getUnlockedUnits, getMaxRank, getUnitImg, getMaxLevel, getUnitIdBase, getRankOptions, getCharaCards } from "@src/logic";
	import { escAttr, round } from "@src/utils";
	import DopeAssTable from "@src/components/DopeAssTable.svelte";
	import RaritySelect from "@src/components/RaritySelect.svelte";
	import DataComponent from "@src/components/DataComponent.svelte";
	import { hideImpossibleRarities, includeExSkillStats } from "@src/settings.js";

	const requiredTables = [ "unit_data", "unit_promotion", "skill_data", "unit_skill_data", "skill_action", "unit_rarity",
		"unit_promotion_status", "equipment_data", "equipment_enhance_rate", "unit_status_coefficient", "experience_team", 
		"story_detail", "chara_story_status" ];

	let tableData;
	let tableColumns;
	let dataLoaded = false;
	const MIN_REASONABLE_RANK = 7;
	// Unfortunately the JP data does not go back forever, and we want to be able to see
	// the stats at the next partial rank even if it's not relevant for any of the JP versions available
	const forceOption = {
		rank: 10,
		equipment: {
			slot1: false,
			slot2: true,
			slot3: false,
			slot4: true,
			slot5: false,
			slot6: true
		},
		numSlots: 5
	}

	let UNLOCKED_UNITS = [];
	let RANK_OPTIONS = [];
	let MAX_LEVEL = 1;
	let charaCards = {};
	let maxBondOutfits = false;

	let rank1 = -1;
	let rank2 = -1;
	let rarity = 3;
	let showPercentages = false;

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
			displayValue: displayPercentages
		},
		"effective_magic_hp": {
			attr: "effective_magic_hp",
			displayName: "Effective Magic HP",
			sort: "default",
			displayValue: displayPercentages
		},
		"power": {
			attr: "power",
			displayName: "Power",
			sort: "default",
			displayValue: displayPercentages
		}
	}
	STAT_NAMES.forEach(function(stat) {
		columnConfig[stat] = {
			attr: stat,
			displayName: STAT_DISPLAY_NAMES[stat],
			sort: "default",
			displayValue: displayPercentages
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

	$: tableData = calculateStatDifferences(rank1, rank2, rarity, showPercentages, maxBondOutfits, $hideImpossibleRarities, $includeExSkillStats);
	$: tableColumns = calculateTableColumns(toggleDisplayCols);

	function displayPercentages(row, attr) {
		if (showPercentages) {
			return row[attr] + "%"
		}
		return row[attr];
	}

	function calculateStatDifferences(rank1, rank2, rarity, showPercentages, maxBondOutfits) {
		if (!dataLoaded) return [];
		let differences = [];
		UNLOCKED_UNITS.forEach(function(unitData) {
			if ($hideImpossibleRarities && rarity < unitData.rarity) {
				return;
			}

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

			let actor1 = createActor({
				id: unitData.unit_id,
				rarity: rarity,
				level: MAX_LEVEL,
				bond: bondLevels,
				rank: RANK_OPTIONS[rank1].rank,
				equipment: {
					slot1: {
						equipped: (RANK_OPTIONS[rank1].equipment["slot" + 1]),
						refine: 5,
					},
					slot2: {
						equipped: (RANK_OPTIONS[rank1].equipment["slot" + 2]),
						refine: 5,
					},
					slot3: {
						equipped: (RANK_OPTIONS[rank1].equipment["slot" + 3]),
						refine: 5,
					},
					slot4: {
						equipped: (RANK_OPTIONS[rank1].equipment["slot" + 4]),
						refine: 5,
					},
					slot5: {
						equipped: (RANK_OPTIONS[rank1].equipment["slot" + 5]),
						refine: 5,
					},
					slot6: {
						equipped: (RANK_OPTIONS[rank1].equipment["slot" + 6]),
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

			let actor2 = createActor({
				id: unitData.unit_id,
				rarity: rarity,
				level: MAX_LEVEL,
				bond: bondLevels,
				rank: RANK_OPTIONS[rank2].rank,
				equipment: {
					slot1: {
						equipped: (RANK_OPTIONS[rank2].equipment["slot" + 1]),
						refine: 5,
					},
					slot2: {
						equipped: (RANK_OPTIONS[rank2].equipment["slot" + 2]),
						refine: 5,
					},
					slot3: {
						equipped: (RANK_OPTIONS[rank2].equipment["slot" + 3]),
						refine: 5,
					},
					slot4: {
						equipped: (RANK_OPTIONS[rank2].equipment["slot" + 4]),
						refine: 5,
					},
					slot5: {
						equipped: (RANK_OPTIONS[rank2].equipment["slot" + 5]),
						refine: 5,
					},
					slot6: {
						equipped: (RANK_OPTIONS[rank2].equipment["slot" + 6]),
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

			var charImg = getUnitImg(actor1.config.id, { rarity: rarity });

			let diff = {
				icon: "<img class=\"table-icon\" src=\"" + escAttr(charImg) + "\" />",
				name: actor1.unitData.unit_name
			}
			if (showPercentages) {
				diff.power = round((calculatePower(actor1) / calculatePower(actor2) - 1) * 100, 2);
				diff.effective_physical_hp = round((calculateEffectivePhysicalHp(actor1) / calculateEffectivePhysicalHp(actor2) - 1) * 100, 2);
				diff.effective_magic_hp = round((calculateEffectiveMagicHp(actor1) / calculateEffectiveMagicHp(actor2) - 1) * 100, 2);
				if (isNaN(diff.power)) diff.power = 0;
				if (isNaN(diff.effective_physical_hp)) diff.effective_physical_hp = 0;
				if (isNaN(diff.effective_magic_hp)) diff.effective_magic_hp = 0;
			}
			else {
				diff.power = Math.round(calculatePower(actor1) - calculatePower(actor2));
				diff.effective_physical_hp = Math.round(calculateEffectivePhysicalHp(actor1) - calculateEffectivePhysicalHp(actor2));
				diff.effective_magic_hp = Math.round(calculateEffectiveMagicHp(actor1) - calculateEffectiveMagicHp(actor2));
			}
			STAT_NAMES.forEach(function(stat) {
				if (showPercentages) {
					diff[stat] = round((actor1[stat] / actor2[stat] - 1) * 100, 2);
					if (isNaN(diff[stat])) diff[stat] = 0;
				}
				else {
					diff[stat] = Math.round(actor1[stat] - actor2[stat]);
				}
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

	function onDataReady() {
		dataLoaded = true;

		UNLOCKED_UNITS = getUnlockedUnits();
		MAX_LEVEL = getMaxLevel();
		charaCards = getCharaCards();
		RANK_OPTIONS = getRankOptions();
		if (getMaxRank().rank >= forceOption.rank) {
			RANK_OPTIONS.unshift(forceOption);
		}
		rank1 = Math.max(RANK_OPTIONS.length - 1, 0);
		rank2 = Math.max(RANK_OPTIONS.length - 2, 0);
	}

</script>

<h2>Equipment Rank Stat Comparison</h2>
<DataComponent requiredTables={requiredTables} onDataReady={onDataReady} >
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
						<option value={i}>{rankOption.rank + "-" + rankOption.numSlots}</option>
						{/each}
					</select></td></tr>
					<tr><td>To:</td>
					<td><select bind:value={rank2}>
						{#each RANK_OPTIONS as rankOption, i}
						<option value={i}>{rankOption.rank + "-" + rankOption.numSlots}</option>
						{/each}
					</select></td></tr>
				</table>
				<input type="checkbox" class="input-outside-table" bind:checked={maxBondOutfits} /> <span>Max bond other cards of same character</span><br />
				<input type="checkbox" class="input-outside-table" bind:checked={showPercentages} /> <span>Show percentages</span>
				<p>Positive numbers mean rank {RANK_OPTIONS[rank1].rank + "-" + RANK_OPTIONS[rank1].numSlots}
				has a higher value than rank {RANK_OPTIONS[rank2].rank + "-" + RANK_OPTIONS[rank2].numSlots}.</p>
				<h4>Stats to include</h4>
				{#each Object.keys(toggleDisplayCols) as attr}
				<input type="checkbox" bind:checked={toggleDisplayCols[attr]} /> {columnConfig[attr].displayName}<br />
				{/each}
				<p>
					All equipment assumed to be max refined. Stats are calculated at max level.
				</p>
			</td>
			<td id="stats-table">
				<div class="table-wrap">
					<DopeAssTable data={tableData} columns={tableColumns} options={{colorValues: true}} />
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