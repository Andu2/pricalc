<script>
import { lookupRows } from "@src/data/priconnedb";

let clanBattleOptions = getClanBattles();
let clanBattleSelect = 0;
$: clanBattleId = clanBattleOptions[clanBattleSelect].clanBattleId;
$: lapData = getLaps(clanBattleId)

function getClanBattles() {
	let clanBattleSchedule = lookupRows("clan_battle_period", {});
	return clanBattleSchedule.map(function(schedule, i) {
		let date = new Date(schedule.start_time);
		let monthLookup = {
			1: "Jan",
			2: "Feb",
			3: "Mar",
			4: "Apr",
			5: "May",
			6: "Jun",
			7: "Jul",
			8: "Aug",
			9: "Sep",
			10: "Oct",
			11: "Nov",
			12: "Dec"
		}
		let monthName = monthLookup[date.getMonth() + 1];
		let displayDate = monthName + " " + date.getFullYear();
		return {
			clanBattleId: schedule.clan_battle_id,
			displayName: "Clan battle " + (i + 1) + " (" + displayDate + ")",
			timeDisplay: schedule.start_time + " to " + schedule.end_time
		}
	});
}

function getLaps(clanBattleId) {
	let bossSets = lookupRows("clan_battle_map_data", { clan_battle_id: clanBattleId });
	let lapData = bossSets.map(function(mapData) {
		let lap = {};
		lap.displayName = "Lap " + mapData.lap_num_from;
		if (mapData.lap_num_from !== mapData.lap_num_to) {
			if (mapData.lap_num_to === -1) {
				lap.displayName += " to ∞";
			}
			else {
				lap.displayName += " to " + mapData.lap_num_to;
			}
		}
		let bossData = lookupRows("clan_battle_boss_group", { clan_battle_boss_group_id: mapData.clan_battle_boss_group_id });
		lap.bosses = bossData.map(function(bossGroup) {
			let waveGroupData = lookupRows("wave_group_data", { wave_group_id: bossGroup.wave_group_id })[0];
			let enemyData = lookupRows("enemy_parameter", { enemy_id: waveGroupData.enemy_id_1 })[0];
			let fixedReward = lookupRows("clan_battle_boss_fix_reward", { fix_reward_id: bossGroup.fix_reward_id })[0];
			let fixedRewardItemHtml = [];
			for (var i = 1; i <= 5; i++) {
				if (fixedReward["reward_id_" + i] > 0) {
					fixedRewardItemHtml.push(fixedReward["reward_num_" + i]	
						+ " <img class='inline-icon' src='images/item/icon_icon_item_" + fixedReward["reward_id_" + i] + ".png' />");
				}
			}
			if (fixedRewardItemHtml.length === 0) {
				fixedRewardItemHtml.push("None");
			}
			return {
				enemyData: enemyData,
				bossGroup: bossGroup,
				imgSrc: "images/unit/unit_icon_unit_" + enemyData.unit_id + ".png",
				fixedRewards: fixedRewardItemHtml.join(", ")
			}
		});
		return lap;
	});
	console.log(lapData)
	return lapData;
}
</script>

<p>Lap data for clan battle: 
<select bind:value={clanBattleSelect}>
	{#each clanBattleOptions as option, i}
	<option value={i}>{option.displayName}</option>
	{/each}
</select>
</p>
<p>Date: {clanBattleOptions[clanBattleSelect].timeDisplay}</p>
<div>
	{#each lapData as lap}
	<div>
		<h2>{lap.displayName}</h2>
		<table><tr>
			{#each lap.bosses as boss}
			<td>
				<img src={boss.imgSrc} />
				<div class="boss-info">
					<div><strong>{boss.enemyData.name}</strong></div>
					<div>Level {boss.enemyData.level}</div>
					<div>{boss.enemyData.hp} HP</div>
					<div>{boss.enemyData.def} Def / {boss.enemyData.magic_def} MDef</div>
					<div>Score multiplier: {boss.bossGroup.score_coefficient}</div>
					<p>{@html boss.fixedRewards}</p>
				</div>
			</td>
			{/each}
		</tr></table>
	</div>
	{/each}
</div>

<style>
div.boss-info {
	width: 160px;
}
</style>