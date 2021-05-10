<script>
import { stores } from "@sapper/app";
const { page } = stores();
import { savedUnit, baseUnitConfig } from "@src/settings.js"
import { isValidUnitConfiguration } from "@src/logic/unit";
import UnitCard from "@src/components/UnitCard.svelte";
</script>

<UnitCard bind:unit={$savedUnit}/>
