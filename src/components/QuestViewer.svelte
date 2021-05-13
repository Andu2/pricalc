<script>
	export let questData;
	export let isEvent = false;
	export let playerLevel = 1;
	export let variant = 1;

	import { lookupRows } from "@src/data";
	import { getItemImg, getUnitImg, getIcon } from "@src/logic";
	import { sortByAttr } from "@src/utils";

	$: waves = getWaveData(questData, isEvent, playerLevel, variant);
	$: expectedDrops = sumDrops(waves);
	$: isHard = (questData && questData.stamina_start > 1);
	$: questName = getQuestName(questData, isHard);

	function getWaveData(questData, isEvent, playerLevel, variant) {
		let waves = [];
		if (!questData) return waves;

		for (var wave = 1; wave <= 3; wave++) {
			if (!isEvent) {
				// TODO: "odds" for grotto quests
				let waveId = questData["wave_group_id_" + wave];
				let waveData = lookupRows("wave_group_data", { wave_group_id: waveId })[0];
				let waveEnemies = [];
				for (var enemy = 1; enemy <= 5; enemy++) {
					if (waveData["enemy_id_" + enemy]) {
						let enemyData = lookupRows("enemy_parameter", { enemy_id: waveData["enemy_id_" + enemy] })[0];
						let drops = [];
						if (waveData["drop_reward_id_" + enemy]) {
							let dropData = lookupRows("enemy_reward_data", { drop_reward_id: waveData["drop_reward_id_" + enemy]})[0];
							for (var drop = 1; drop <= 5; drop++) {
								if (dropData["reward_type_" + drop]) {
									drops.push({
										type: dropData["reward_type_" + drop],
										id: dropData["reward_id_" + drop],
										num: dropData["reward_num_" + drop],
										odds: dropData["odds_" + drop]
									})
								}
							}
						}
						waveEnemies.push({
							enemyData: enemyData,
							drops: drops,
							mana: waveData["drop_gold_" + enemy]
						});
					}
				}
				waves.push(waveEnemies);
			}
			else {
				let matchLevel = playerLevel * 1000;
				if (questData.stamina === 10) {
					matchLevel += 3
				}
				else if (questData.stamina === 9) {
					matchLevel += 2
				}
				else {
					matchLevel += 1
				}

				// normal 1 at p level 83: 
				// wave 1: 600110xx1[3]
				// wave 2: 600110xx2[1]
				// wave 3: 600110573[5]

				//let waveData = lookupRows("event_wave_group_data", { wave: wave, match_lv_min: matchLevel, difficulty: 1 })[0];
				//let waveId = 600110000 + (playerLevel * 10) + wave;
				let seq = variant - 1;
				let difficulty = (isHard ? 2 : 1)
				let waveData = lookupRows("event_wave_group_data", { wave: wave, difficulty: difficulty, match_lv_min: matchLevel })[seq];
				let waveEnemies = [];
				if (waveData) {
					for (var enemy = 1; enemy <= 5; enemy++) {
						if (waveData["enemy_id_" + enemy]) {
							let enemyData = lookupRows("event_enemy_parameter", { enemy_id: waveData["enemy_id_" + enemy] })[0];
							let drops = [];
							if (waveData["disp_reward_id_" + enemy]) {
								let num = waveData["reward_lot_count_" + enemy];
								let id = waveData["disp_reward_id_" + enemy];
								if (id === 60001) {
									// boss ticket
									// Todo: what is hard
									if (questData.stamina === 10) {
										num = 2.5;
									}
									else {
										num = 2;
									}
								}
								drops.push({
									type: waveData["disp_reward_type_" + enemy],
									id: id,
									num: num,
									odds: waveData["reward_odds_" + enemy]
								})
							}
							else if (waveData["reward_group_id_" + enemy]) {
								let dropData = lookupRows("event_enemy_reward_group", { reward_group_id: waveData["reward_group_id_" + enemy]});
								dropData.forEach(function(drop) {
									drops.push({
										type: drop.reward_type,
										id: drop.reward_id,
										num: drop.reward_num * waveData["reward_lot_count_" + enemy],
										odds: drop.odds * waveData["reward_odds_" + enemy] / 100
									})
								})
							}
							waveEnemies.push({
								enemyData: enemyData,
								drops: drops,
								mana: waveData["drop_gold_" + enemy]
							});
						}
					}
				}
				waves.push(waveEnemies);
			}
		}
		return waves;
	}

	function sumDrops(waves) {
		let itemDrops = {};
		waves.forEach(function(wave) {
			wave.forEach(function(enemy) {
				if (enemy.mana > 0) {
					if (itemDrops[94002] === undefined) {
						itemDrops[94002] = 0;
					}
					itemDrops[94002] += enemy.mana;
				}
				enemy.drops.forEach(function(drop) {
					if (itemDrops[drop.id] === undefined) {
						itemDrops[drop.id] = 0;
					}
					itemDrops[drop.id] += drop.odds / 100 * drop.num;
				});
			});
		});

		// Turn into array that svelte can iterate over, and sort
		let dropList = Object.keys(itemDrops).map(function(itemId) {
			return {
				id: itemId * 1, // Object.keys turns into string
				expected: itemDrops[itemId]
			}
		}).sort(sortByAttr("expected")).reverse();
		return dropList;
	}

	function getItemName(id) {
		if (id === 94002) id = 94001; // collapse mana ids
		if (id >= 100000) {
			let lookup = lookupRows("equipment_data", { equipment_id: id })[0];
			if (lookup) {
				return lookup.equipment_name;
			}
		}
		else {
			let lookup = lookupRows("item_data", { item_id: id })[0];
			if (lookup) {
				return lookup.item_name;
			}
		}
		return "???"
	}

	function getQuestName(questData, isHard) {
		if (!questData) return "???";
		return (isHard ? questData.quest_name + " Hard" : questData.quest_name + " Normal");
	}
