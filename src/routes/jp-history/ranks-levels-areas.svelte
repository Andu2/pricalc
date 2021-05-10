<script>
	import { jpContentHistory } from "@src/data/priconnedb";
	import DopeAssTable from "@src/components/DopeAssTable.svelte";
	import JPContentHeader from "@src/components/JPContentHeader.svelte";
	import JPContentFooter from "@src/components/JPContentFooter.svelte";

	const jpLaunchDate = new Date(jpContentHistory.jpLaunchDate);

	$: data = getData();

	let columns = [
		{
			attr: "maxLevel",
			displayName: "Max Player Level",
			sort: "numeric"
		}, {
			attr: "rank",
			displayName: "Max Equipment Rank",
			sort: "default"
		}, {
			attr: "area",
			displayName: "Furthest Quest Area",
			sort: "numeric"
		}, {
			attr: "jpDate",
			displayName: "JP Release Date",
			sort: "default"
		}, {
			attr: "jpDaysAfterLaunch",
			displayName: "Days After JP Launch",
			sort: "numeric"
		}
	];

	function getData() {
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
		for (var date in contentDates) {
			rows.push({
				maxLevel: contentDates[date].level || "-",
				rank: contentDates[date].rank || "-",
				area: contentDates[date].questArea || "-",
				jpDate: date,
				jpDaysAfterLaunch: Math.round((new Date(date) - jpLaunchDate) / 1000 / 60 / 60 / 24)
			});
		}
		return rows;
	}
</script>

<h2>JP Player Level, Equipment Rank, and Quest Area Timeline</h2>

<JPContentHeader />

<DopeAssTable data={data} columns={columns} scroll={false} />

<JPContentFooter />
