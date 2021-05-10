<script>
import { lookupRows, getTable } from "@src/data/priconnedb";
import { onMount } from "svelte";
import { readable } from "svelte/store";
import { localStorageStore } from "@src/local-store";
import { getUnlockedUnits } from "@src/logic/unit";
import DataComponent from "@src/components/DataComponent.svelte";

let requiredTables = [ "unit_data", "notif_data" ];

let notifications = [];
let quizLength = readable(0);
let questionOrder = readable([]);
let numAnswered = localStorageStore("notifQuiz/numAnswered", 0);
let numCorrect = localStorageStore("notifQuiz/numCorrect", 0);

let UNLOCKED_UNITS = [];
let gradeText = "";
let notification = null;

$: correctChoice = getCorrectChoice(notification);
$: choices = getChoices(notification);
$: notificationType = getNotificationType(notification);
$: encouragement = getEncouragement($numAnswered, quizLength);
$: outOfQuestions = isOutOfQuestions($numAnswered, quizLength);

let notificationTypes = {
	1: "your stamina is full",
	2: "your skip ticket furniture is full",
	3: "your stamina furniture is full",
	4: "your EXP potion furniture is full",
	5: "your mana furniture is full",
	6: "all your furniture is full"
}

// https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
function shuffle(array) {
	var currentIndex = array.length, temporaryValue, randomIndex;

	// While there remain elements to shuffle...
	while (0 !== currentIndex) {

		// Pick a remaining element...
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;

		// And swap it with the current element.
		temporaryValue = array[currentIndex];
		array[currentIndex] = array[randomIndex];
		array[randomIndex] = temporaryValue;
	}

	return array;
}

function getNewQuestionOrder(notifications) {
	let questionOrder = [];
	for (var i = 0; i < notifications.length; i++) {
		questionOrder.push(i);
	}
	return shuffle(questionOrder);
}

function nextQuestion(keep) {
	gradeText = "";
	if (!$questionOrder.length) {
		notification = null;
		return;
	}
	notification = notifications[$questionOrder[0]]
}

function getCorrectChoice(notification) {
	if (!notification) return null;
	return lookupRows("unit_data", { unit_id: notification.unit_id }, {}, { cache: true })[0];
}

function getChoices(notification) {
	if (!notification) {
		return [];
	}
	let choices = [correctChoice];
	let MAX_ATTEMPTS = 100;
	let attempt = 0;
	let randomChoice;
	let randomUnit;
	do {
		randomChoice = Math.floor(Math.random() * UNLOCKED_UNITS.length);
		randomUnit = UNLOCKED_UNITS[randomChoice];
		if (choices.indexOf(randomUnit) === -1) {
			choices.push(randomUnit);
		}
		attempt++;
	} while (attempt <= MAX_ATTEMPTS && choices.length < 5);
	return shuffle(choices);
}

function getNotificationType(notification) {
	if (!notification) {
		return "you are out of questions";
	}
	return notificationTypes[notification.notif_type]
}

function getUnitImage(choice) {
	let unitIdString = choice.unit_id + "";
	return "images/unit/unit_icon_unit_" + unitIdString.slice(0, 4) + "11.png";
}

function respond(i) {
	return function(e) {
		if (!gradeText) {
			if (choices[i] === correctChoice) {
				$numCorrect++;
				gradeText = correctChoice.unit_name + " is correct!";
			}
			else {
				gradeText = "Incorrect. It was " + correctChoice.unit_name;
			}
			$questionOrder.shift();
			$questionOrder = $questionOrder; // for Svelte to update
			$numAnswered++;
		}
	}
}

function getEncouragement(numAnswered) {
	let numQuestions = notifications.length;
	if (numQuestions === 0) {
		return "No notification data."
	}

	let pctAnswered = numAnswered / numQuestions;
	if (pctAnswered === 1) {
		return "Congratulations! You went through all the possible notifications, you absolute champion";
	}
	else if (pctAnswered >= 0.9) {
		return "You're almost there!"
	}
	else if (pctAnswered >= 0.7) {
		return "You've answered so many questions! I didn't think people would be interested enough in this silly quiz to get this far. That's awesome! Now...can you finish the job and get through them all?"
	}
	else if (pctAnswered >= 0.5) {
		return "Wow, you've gone through half the notification messages!";
	}
	else if (pctAnswered >= 0.4) {
		return "You're really churning through these, huh?";
	}
	else {
		return "Please do not feel obligated to go through all the possible notifications. There are a lot."
	}
}

