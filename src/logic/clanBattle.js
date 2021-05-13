import { dataSource } from "@src/settings";

let dataSourceServer = "en";
let dataSourceVersion = "latest";
const dataUnsubscribe = dataSource.subscribe(function(value) {
	[ dataSourceServer, dataSourceVersion ] = value.split("-");
});

export function isNewCBDataFormat() {
	if (dataSourceServer === "en") {
		return false;
	}
	else if (dataSourceVersion > "10014900") {
		return true;
	}
	else {
		return false;
	}
}