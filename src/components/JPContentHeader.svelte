<script>
	import { jpContentHistory } from "@src/data/priconnedb";
	let daysAfterEn = Math.round((Date.now() - (new Date(jpContentHistory.enLaunchDate))) / 1000 / 60 / 60 / 24)
</script>

<p>It has been <strong>{daysAfterEn}</strong> days since global launch.</p>