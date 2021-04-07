<script>
import { lookupRows } from "@src/data/priconnedb";
import QuestViewer from "@src/components/QuestViewer.svelte";

// event_story_data gives us the name of the event
let eventStories = lookupRows("event_story_data", {});
let eventId = eventStories.slice(-1)[0].value;

$: eventSchedule = lookupRows("hatsune_schedule", { event_id: eventId })[0];
$: scheduleText = getScheduleText(eventSchedule);

$: eventStory = lookupRows("event_story_data", { value: eventId })[0];
$: storyGroup = getStoryGroup(eventStory);
$: storyDetails = lookupRows("event_story_detail", { story_group_id: storyGroup });

$: dailyMissions = lookupRows("hatsune_daily_mission_data", { event_id: eventId });
$: oneTimeMissions = lookupRows("hatsune_stationary_mission_data", { event_id: eventId });

$: quests = getQuests(eventId);

$: bossQuests = lookupRows("hatsune_boss", {event_id: eventId });

let questId = -1;
$: questData = lookupRows("hatsune_quest", { quest_id: questId })[0];

let playerLevel = 1;
let variant = 1;

function getScheduleText(schedule) {
	return schedule.start_time.split(" ")[0] + " to " + schedule.end_time.split(" ")[0];
}

function getStoryGroup(eventStory) {
	if (eventStory) {
		return eventStory.story_group_id;
	}
	return null;
}

function getStoryRewards(stories) {
	let rewards = {};
	stories.forEach(function(story) {
		for (var i = 1; i <= 3; i++) {
			let rewardId = story["reward_id_" + i];
			if (rewardId > 0) {
				if (rewards[rewardId] === undefined) {
					rewards[rewardId] = 0;
				}
				rewards[rewardId] += story["reward_value_" + i];
			}
		}
	});
	return combineRewards(rewards);
}

function getMissionRewards(missions) {
	let rewards = {};
	missions.forEach(function(mission) {
		let rewardRows = lookupRows("hatsune_mission_reward_data", { mission_reward_id: mission.mission_reward_id });
		rewardRows.forEach(function(reward) {
			if (rewards[reward.reward_id] === undefined) {
				rewards[reward.reward_id] = 0;
			}
			rewards[reward.reward_id] += reward.reward_num;
		});
	});
	return combineRewards(rewards);
}

function getQuestRewards(quests, type) {
	let rewards = {};
	quests.forEach(function(quest) {
		if (type === undefined || type === "clear") {
			let clearRewards = lookupRows("quest_reward_data", { reward_group_id: quest.clear_reward_group })[0];
			for (var i = 1; i <= 5; i++) {
				let rewardId = clearRewards["reward_id_" + i];
				if (rewardId > 0) {
					if (rewards[rewardId] === undefined) {
						rewards[rewardId] = 0;
					}
					rewards[rewardId] += clearRewards["reward_num_" + i];
				}
			}
		}
		if (type === undefined || type === "rank") {
			let rankRewards = lookupRows("quest_reward_data", { reward_group_id: quest.rank_reward_group })[0];
			for (var i = 1; i <= 5; i++) {
				let rewardId = rankRewards["reward_id_" + i];
				if (rewardId > 0) {
					if (rewards[rewardId] === undefined) {
						rewards[rewardId] = 0;
					}
					rewards[rewardId] += rankRewards["reward_num_" + i];
				}
			}
		}
	});
	return combineRewards(rewards);
}

function combineRewards(rewards) {
	// boss tickets
	if (rewards[60011]) {
		if (rewards[60001] === undefined) {
			rewards[60001] = 0;
		}
		rewards[60001] += rewards[60011];
		delete rewards[60011];
	}

	// gacha medals
	if (rewards[60012]) {
		if (rewards[60002] === undefined) {
			rewards[60002] = 0;
		}
		rewards[60002] += rewards[60012];
		delete rewards[60012];	
	}
	return rewards;
}

function getRewardHtml(rewards) {
	let htmls = [];
	for (var itemId in rewards) {
		if (itemId > 99999) {
			// equipment
			// htmls.push(rewards[itemId] + " <img class='inline-icon-big' src='images/equipment/icon_icon_equipment_" + itemId + ".png' />");
		}
		else {
			let html = "<div class='inline-icon-wrap'><div><img class='inline-icon-big' src='images/item/icon_icon_item_" + itemId + ".png' /></div>"
			 + "<div class='inline-icon-label'>" + rewards[itemId] + "</div></div>"
			htmls.push(html);
		}
	}
	return htmls.join("\n");
}

function getQuests(eventId) {
	let quests = lookupRows("hatsune_quest", { event_id: eventId });
	if (quests.length) {
		questId = quests[0].quest_id;
	}
	else {
		questId = -1;
	}
	return quests;
}
</script>

<h2>Event Drops and Data Reference</h2>

Event: <select bind:value={eventId} >
{#each eventStories as event}
	<option value={event.value}>
		{event.title}
	</option>
{/each}
</select>

<p>
<strong>Dates:</strong> {scheduleText}
</p>

<select bind:value={questId}>
	{#each quests as quest}
	<option value={quest.quest_id}>
		{quest.quest_name}
	</option>
	{/each}
</select>

<input type="number" min=0 max=88 bind:value={playerLevel} />
<input type="number" min=1 max=5 bind:value={variant} />

<QuestViewer questData={questData} isEvent={true} playerLevel={playerLevel} variant={variant} />

<!-- <h3>Story Rewards</h3>

<p>Cumulative rewards: {@html getRewardHtml(getStoryRewards(storyDetails))}</p>

<table>
	<tr><th>Story</th><th>Rewards</th></tr>
	{#each storyDetails as story}
	<tr>
		<td>{story.title}: {story.sub_title}</td>
		<td>{@html getRewardHtml(getStoryRewards([story]))}</td>
	</tr>
	{/each}
</table>

<h3>Mission Rewards</h3>

<h4>Daily Missions</h4>

<p>Cumulative rewards: {@html getRewardHtml(getMissionRewards(dailyMissions))}</p>

<table>
	<tr><th>Mission</th><th>Rewards</th></tr>
	{#each dailyMissions as mission}
	<tr>
		<td>{mission.description}</td>
		<td>{@html getRewardHtml(getMissionRewards([mission]))}</td>
	</tr>
	{/each}
</table>

<h4>One-time Missions</h4>

<p>Cumulative rewards: {@html getRewardHtml(getMissionRewards(oneTimeMissions))}</p>

<table>
	<tr><th>Mission</th><th>Rewards</th></tr>
	{#each oneTimeMissions as mission}
	<tr>
		<td>{mission.description}</td>
		<td>{@html getRewardHtml(getMissionRewards([mission]))}</td>
	</tr>
	{/each}
</table>

<h3>Quest Rewards</h3>



<p>Cumulative rewards: {@html getRewardHtml(getQuestRewards(quests))}</p>

<table>
	<tr><th>Quest</th><th>Clear rewards</th><th>3* rewards</th></tr>
	{#each quests as quest}
	<tr>
		<td>{quest.quest_name}</td>
		<td>{@html getRewardHtml(getQuestRewards([quest], "clear"))}</td>
		<td>{@html getRewardHtml(getQuestRewards([quest], "rank"))}</td>
	</tr>
	{/each}
</table>

<h3>Boss Rewards</h3>

<h3>Gacha Rewards</h3> -->