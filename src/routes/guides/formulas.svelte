<script>
import { STAT_NAMES, STAT_DISPLAY_NAMES, lookupRows } from "@src/data/priconnedb";

let coefficients = lookupRows("unit_status_coefficient", {})[0];

let defense = 132;
$: defenseMult = 1 / (1 + defense / 100);

let critRate = 40;
let critAttackerLevel = 80;
let critDefenderLevel = 80;
$: critChance = Math.min(100, critRate / 20 * critAttackerLevel / critDefenderLevel);

let dodge = 10;
let accuracy = 0;
let dodgeAttackerLevel = 80;
let dodgeDefenderLevel = 80;
$: dodgeChance = Math.min(100, Math.max((dodge - accuracy), 0) * (dodgeDefenderLevel / dodgeAttackerLevel) / (1 + (dodge - accuracy) / 100));
</script>

<h2>Formula Guide</h2>

<h3>Power</h3>
<p>Power is calculated by multiplying each stat by its given weight and adding it all up. The weights for each stat are:</p>
<table><tr><th>Stat</th><th>Weight</th></tr>
	{#each STAT_NAMES as stat}
	<tr><td class="label">{STAT_DISPLAY_NAMES[stat]}</td><td class="number">{coefficients[stat + "_coefficient"]}</td></tr>
	{/each}
	<tr><td class="label">Skill levels</td><td class="number">{coefficients["skill_lv_coefficient"]}</td>
</table>
<p>Additionally, 150 power is added if it's a 5* rarity unit.</p>

<h3>Defense</h3>
<p>The damage formula is: Damage = Attack / (1 + Defense / 100)</p>
<p>This means 100 defense halves incoming damage, and 300 defense quarters it. It is the same for both magical and physical attacks.</p>
<p>If we analyze this formula, we can see that defense linearly increases the amount of damage a character can take. Defense is like a percentage increase in effective health - adding 3 defense means a character can take additional raw damage equal to 3% of their base health. The benefit of adding defense is constant regardless of how much defense a character already has.</p>
<p>Try it out: With defense <input id="defense" type="number" bind:value={defense} />, incoming damage is multiplied by {defenseMult.toFixed(4)}</p>

<h3>Critical Hits</h3>
<p>Critical damage is twice normal damage. Crit chance in percentage is equal to (Crit rate / 20) * (Attacker level / Defender level). It is the same for both magical and physical attacks.</p>
<p>Try it out: With crit rate <input id="critRate" type="number" bind:value={critRate} />, 
	attacker level <input id="critAttackerLevel" type="number" bind:value={critAttackerLevel} />,
	and defender level <input id="critDefenderLevel" type="number" bind:value={critDefenderLevel} />,
	crit chance is {(critChance).toFixed(2) + "%"}.
</p>

<h3>Accuracy and Dodging</h3>
<p>Dodge chance in percentage is equal to (Defender dodge - Attacker accuracy) / (1 + (Defender dodge - Attacker accuracy) / 100). It only works on physical attacks.</p>
<!-- <p>Dodge chance is apparently affected by difference in level, but I can't find the exact values. If you know more, let me know and I can update the formula.</p> -->
<p>Try it out: With attacker accuracy <input id="accuracy" type="number" bind:value={accuracy} />
<!-- 	and level <input id="dodgeAttackerLevel" type="number" bind:value={dodgeAttackerLevel} /> -->
	vs. defender dodge <input id="dodge" type="number" bind:value={dodge} />
<!-- 	and level <input id="dodgeDefenderLevel" type="number" bind:value={dodgeDefenderLevel} />, -->
	the chance of dodging is {dodgeChance.toFixed(2) + "%"}.
</p>
<h3>TP Boost and HP Recovery Boost</h3>
TP Boost and HP Recovery Boost are straight percentage increases. So, TP Boost of 30 means 30% faster TP gain. Note that HP Recovery Boost matters on the healer, not the healee.

<style>
input[type="number"] {
	width: 70px;
}

td.label {
	padding-right: 20px;
}

td.number {
	font-family: monospace;
}
</style>