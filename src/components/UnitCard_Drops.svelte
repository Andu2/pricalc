<script>
	import { lookupRows } from "@src/data/priconnedb"

	export let enemyId;

	$: drops = getDrops(enemyId);

	function getDrops(enemyId) {
		let drops = [];

		let quests = lookupRows("quest_data", {});
		quests.forEach(function(quest) {
			for (var waveNum = 1; waveNum <= 3; waveNum++) {
				let wave = lookupRows("wave_group_data", { wave_group_id: quest["wave_group_id_" + waveNum]})[0];
				for (var enemyNum = 1; enemyNum <= 5; enemyNum++) {
					if (wave["enemy_id_" + enemyNum] === enemyId) {
						let rewardId = wave["drop_reward_id_" + enemyNum];
						if (rewardId > 0) {
							let rewardData = lookupRows("enemy_reward_data", { drop_reward_id: rewardId })[0];
							for (var rewardNum = 1; rewardNum <= 5; rewardNum++) {
								let rewardType = rewardData["reward_type_" + rewardNum];
								if (rewardType === 2) {
									drops.push({
										itemImage: "images/item/icon_icon_item_" + rewardData["reward_id_" + rewardNum] + ".png",
										amount: rewardData["reward_num_" + rewardNum],
										quest: quest.quest_name + " " + getQuestType(quest),
										chance: rewardData["odds_" + rewardNum] + "%",
										wave: waveNum
									});
								}
								else if (rewardType === 4) {
									drops.push({
										itemImage: "images/equipment/icon_icon_equipment_" + rewardData["reward_id_" + rewardNum] + ".png",
										amount: rewardData["reward_num_" + rewardNum],
										quest: quest.quest_name + " " + getQuestType(quest),
										chance: rewardData["odds_" + rewardNum] + "%",
										wave: waveNum
									});
								}
							}
						}
					}
				}
			}
		});

		return drops;
	}

	function getQuestType(quest) {
		if (quest.stamina_start === 2) return "Hard";
		else if (quest.stamina_start === 1) return "Normal";
		else return "???"
	}
</script>

<div class="card-section">
	<div class="card-section-header">Drops</div>
	<table>
		{#if drops.length === 0}
		No drops
		{:else}
		<tr><th>Item</th><th>Amount</th><th>Chance</th><th>Area</th><th>Wave</th></tr>
		{#each drops as drop}
		<tr><td><img class="table-icon" src={drop.itemImage} /></td><td>{drop.amount}</td><td>{drop.chance}</td><td>{drop.quest}</td><td>{drop.wave}</td></tr>
		{/each}
		{/if}
	</table>
</div>

<style>

div.card-section {
	min-width: 210px;
}

td, th {
	padding-right: 10px;
}

th + th {
	padding: 0;
}
</style>