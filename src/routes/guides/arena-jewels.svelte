<script>
	import { lookupRows } from "@src/data/priconnedb";

	let seasonRewards = lookupRows("arena_max_season_rank_reward", {});
	let oneTimeRewards = lookupRows("arena_max_rank_reward", {});
	let dailyRewards = lookupRows("arena_daily_rank_reward", {});

	let currentMaxRank = 15001;
	let newMaxRank = 1;
	$: seasonJewels = Math.max(0, calculateRewardJewels(newMaxRank, seasonRewards) - calculateRewardJewels(currentMaxRank, seasonRewards));
	$: oneTimeJewels = Math.max(0, calculateRewardJewels(newMaxRank, oneTimeRewards) - calculateRewardJewels(currentMaxRank, oneTimeRewards));

	let currentRankAtReset = 151;
	$: missOutJewels = Math.max(0, calculateRewardJewels(1, seasonRewards) - calculateRewardJewels(currentRankAtReset, seasonRewards));

	let holdRank = 950;
	let holdDays = 90;
	$: holdJewels = calculateDailyReward(holdRank, holdDays, dailyRewards);

	// TODO: update this page on season reset...the calculations will be more interesting then anyway
	
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
</script>

<p>There are three types of jewel rewards for arenas: Daily, max season rank, and max all-time rank. The reward amounts for both arena types are the same. Since the global server has not yet had a season reset, your max all-time rank will be the same as your max season rank.</p>

<p>If your current maximum achieved rank is <input type="number" bind:value={currentMaxRank} min=1 max=15001 /> <br/>
	and you achieve a new max rank of <input type="number" bind:value={newMaxRank} min=1 max=15001 /> <br />
	you will gain <strong>{seasonJewels}</strong> <img class="inline-icon" src="images/item/icon_icon_item_91001.png" /> jewels from season rewards and a one-time reward of <strong>{oneTimeJewels}</strong> <img class="inline-icon" src="images/item/icon_icon_item_91001.png" /> jewels.</p>

<p>If the season were to reset and you had achieved a maximum rank of <input type="number" bind:value={currentRankAtReset} min=1 max=15001 />, you would miss out on <strong>{missOutJewels}</strong> <img class="inline-icon" src="images/item/icon_icon_item_91001.png" /> jewels.</p>

<p>If you are able to hold a rank of <input type="number" bind:value={holdRank} min=1 max=15001 /> for <input type="number" bind:value={holdDays} min=1 max=10000 /> days, you will earn <strong>{holdJewels}</strong> <img class="inline-icon" src="images/item/icon_icon_item_91001.png" /> jewels.</p>

<style>
	img.inline-icon {
		width: 20px;
		height: 20px;
		vertical-align: text-bottom;
	}
</style>