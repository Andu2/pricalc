// <script>
//Wanted to use sqlite db directly in PHP, but my server can't do sqlite connections in php
var priconneDb = {};

<?php

if ($handle = opendir("data")) {
	while (($entry = readdir($handle)) !== false) {
		if (substr($entry, -5) === ".json") {
			$tableName = substr($entry, 0, -5);
			echo "priconneDb." . $tableName . " = ";
			readfile("data/" . $entry);
			echo ";\n";
		}
	}
	closedir($handle);
}

?>

// </script>
