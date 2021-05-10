# PriCalc - Priconne EN calculators and reference

## Data setup

Data was extracted using [this tool](https://github.com/Andu2/priconne-cdn-extract) and uploaded to a CDN. 

If you are looking to use the data for your own project, you are probably best off pulling from my CDN rather than extracting it all again yourself.
Example URL: `https://pricalc.b-cdn.net/en/masterdata/extract/latest/unit_data.csv`

You can check this [DB dump repository](https://github.com/esterTion/redive_master_db_diff) to see what tables you can pull.

Data is provided as CSV because it's significantly smaller than a JSON version would be.

## Philosophy and Goals

 * *Enable enjoyment* - PriCalc is intended to be a tool that enables players to do their own analysis. I find overanalyzing games to be fun, and I'm hoping this tool will allow people to have fun in the same way.
 * *Don't tell people how to play* - Let other people make guides and tier lists. Make it easier for them to do so. Ideally this site will inspire content creators rather than trying to monopolize community content.
 * *Easy-to-update reference* - Unlike a wiki that has to be manually modified when there's an update, this tool will just accept new data without any necessary development work.
 