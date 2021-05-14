<style global>
	/* Moved global style here in order to hit the postcss variable replacement */
	div#app-wrap {
		background-color: var(--marginBackground);
	}

	div#content-wrap {
		color: #232323;
	}

	div#content-wrap a {
		text-decoration: none;
		font-weight: bold;
		color: #ef7485;
		cursor: pointer; /* for anchors without href */
	}

	div#content-wrap a:hover {
		color: #566590
	}

	.link-button {
		font-weight: bold;
		color: #ef7485;
		cursor: pointer; /* for anchors without href */
	}

	.link-button:hover {
		color: #566590
	}

	div#content-wrap li.is-selected a {
		color: #566590
	}

	p {
		margin: 10px 0;
	}

	h1, h2, h3, h4, .heading {
		font-weight: bold;
		color: #303b5a;
	}

	div#content-wrap h2:first-of-type {
		margin-top: 0;
	}

	div.card-section {
		padding: 15px;
		padding-top: 20px;
		border: 3px solid #cfe4ff;
		border-radius: 20px;
		position: relative;
		vertical-align: top;
		margin: 5px;
		margin-top: 10px;
	}

	div.card-section-wrap {
		display: flex;
		flex-wrap: wrap;
		margin-left: -5px;
		margin-top: -5px;
	}

	div.card-section-header {
		text-align: center;
		font-weight: bold;
		font-size: 14pt;
		margin-bottom: 8px;
		position: absolute;
		top: -15px;
		background-color: #ffffff;
		padding: 0 20px;
		left: 50px;
	}

	div.card-section-header.centered {
		left: 50%;
		transform: translateX(-50%);
	}

	div.card-section-content {
		
	}

	div.button {
		user-select: none;
		text-align: center;
		cursor: pointer;
		background-color: #4e81e0;
		border-bottom: 2px solid #303b5a;
		border-radius: 4px;
		opacity: 0.8;
		color: white;
	}

	div.button:hover {
		opacity: 1;
	}

	div.button:active {
		border-top: 2px solid white;
		border-bottom-width: 0;
		border-radius: 5px 5px 4px 4px;
	}

	th {
		text-align: left;
	}

	td {
		vertical-align: top;
	}

	img.table-icon {
		width: 40px;
		height: 40px;
	}

	/* hr must be styled by class */
	hr.hr {
		margin: 20px 0;
	}

	.error {
		color: red;
	}

	div.inline-icon-wrap {
		display: inline-block;
		vertical-align: middle; /*Not ideal to have this inline though*/
	}

	img.inline-icon {
		width: 20px;
		height: 20px;
		vertical-align: text-bottom;
	}

	img.inline-icon-big {
		width: 40px;
		height: 40px;
		vertical-align: text-bottom;
	}

	div.inline-icon-label {
		text-align: center;
	}

	span.skill-technical-description {
		color: #636c86;
	}

	span.skill-game-description {
		font-style: normal;
	}

	span.skill-game-description + span.skill-technical-description {
		margin-left: 5px;
	}

	/* Loading spinner from https://loading.io/css/ */
	.lds-dual-ring {
		display: inline-block;
		width: 60px;
		height: 60px;
	}
	.lds-dual-ring:after {
		content: " ";
		display: block;
		width: 32px;
		height: 32px;
		margin: 8px;
		border-radius: 50%;
		border: 6px solid #7080af;
		border-color: #7080af transparent #7080af transparent;
		animation: lds-dual-ring 1.2s linear infinite;
	}
	@keyframes lds-dual-ring {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}

</style>