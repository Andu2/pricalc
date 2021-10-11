<script>
	import { jpContentHistory } from "@src/data/priconnedb";
	import { enScheduleOffset } from "@src/settings.js";
	import { formatDate, determineOffsetWord } from "@src/utils";
	import DopeAssTable from "@src/components/DopeAssTable.svelte";
	import JPContentHeader from "@src/components/JPContentHeader.svelte";
	import JPContentFooter from "@src/components/JPContentFooter.svelte";

	const jpLaunchDate = new Date(jpContentHistory.jpLaunchDate);
	const enLaunchDate = new Date(jpContentHistory.enLaunchDate);

	$: data = getData($enScheduleOffset.quest);

	let columns = [
		{
			html: true,
			attr: "maxLevel",
			displayName: "Max<br/>Player<br/>Level",
			sort: "numeric"
		}, {
			html: true,
			attr: "rank",
			displayName: "Max<br/>Equipment<br/>Rank",
			sort: "default"
		}, {
			html: true,
			attr: "area",
			displayName: "Furthest<br/>Quest<br/>Area",
			sort: "numeric"
		}, {
			attr: "jpDate",
			displayName: "JP Release Date",
			sort: "default"
		}, {
			html: true,
			attr: "jpDaysAfterLaunch",
			displayName: "Days since<br/>JP Launch",
			sort: "numeric"
		}, {
			html: true,
			attr: "enDaysToRelease",
			displayName: "Days to<br/>EN Release",
			sort: "numeric"
		}, {
			html: true,
			attr: "enReleaseDate",
			displayName: "Expected EN<br/>Release Date",
			sort: "default"
		}
	];

	function getData(offset = $enScheduleOffset.quest) {
		let contentDates = {};
		jpContentHistory.levelCap.forEach(function(cap) {
			contentDates[cap.jpDate] = { level: cap.level };
		});
		jpContentHistory.ranks.forEach(function(rank) {
			if (contentDates[rank.jpDate] === undefined) {
				contentDates[rank.jpDate] = {};
			}
			contentDates[rank.jpDate].rank = rank.rank;
			contentDates[rank.jpDate].questArea = rank.questArea;
		});

		let rows = [];
		for (let date in contentDates) {
			const jpDaysAfterLaunch = Math.round((new Date(date) - jpLaunchDate) / 1000 / 60 / 60 / 24);
			const enDaysAfterLaunch = Math.round((Date.now() - enLaunchDate) / 1000 / 60 / 60 / 24);
			const enDaysToRelease = jpDaysAfterLaunch - enDaysAfterLaunch + offset;
			const enReleaseDate = new Date((Date.now() + (enDaysToRelease * 1000 * 60 * 60 * 24)));
			rows.push({
				maxLevel: contentDates[date].level || "–",
				rank: contentDates[date].rank || "–",
				area: contentDates[date].questArea || "–",
				jpDate: formatDate(new Date(date)),
				jpDaysAfterLaunch,
				enDaysToRelease,
				enReleaseDate: formatDate(enReleaseDate),
			});
		}
		return rows;
	}
</script>

<h2>JP Player Level, Equipment Rank, and Quest Area Timeline</h2>

<JPContentHeader />
<p>This page assumes EN schedule is <strong>{determineOffsetWord($enScheduleOffset.quest)}</strong> by <strong>{Math.abs($enScheduleOffset.quest)}</strong> days.</p>

<DopeAssTable data={data} columns={columns} scroll={false} />

<JPContentFooter />