</script>

{#if !questData}
	<h3>No quest selected</h3>
{:else}
	<table class="quest-viewer"><tr><td class="card-section quest-overview">
		<div class="centered">
			<img src={getIcon("icon_map_" + questData.icon_id)} />
			<h3>{questName}</h3>
		</div>
		<table>
			<tr><td class="overall-stat-label">Stamina Cost: </td><td>{questData.stamina}</td></tr>
			<tr><td class="overall-stat-label">Stamina Loss on Fail: </td><td>{questData.stamina_start}</td></tr>
			<tr><td class="overall-stat-label">Player exp: </td><td>{questData.team_exp}</td></tr>
			<tr><td class="overall-stat-label">Unit exp: </td><td>{questData.unit_exp}</td></tr>
<!-- 			<tr><td class="overall-stat-label">Bond points: </td><td>{questData.love}</td></tr> -->
			{#if questData.limit_team_level > 0}
			<tr><td class="overall-stat-label">Minimum player level: </td><td>{questData.limit_team_level}</td></tr>
			{/if}
			{#if questData.daily_limit > 0}
			<tr><td class="overall-stat-label">Daily limit: </td><td>{questData.daily_limit}</td></tr>
			{/if}
		</table>
		<h4>Expected drops:</h4>
		<table>
			{#each expectedDrops as drop}
			<tr><td>
				<img class="drop-icon" src={getItemImg(drop.id)} />
			</td><td class="drop-label">
				{getItemName(drop.id)}
			</td><td class="drop-amount">
				{Math.round(drop.expected * 100) / 100}
			</td></tr>
			{/each}
		</table>
	</td><td class="card-section quest-waves">
		<table>
			{#each waves as waveEnemies, waveNum}
			<tr class="wave">
				<td class="wave-label">Wave {waveNum + 1}</td>
				{#each waveEnemies as waveEnemy}
				<td class="wave-enemy">
					<img class="enemy-icon" src={getUnitImg(waveEnemy.enemyData.unit_id)} /><br />
					<div class="enemy-details">
						<div class="level">Level {waveEnemy.enemyData.level}</div>
						{#if waveEnemy.mana}
						<div class="drop"><img class="drop-icon" src={getItemImg(94002)} /> {waveEnemy.mana}</div>
						{/if}
						{#each waveEnemy.drops as drop}
						<div class="drop"><img class="drop-icon" src={getItemImg(drop.id)} /> {drop.odds}%</div>
						{/each}
					</div>
				</td>
				{/each}
			</tr>
			{/each}
		</table>
	</td></tr></table>
{/if}

<style>
img.enemy-icon {
	width: 128px;
	height: 128px;
}

td.wave-enemy {
	padding-right: 10px;
	padding-bottom: 30px;
}

div.level {
	padding: 2px 0 4px 0;
}

div.drop {
	padding: 2px 0;
}

div.enemy-details {
	max-height: 130px;
	overflow-y: auto;
}

td.drop-label {
	padding-left: 5px;
	padding-right: 10px;
}

img.drop-icon {
	width: 32px;
	height: 32px;
	vertical-align: text-bottom;
}

td.quest-overview {
	width: 270px;
}

td.wave-label {
	padding: 15px;
	padding-top: 40px;
	font-weight: bold;
}

td.card-section {
	padding: 15px;
	border: 3px solid #cfe4ff;
	border-radius: 20px;
}

table.quest-viewer {
	margin-top: 10px;
	border-spacing: 10px;
}

div.centered {
	text-align: center;
}

td.overall-stat-label {
	padding-right: 10px;
}
</style>