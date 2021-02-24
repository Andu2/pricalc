<script>
	import { includeExSkillStats, hideImpossibleRarities } from "@src/settings.js";
</script>

<input type="checkbox" bind:checked={$includeExSkillStats} /> Include EX skill in stat calculations <br />
<input type="checkbox" bind:checked={$hideImpossibleRarities} /> Hide 1* and 2* versions of units that are impossible to acquire