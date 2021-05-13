<script>
	import { lookupRows, getTable } from "@src/data";
	import { commaNumber, shortNumber } from "@src/utils";
	import { getUnitImg, getItemImg, isNewCBDataFormat } from "@src/logic"
	import DataComponent from "@src/components/DataComponent.svelte";

	const requiredTables = [ "clan_battle_period", "wave_group_data", "enemy_parameter", "clan_battle_boss_fix_reward",
		"{clanBattleBossData}" ];

	let clanBattleOptions = [];
	let clanBattleSelect = -1;

	$: clanBattleId = getClanBattleId(clanBattleSelect);
	$: lapData = getLaps(clanBattleId)

	function getClanBattleId(clanBattleSelect) {
		if (clanBattleOptions[clanBattleSelect]) {
			return clanBattleOptions[clanBattleSelect].clanBattleId;
		}
		else {
			return -1;
		}
	}

	function getClanBattles() {
		let clanBattleSchedule = getTable("clan_battle_period");
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
				timeDisplay: getScheduleText(schedule)
			}
		});
	}

	function getScheduleText(schedule) {
		return schedule.start_time.split(" ")[0] + " to " + schedule.end_time.split(" ")[0];
	}

	function getLaps(clanBattleId) {
		if (clanBattleId < 0) return [];
		if (!isNewCBDataFormat()) {
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
							fixedRewardItemHtml.push("<div class='inline-icon-wrap'><div>"
								+ "<img class='inline-icon-big' src='" + getItemImg(fixedReward["reward_id_" + i]) + "' /></div>"
					 			+ "<div class='inline-icon-label'>" + fixedReward["reward_num_" + i] + "</div></div>");
						}
					}
					if (fixedRewardItemHtml.length === 0) {
						fixedRewardItemHtml.push("None");
					}
					return {
						enemyData: enemyData,
						bossGroup: bossGroup,
						scoreMultiplier: bossGroup.score_coefficient,
						imgSrc: getUnitImg(enemyData.unit_id),
						fixedRewards: fixedRewardItemHtml.join(" ")
					}
				});
				return lap;
			});
			// console.log(lapData)
			return lapData;
		}
		else {
			let bossSets = lookupRows("clan_battle_2_map_data", { clan_battle_id: clanBattleId });
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
				lap.bosses = [];
				for (var boss = 1; boss <= 5; boss++) {
					let waveGroupData = lookupRows("wave_group_data", { wave_group_id: mapData["wave_group_id_" + boss] })[0];
					let enemyData = lookupRows("enemy_parameter", { enemy_id: waveGroupData.enemy_id_1 })[0];
					let scoreMultiplier = mapData["score_coefficient_" + boss];
					let fixedReward = lookupRows("clan_battle_boss_fix_reward", { fix_reward_id: mapData["fix_reward_id_" + boss] })[0];
					let fixedRewardItemHtml = [];
					for (var i = 1; i <= 5; i++) {
						if (fixedReward["reward_id_" + i] > 0) {
							fixedRewardItemHtml.push("<div class='inline-icon-wrap'><div>"
								+ "<img class='inline-icon-big' src='" + getItemImg(fixedReward["reward_id_" + i]) + "' /></div>"
					 			+ "<div class='inline-icon-label'>" + fixedReward["reward_num_" + i] + "</div></div>");
						}
					}
					if (fixedRewardItemHtml.length === 0) {
						fixedRewardItemHtml.push("None");
					}
					lap.bosses.push({
						enemyData: enemyData,
						mapData: mapData,
						scoreMultiplier: scoreMultiplier,
						imgSrc: getUnitImg(enemyData.unit_id),
						fixedRewards: fixedRewardItemHtml.join(" ")
					});
				}
				return lap;
			});
			return lapData;
		}
	}

	function onDataReady() {
		clanBattleOptions = getClanBattles();
		clanBattleSelect = clanBattleOptions.length - 1;
		$: clanBattleId = clanBattleOptions[clanBattleSelect].clanBattleId;
		$: lapData = getLaps(clanBattleId)
	}
</script>

<h2>Clan Battle Reference</h2>
<DataComponent requiredTables={requiredTables} onDataReady={onDataReady} >
	<p>Lap data for clan battle: 
	<select bind:value={clanBattleSelect}>
		{#each clanBattleOptions as option, i}
		<option value={i}>{option.displayName}</option>
		{/each}
	</select>
	</p>
	<p><strong>Date:</strong> {clanBattleOptions[clanBattleSelect].timeDisplay}</p>
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
						<div>{shortNumber(boss.enemyData.hp)} HP</div>
						<div>{boss.enemyData.def} Def / {boss.enemyData.magic_def} MDef</div>
						<div>Score multiplier: {boss.scoreMultiplier}</div>
						<p>{@html boss.fixedRewards}</p>
					</div>
				</td>
				{/each}
			</tr></table>
		</div>
		{/each}
	</div>
</DataComponent>

<style>
div.boss-info {
	width: 160px;
}
</style>