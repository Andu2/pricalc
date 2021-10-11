<script>
	import { jpContentHistory } from "@src/data";
	import { getUnitImg } from "@src/logic";
	import { enScheduleOffset } from "@src/settings.js";
	import { escAttr, formatDate, determineOffsetWord } from "@src/utils";
	import DopeAssTable from "@src/components/DopeAssTable.svelte";
	import JPContentHeader from "@src/components/JPContentHeader.svelte";
	import JPContentFooter from "@src/components/JPContentFooter.svelte";

	const jpLaunchDate = new Date(jpContentHistory.jpLaunchDate);
	const enLaunchDate = new Date(jpContentHistory.enLaunchDate);

	$: data = getData($enScheduleOffset.sixStars);

	let columns = [
		{
			attr: "icon",
			displayName: "Icon",
			html: true,
			sort: null
		}, {
			attr: "name",
			displayName: "Character",
			sort: "default"
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

	function getData(offset = $enScheduleOffset.sixStars) {
		let unitsAdded = jpContentHistory.sixStar;
		return unitsAdded.map(function(unitAdded) {
			let iconHtml = "";
			if (unitAdded.unitId > -1) {
				iconHtml = "<img class=\"table-icon\" src=\"" + escAttr(getUnitImg(unitAdded.unitId, { rarity: 6, server: "jp" })) + "\" />";
			}

			const jpDaysAfterLaunch = Math.round((new Date(unitAdded.jpDate) - jpLaunchDate) / 1000 / 60 / 60 / 24);
			const enDaysAfterLaunch = Math.round((Date.now() - enLaunchDate) / 1000 / 60 / 60 / 24);
			const enDaysToRelease = jpDaysAfterLaunch - enDaysAfterLaunch + offset;
			const enReleaseDate = new Date((Date.now() + (enDaysToRelease * 1000 * 60 * 60 * 24)));

			return {
				icon: iconHtml,
				name: unitAdded.name,
				jpDate: formatDate(new Date(unitAdded.jpDate)),
				jpDaysAfterLaunch,
				enDaysToRelease,
				enReleaseDate: formatDate(enReleaseDate),
			}
		});
	}
</script>

<h2>JP Six Star Upgrade Timeline</h2>

<JPContentHeader />
<p>This page assumes EN schedule is <strong>{determineOffsetWord($enScheduleOffset.sixStars)}</strong> by <strong>{Math.abs($enScheduleOffset.sixStars)}</strong> days.</p>

<DopeAssTable data={data} columns={columns} scroll={false} />

<JPContentFooter />
