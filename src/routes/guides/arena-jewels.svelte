<script>
	import { getTable } from "@src/data";
	import { getIcon } from "@src/logic";
	import DataComponent from "@src/components/DataComponent.svelte";

	const requiredTables = [ "arena_max_season_rank_reward", "arena_max_rank_reward", "arena_daily_rank_reward" ];

	let seasonRewards = [];
	let oneTimeRewards = [];
	let dailyRewards = [];

	let seasonRewardsTable = [];
	let oneTimeRewardsTable = [];
	let dailyRewardsTable = [];

	let rewardTables = [];

	function summarizeReward(reward) {
		let rewardSummary = {
			rank: reward.rank_from,
			jewels: reward.reward_num_1
		};
		if (reward.rank_to !== reward.rank_from) {
			rewardSummary.rank = reward.rank_from + " to " + reward.rank_to;
		}
		return rewardSummary;
	}

	let currentMaxRank = 15001;
	let seasonMaxRank = 15001;
	let newMaxRank = 1;
	let currentRankAtReset = 151;
	let holdRank = 950;
	let holdDays = 90;

	$: seasonJewels = calculateSeasonJewels(currentMaxRank, seasonMaxRank, newMaxRank);
	$: oneTimeJewels = calculateAllTimeJewels(currentMaxRank, seasonMaxRank, newMaxRank);
	$: missOutJewels = Math.max(0, calculateRewardJewels(1, seasonRewards) - calculateRewardJewels(currentRankAtReset, seasonRewards));
	$: holdJewels = calculateDailyReward(holdRank, holdDays, dailyRewards);

	function calculateSeasonJewels(allTimeMaxRank, seasonMaxRank, newRank) {
		if (seasonMaxRank <= allTimeMaxRank) return 0;
		let seasonCutoff = Math.max(allTimeMaxRank, newRank);
		return Math.max(0, calculateRewardJewels(seasonCutoff, seasonRewards) - calculateRewardJewels(seasonMaxRank, seasonRewards));
	}

	function calculateAllTimeJewels(allTimeMaxRank, seasonMaxRank, newRank) {
		if (allTimeMaxRank <= newRank) return 0;
		let seasonCutoff = Math.max(allTimeMaxRank, newRank);
		return Math.max(0, calculateRewardJewels(newMaxRank, oneTimeRewards) - calculateRewardJewels(seasonCutoff, oneTimeRewards));
	}
	
	function calculateRewardJewels(rank, rewardSet) {
		let jewels = 0;
		rewardSet.forEach(function(reward) {
			if (reward.rank_to >= rank) {
				let rewardFrom = Math.max(rank, reward.rank_from);
				jewels += (reward.rank_to - rewardFrom + 1) * reward.reward_num_1;
			}
		});
		return jewels;
	}

	function calculateDailyReward(rank, days, dailyRewards) {
		for (var i = 0; i < dailyRewards.length; i++) {
			if (rank >= dailyRewards[i].rank_from && rank <= dailyRewards[i].rank_to) {
				return dailyRewards[i].reward_num_1 * days;
			}
		}
		return 0;
	}

	function onDataReady() {
		seasonRewards = getTable("arena_max_season_rank_reward");
		oneTimeRewards = getTable("arena_max_rank_reward");
		dailyRewards = getTable("arena_daily_rank_reward");

		seasonRewardsTable = seasonRewards.map(summarizeReward);
		oneTimeRewardsTable = oneTimeRewards.map(summarizeReward);
		dailyRewardsTable = dailyRewards.map(summarizeReward);

		rewardTables = [{
			header: "All-time Rewards",
			rewardData: oneTimeRewardsTable
		}, {
			header: "Season Rewards",
			rewardData: seasonRewardsTable
		}, {
			header: "Daily Rewards",
			rewardData: dailyRewardsTable
		}]

		seasonJewels = calculateSeasonJewels(currentMaxRank, seasonMaxRank, newMaxRank);
		oneTimeJewels = calculateAllTimeJewels(currentMaxRank, seasonMaxRank, newMaxRank);
		missOutJewels = Math.max(0, calculateRewardJewels(1, seasonRewards) - calculateRewardJewels(currentRankAtReset, seasonRewards));
		holdJewels = calculateDailyReward(holdRank, holdDays, dailyRewards);
	}
</script>

<h2>Arena Rewards</h2>
<DataComponent requiredTables={requiredTables} onDataReady={onDataReady} >
	<p>There are three types of jewel rewards for arenas: Daily, max season rank, and max all-time rank. Max season rank jewels are only obtained <em>if you have already acquired the max all-time rank jewels for the same rank.</em> Since the global server has not yet had a season reset, we cannot currently obtain max season rank jewels.</p>

	<p>The reward amounts for both arena types are the same.</p>

	<h3>Quick Calculations</h3>

	<p>If your current maximum all-time rank achieved is <input type="number" bind:value={currentMaxRank} min=1 max=15001 /> <br/>
		and your maximum achieved rank this season is <input type="number" bind:value={seasonMaxRank} min=1 max=15001 /> <br/>
		and you achieve a new rank of <input type="number" bind:value={newMaxRank} min=1 max=15001 /> <br />
		you will gain <strong>{seasonJewels}</strong> <img class="inline-icon" src={getIcon("icon_item_91001")} /> jewels from season rewards, <br />
		and a one-time reward of <strong>{oneTimeJewels}</strong> <img class="inline-icon" src={getIcon("icon_item_91001")} /> jewels.</p>

	<p>If the season were to reset and you had achieved a maximum season rank of <input type="number" bind:value={currentRankAtReset} min=1 max=15001 /> <br />
		you would miss out on <strong>{missOutJewels}</strong> <img class="inline-icon" src={getIcon("icon_item_91001")} /> potential season rank jewels.</p>

	<p>If you are able to hold a rank of <input type="number" bind:value={holdRank} min=1 max=15001 /> <br />
		for <input type="number" bind:value={holdDays} min=1 max=10000 /> days <br />
		you will earn <strong>{holdJewels}</strong> <img class="inline-icon" src={getIcon("icon_item_91001")} /> jewels.</p>

	<h3>Reward Tables</h3>

	<table class="wrap-table"><tr>
		{#each rewardTables as rewardTable}
		<td class="reward-table-cell">
			<div class="reward-table-wrap">
				<h3>{rewardTable.header}</h3>
				<table class="reward-table"><tr><th>Rank(s)</th><th>Reward Jewels</th></tr>
					{#each rewardTable.rewardData as reward}
					<tr><td>{reward.rank}</td><td>{reward.jewels}</td></tr>
					{/each}
				</table>
			</div>
		</td>
		{/each}
	</tr></table>
</DataComponent>

<style>

	table.wrap-table {
		border-spacing: 8px;
	}
	
	img.inline-icon {
		width: 20px;
		height: 20px;
		vertical-align: text-bottom;
	}

	td.reward-table-cell {
		padding: 5px;
		border: 3px solid #cfe4ff;
		border-radius: 20px;
	}

	div.reward-table-wrap {
		width: 300px;
		height: 700px;
		overflow-y: auto;
		padding: 10px;
	}

	table.reward-table {
		width: 100%;
		table-layout: fixed;
	}
</style>