function reset() {
	if (notifications.length > 0) {
		$numAnswered = 0;
		$numCorrect = 0;
		$questionOrder = getNewQuestionOrder(notifications);
		$quizLength = notifications.length;
		nextQuestion(true);
	}
}

function isOutOfQuestions() {
	return ($questionOrder.length === 0)
}

function getNotificationText(notification) {
	if (notification)  {
		return notification.comment;
	}
	else {
		return "(Error)"
	}
}

function onDataReady() {
	notifications = getTable("notif_data");
	quizLength = localStorageStore("notifQuiz/quizLength", notifications.length);
	questionOrder = localStorageStore("notifQuiz/questionOrder", getNewQuestionOrder(notifications));
	UNLOCKED_UNITS = getUnlockedUnits();

	nextQuestion(true);
}

</script>

<DataComponent requiredTables={requiredTables} onDataReady={onDataReady} >
	<div class="notification-quiz-wrap">
		<h1>Notification Quiz</h1>
		{#if !outOfQuestions}
		<p class="question">Which character says this notification when {notificationType}?</p>
		<p class="notification-text">{getNotificationText(notification)}</p>
		<div>
			<table><tr>
				{#each choices as choice, i}
				<td on:click={respond(i)} 
					class:correct={gradeText && correctChoice === choice} 
					class:incorrect={gradeText && correctChoice !== choice}
					class:not-yet-selected={!gradeText}
				>
					<img src={getUnitImage(choice)} /><br />
					{choice.unit_name}
				</td>
				{/each}
			</tr></table>
		</div>
		<div class="response">
			<div class="grade">
				{#if gradeText}
				<span 
					class:correct={gradeText.indexOf("orrect") > -1} 
					class:incorrect={gradeText.indexOf("ncorrect") > -1}
				>{gradeText}</span>
				{:else}
				<span class="faded-response">Select a character...</span>
				{/if}
			</div>
			<div class="button" on:click={nextQuestion} class:show={gradeText.length > 0}>Next question</div>
		</div>
		{:else if !notifications.length > 0}
		<p class="notification-text">You did it!</p>
		{/if}
		<div class="quiz-control">
			<p>Current score: {$numCorrect} / {$numAnswered}
				{#if $numAnswered > 0}
				({Math.round($numCorrect / $numAnswered * 100)}%)
				{/if}
			</p>
			<p>Notifications left: {$questionOrder.length} <a on:click={reset}>(reset)</a>
				{#if notifications.length > $quizLength}
				<span class="soft">Note: new notifications have been added since you started this quiz. They will not be included until you reset.</span>
				{:else if notifications.length < $quizLength}
				<span class="soft">Note: notifications have been removed since you started this quiz. You will not be able to continue the quiz until resetting or switching back to a newer data source.</span>
				{/if}
			</p>
			<p class="soft">{encouragement}</p>
		</div>
	</div>
</DataComponent>

<style>
h1 {
	font-family: "Liberation Serif", serif;
}

div.notification-quiz-wrap {
	text-align: center;
	font-size: 14pt;
}

p.question {

}

div.quiz-control {
	text-align: left;
	width: 700px;
	margin: 0 auto;
}

.soft {
	font-size: 12pt;
	color: #636c86;
	font-style: italic;
}

p.notification-text {
	font-size: 14pt;
	width: 700px;
	text-align: left;
	margin: 0 auto;
	font-weight: bold;
}

table {
	table-layout: fixed;
	border-spacing: 20px;
	margin: 0 auto;
}
td {
	cursor: pointer;
}
td.not-yet-selected img {
	opacity: 0.8;
}
td.not-yet-selected:hover img {
	opacity: 1;
}

td.correct {
	opacity: 1;
}
td.incorrect {
	opacity: 0.5;
}

div.response {
	text-align: left;
	position: relative;
	width: 700px;
	padding: 0 20px;
	margin: 0 auto;
	background-color: #cfe4ff;
	height: 40px;
	line-height: 40px;
}

div.response div.button {
	position: absolute;
	top: 3px; right: 3px; bottom: 3px;
	line-height: 34px;
	width: 150px;
	margin: auto 0;
	visibility: hidden;
}
div.response div.button.show {
	visibility: visible;
}

div.grade {
	height: 32px;
}

span.faded-response {
	/*color: #636c86;*/
}
span.correct {
	color: #286f69;
}
span.incorrect {
	color: #b72f7a;
}

div.button:active {
	border-top: 2px solid #cfe4ff;
}
</style>