<script>
	import { lookupRows, getTable } from "@src/data"
	import { isHardQuest, getItemType, getItemName } from "@src/logic";
	import { round } from "@src/utils";
	import ItemInput from "@src/components/ItemInput.svelte"
	import DopeAssTable from "@src/components/DopeAssTable.svelte"
	import DataComponent from "@src/components/DataComponent.svelte";

	export const requiredTables = [ "quest_data", "wave_group_data", "item_data", "equipment_data", "enemy_reward_data" ];

	let dataLoaded = false;

	let itemId = -1;
	let doubleNormal = false;
	let doubleHard = false;

	$: questDrops = getQuestDrops(itemId, doubleNormal, doubleHard);
	let columnData = [{
			attr: "quest",
			displayName: "Quest",
			sort: null
		}, {
			attr: "drops",
			displayName: "Expected Drops",
			sort: "numeric"
		}, {
			attr: "stamina",
			displayName: "Stamina",
			sort: "numeric"
		}, {
			attr: "dropsPerStamina",
			displayName: "Drops per Stamina",
			sort: "numeric"
	}]

	function getQuestDrops(itemId, doubleNormal, doubleHard) {
		if (!dataLoaded) return [];
		let questDrops = {};

		let quests = getTable("quest_data");
		quests.forEach(function(quest) {
			for (var waveNum = 1; waveNum <= 3; waveNum++) {
				let wave = lookupRows("wave_group_data", { wave_group_id: quest["wave_group_id_" + waveNum]}, {}, { cache: true })[0];
				for (var enemyNum = 1; enemyNum <= 5; enemyNum++) {
					let drops = 0;
					if (itemId === 94001) {
						drops = wave["drop_gold_" + enemyNum];
					}
					else {
						let rewardId = wave["drop_reward_id_" + enemyNum];
						if (rewardId > 0) {
							let rewardData = lookupRows("enemy_reward_data", { drop_reward_id: rewardId }, {}, { cache: true })[0];
							for (var rewardNum = 1; rewardNum <= 5; rewardNum++) {
								if (rewardData["reward_id_" + rewardNum] === itemId) {
									drops = (rewardData["odds_" + rewardNum] / 100) * rewardData["reward_num_" + rewardNum];
								}
							}
						}
					}

					if (drops > 0) {
						let hardQuest = isHardQuest(quest);

						if (doubleNormal && !hardQuest) {
							drops *= 2;
						}
						else if (doubleHard && hardQuest) {
							drops *= 2;
						}

						if (!questDrops[quest.quest_id]) {
							questDrops[quest.quest_id] = {
								quest: quest.quest_name + " " + (hardQuest ? "Hard" : "Normal"),
								drops: 0,
								stamina: quest.stamina
							}
						}
						questDrops[quest.quest_id].drops += drops;
					}
				}
			}
		});

		let questDropTable = [];
		for (var questId in questDrops) {
			questDropTable.push({
				quest: questDrops[questId].quest,
				drops: round(questDrops[questId].drops, 4),
				stamina: questDrops[questId].stamina,
				dropsPerStamina: round(questDrops[questId].drops / questDrops[questId].stamina, 4)
			});
		}

		return questDropTable;
	}

	$: itemName = getItemName(itemId)

	function onDataReady() {
		dataLoaded = true;
	}
</script>

<h2>Item and Equipment Drops</h2>
<DataComponent requiredTables={requiredTables} onDataReady={onDataReady} >
	<table id="drop-table-table">
		<tr>
			<td id="drop-table-config">
				<ItemInput bind:itemId={itemId} />
				<p>{itemName}</p>
				<input type="checkbox" bind:checked={doubleNormal} /> 2x normal drops<br />
				<input type="checkbox" bind:checked={doubleHard} /> 2x hard drops
			</td>
			<td id="drop-table">
				<div class="table-wrap">
					<DopeAssTable data={questDrops} columns={columnData} />
				</div>
			</td>
		</tr>
	</table>
</DataComponent>

<style>
td#drop-table-config {
	width: 180px;
	border-right: 3px solid #cfe4ff;
}

table#drop-table-table {
	table-layout: fixed;
	width: 100%;
}

td#drop-table {
	padding-left: 10px;
}

div.table-wrap {
	overflow-x: auto;
}
</style>
