const extId = chrome.runtime.id;
const currentPage = window.location.href
let activeObservers = []
let capturedElements = []
let initiated = false

var previousUrl = window.location.href;
var urlObserver = new MutationObserver(function (mutations) {
	if (location.href !== previousUrl) {
		previousUrl = location.href;
		console.log("disconnecting observers");
		//loop through all observers and disconnect them
		for (let i = 0; i < activeObservers.length; i++) {
			activeObservers[i].disconnect();
		}
		//clear the observers array
		activeObservers = [];
		//capturedElements = [];

	}

});

const config = { subtree: true, childList: true };
urlObserver.observe(document, config);

//send profile info to popup on message request
chrome.runtime.onMessage.addListener(
	function (request, sender, sendResponse) {
		if (request.action === "getProfileInfo") {
			const { name, headline, about } = getProfileInfo()
			const profileInfo = {
				"name": name,
				"headline": headline,
				"about": about
			}
			sendResponse(profileInfo);
		}
	}
);



class InjectionScript {

	init() {
		chrome.runtime.onMessage.addListener((...params) => this.onMessage(...params));
	}

	onMessage(msg, sender, sendRes) {
		if (sender.id != extId || !msg?.op) { return; }

		switch (msg.op) {
			case "confirm":
				console.debug("Already injected");
				//check if page is finished loading				
				initialize();

				return void sendRes(true);
			// Other ops
			default:
				console.error("Unknown OP: " + msg.op);
		}

	}

}
new InjectionScript().init();

initialize();

// A class for LinkedIn message box that adds a generate button inside on construction
class MessageBoxRegular {

	constructor(messageBox) {
		console.log("message box found");
		this.messageBox = messageBox;
		// generate random id number for the message box
		this.id = Math.floor(Math.random() * 10000);		
		this.init();
	}

	init() {
		this.messageField = this.messageBox.querySelector(".msg-form__contenteditable");

		this.messageCurrent = this.messageField.innerText;

		//empty message field
		//this.messageField.innerHTML = "<p> </p>";

		//remove placeholder text
		let placeholder = this.messageBox.querySelector('.msg-form__placeholder');
		if (placeholder) {
			placeholder.remove();
		}
		
		//add generate button before the send button
		this.messageBox.querySelector(".msg-form__send-button").insertAdjacentHTML('beforebegin', `<button id="generate${this.id}" type="button" class="msg-form__send-button artdeco-button artdeco-button--1">Generate</button>`);

	
		//add event listener to the generate button
		this.messageBox.querySelector(`#generate${this.id}`).addEventListener('click', async () => {

			this.messageCurrent = this.messageField.innerText;
			this.messageField.innerHTML = "<p> </p>";

			//if message field is over 200 characters clear it
			if (this.messageCurrent.length > 200) {
				this.messageCurrent = "";
			}

			let message = await generateMessage(this);

			message = message.replace(/(\r\n|\n|\r)/gm, "<br>");
			
			// convert each line into a paragraph
			message = message.split("<br>").map(line => `<p>${line}</p>`).join("");

			// add br tag in each empty paragraph
			message = message.replace(/<p><\/p>/g, "<p><br></p>");

			let messageParagraph = this.messageBox.querySelector(".msg-form__contenteditable");
			
			messageParagraph.innerHTML = `${this.messageCurrent} ${message}`;
			//typeWriter(messageParagraph, `${this.messageCurrent} ${message}`);

			//messageField.innerHTML = `<p>${messageValue} ${message}</p>`
			//register that the fields had text entered
			//form = document.querySelector(".msg-form__contenteditable")
	
			this.messageField.dispatchEvent(new Event("input", { bubbles: true }));
			
		});
	}
	
}

class MessageBoxSalesNav {

	constructor(messageBox) {
		console.log("message box found");
		this.messageBox = messageBox;
		// generate random id number for the message box
		this.id = Math.floor(Math.random() * 10000);		
		this.init();
	}

	init() {
		this.messageField = document.querySelector(".compose-form__message-field");
		this.subjectField = document.querySelector(".compose-form__subject-field");

		this.messageCurrent = this.messageField.value;		
		
		//add generate button before the send button
		this.messageBox.querySelector(".artdeco-button.artdeco-button--2.artdeco-button--primary").insertAdjacentHTML('beforebegin', `<button id="generate${this.id}" type="button" class="msg-form__send-button artdeco-button artdeco-button--2">Generate</button>`);

	
		//add event listener to the generate button
		this.messageBox.querySelector(`#generate${this.id}`).addEventListener('click', async () => {

			//if message field is over 200 characters clear it
			if (this.messageCurrent.length > 200) {
				this.messageField.value = "";
			}

			let message = await generateMessage(this);
			
			this.messageField.value = `${this.messageCurrent} ${message}`.trim();
			this.subjectField.value = "Reaching out";				
	
			this.messageField.dispatchEvent(new Event("input", { bubbles: true }));
			this.subjectField.dispatchEvent(new Event("input", { bubbles: true }));
			
		});
	}
	
}

class ConnectBoxRegular {

	constructor(connectBox) {
		console.log("connect box found");
		this.messageBox = connectBox;
		// generate random id number for the message box
		this.id = Math.floor(Math.random() * 10000);		
		this.init();
	}

	init() {
		this.messageField = this.messageBox.querySelector("#custom-message");

		this.messageCurrent = this.messageField.value;
				
		//add generate button before the send button
		this.messageBox.querySelector("[aria-label='Send now']").insertAdjacentHTML('beforebegin', `<button id="generate${this.id}" type="button" class="msg-form__send-button artdeco-button artdeco-button--1">Generate</button>`);

	
		//add event listener to the generate button
		this.messageBox.querySelector(`#generate${this.id}`).addEventListener('click', async () => {

			this.messageCurrent = this.messageField.value;

			//if message field is over 100 characters clear it
			if (this.messageCurrent.length > 100) {
				this.messageCurrent = "";
			}

			let message = await generateConnectRequest(this);
			
			this.messageField.value = `${this.messageCurrent} ${message}`;

			//messageField.innerHTML = `<p>${messageValue} ${message}</p>`
			//register that the fields had text entered
			//form = document.querySelector(".msg-form__contenteditable")
	
			this.messageField.dispatchEvent(new Event("input", { bubbles: true }));
			
		});
	}
	
}

class ConnectBoxSalesNav {

	constructor(connectBox) {
		console.log("connect box found");
		this.messageBox = connectBox;
		// generate random id number for the message box
		this.id = Math.floor(Math.random() * 10000);		
		this.init();
	}

	init() {
		this.messageField = this.messageBox.querySelector("#connect-cta-form__invitation");

		this.messageCurrent = this.messageField.value;
				
		//add generate button before the send button
		this.messageBox.querySelector(".button-primary-medium.connect-cta-form__send").insertAdjacentHTML('beforebegin', `<button id="generate${this.id}" type="button" class="button-primary-medium connect-cta-form__send" style="margin-right:10px">Generate</button>`);

		//add event listener to the generate button
		this.messageBox.querySelector(`#generate${this.id}`).addEventListener('click', async () => {

			this.messageCurrent = this.messageField.value;

			//if message field is over 100 characters clear it
			if (this.messageCurrent.length > 100) {
				this.messageCurrent = "";
			}

			let message = await generateConnectRequest(this);
			
			this.messageField.value = `${this.messageCurrent} ${message}`;

			//messageField.innerHTML = `<p>${messageValue} ${message}</p>`
			//register that the fields had text entered
			//form = document.querySelector(".msg-form__contenteditable")
	
			this.messageField.dispatchEvent(new Event("input", { bubbles: true }));
			
		});
	}
	
}
		

function initialize() {
	//-------------------- Sales Navicator Profile --------------------

	if (currentPage.includes("linkedin.com/sales/")) {

		//check if the page is loaded
		console.log("Sales Navigator Profile");

		if (document.readyState === 'complete') {
			console.log("doc ready");		

			const observer = new MutationObserver(mutations => {
				
				// add all newly added elements with .msg-convo-wrapper class capturedElements .
				mutations.forEach((mutation) => {
					mutation.addedNodes.forEach((node) => {
						if (node.classList && node.classList.contains("compose-form__message-field") && !capturedElements.includes(node)) {
							let messageOverlay = node.closest("#message-overlay");
							new MessageBoxSalesNav(messageOverlay);
							capturedElements.push(node);
						}	
						
						// if not has id with custom-message and not in capturedElements .artdeco-modal.artdeco-modal--layer-default
						if (node.classList && node.classList.contains("artdeco-modal") && !capturedElements.includes(node)) {
							new ConnectBoxSalesNav(node);
							capturedElements.push(node);
						}

						if (node.id && node.id.includes("about-section") && !capturedElements.includes(node)) {
							let buttons = document.querySelectorAll('#about-section button');
							if (buttons.length > 0) {
								buttons[0].click();
							}							
							capturedElements.push(node);
						}

						if (node.classList && node.classList.contains("_ellipsis-button_1d1vlq") && !capturedElements.includes(node)) {
							node.click();
							capturedElements.push(node);
						}
					});
				});				

			});

			observer.observe(document.body, {				
				childList: true,
				subtree: true				
			});
	
			activeObservers.push(observer);

		}

	}

	// -------------- Regular Profile ----------------
	if (currentPage.includes("linkedin.com/in/")) {

		if (document.readyState === 'complete') {

			console.log("regular profile detected");

			//click read more on profile
			waitForElm('.display-flex.pv3 .inline-show-more-text__button').then((elm) => {
				if (capturedElements.includes(elm)) {
					return;
				}
				capturedElements.push(elm);
				document.querySelector(".display-flex.pv3 .inline-show-more-text__button").click();
			});

			const observer = new MutationObserver(mutations => {
				
				// add all newly added elements with .msg-convo-wrapper class capturedElements
				mutations.forEach((mutation) => {
					mutation.addedNodes.forEach((node) => {
						if (node.classList && node.classList.contains("msg-convo-wrapper") && !capturedElements.includes(node)) {
							new MessageBoxRegular(node);
							capturedElements.push(node);
						}						
						// if not has id with custom-message and not in capturedElements
						if (node.id && node.id.includes("custom-message") && !capturedElements.includes(node)) {
							// get parent node with [aria-labelledby='send-invite-modal']
							let connectBox = node.closest("[aria-labelledby='send-invite-modal']");
							new ConnectBoxRegular(connectBox);
							capturedElements.push(node);
						}
					});
				});				

			});

			observer.observe(document.body, {				
				childList: true,
				subtree: true				
			});
	
			activeObservers.push(observer);

		}

	}
}

function insertCTAButton() {

	//find the send the button
	let sendButton = document.querySelector(".connect-cta-form__send")

	//add generate button before the send button
	sendButton.insertAdjacentHTML('beforebegin', '<button id="generateconnect" type="button" class="artdeco-button artdeco-button--2 artdeco-button--primary ember-view">Generate</button>');

	//add event listener to the generate button
	document.querySelector("#generateconnect").addEventListener('click', function () {
		generateConnect()
	});

}


// Generate personalized message
async function generateMessage(messageBoxInstance) {
	const mb = messageBoxInstance
	try {
		//show loading indicator gif		
		mb.messageBox.querySelector(`#generate${mb.id}`).innerHTML = '<img src="https://media.giphy.com/media/L05HgB2h6qICDs5Sms/giphy.gif" width="20" height="20" />'

		//get the name of the person you are sending the message to
		let profileinfo = getProfileInfo()
		//console.log(profileinfo)

		let name = profileinfo.name
		//get profile headline
		let headline = profileinfo.headline
		//get profile about section
		let about = profileinfo.about

		let starterPhrase = ""

		//if message is less than 200 characters, use the message as the starter phrase
		if (mb.messageField.length < 200) {
			starterPhrase = mb.messageCurrent
		}

		const recipientData = {
			"recipientFirstName": name,
			"recipientLastName": name,
			"recipientHeadline": headline,
			"recipientProfile": about,
			"startPhrase": starterPhrase
		}

		//send request to openai
		let message = await getResponse(recipientData)

		//remove loading indicator gif
		mb.messageBox.querySelector(`#generate${mb.id}`).innerHTML = 'Generate'

		return message

	} catch (error) {
		mb.messageBox.querySelector(`#generate${mb.id}`).innerHTML = 'Generate'

		switch (error.message) {
			case "no user found":
				alert("Error: You are not logged into the extension. Please login by clicking the extension icon.")
				throw error;
			case "You don't have enough credits to send a message":
				alert("Error: You don't have enough credits. You can purchase more by pressing the credits button in the extension popup.")
				throw error;
			default:
				alert("Error: Something went wrong. Please ensure you have selected a message mode in the extension pop up, entered settings info and pressed apply. If this error persists, please contact support.")
				throw error;				
		}		
	}

}

// Generate connection request
async function generateConnectRequest(connectBoxInstance) {
	const cb = connectBoxInstance
	try {
		//show loading indicator gif		
		cb.messageBox.querySelector(`#generate${cb.id}`).innerHTML = '<img src="https://media.giphy.com/media/L05HgB2h6qICDs5Sms/giphy.gif" width="20" height="20" />'

		//get the name of the person you are sending the message to
		let profileinfo = getProfileInfo()
		//console.log(profileinfo)

		let name = profileinfo.name
		//get profile headline
		let headline = profileinfo.headline
		//get profile about section
		let about = profileinfo.about

		let starterPhrase = ""

		//if message is less than 200 characters, use the message as the starter phrase
		if (cb.messageField.length < 200) {
			starterPhrase = cb.messageCurrent
		}

		const recipientData = {
			"recipientFirstName": name,
			"recipientLastName": name,
			"recipientHeadline": headline,
			"recipientProfile": about,
			"selectedMode": "connect-request-settings",
			"startPhrase": starterPhrase
		}

		//send request to openai
		let message = await getResponse(recipientData)

		//remove loading indicator gif
		cb.messageBox.querySelector(`#generate${cb.id}`).innerHTML = 'Generate'

		return message

	} catch (error) {
		cb.messageBox.querySelector(`#generate${cb.id}`).innerHTML = 'Generate'

		switch (error.message) {
			case "no user found":
				alert("Error: You are not logged into the extension. Please login by clicking the extension icon.")
				throw error;
			case "You don't have enough credits to send a message":
				alert("Error: You don't have enough credits. You can purchase more by pressing the credits button in the extension popup.")
				throw error;
			default:
				alert("Error: Something went wrong. If this error persists, please contact support.")
				throw error;				
		}		
	}

}


//function that returns object with name, headline and about
function getProfileInfo() {

	let name;
	let headline;
	let about;

	if (isSalesNavigatorProfile()) {
		name = document.querySelector("[data-x--lead--name]")?.innerText.replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '').trim().split(' ')[0] || ''
		headline = document.querySelector("._bodyText_1e5nen [data-anonymize='headline']")?.innerText || ''
		about = document.querySelector("#about-section span:last-of-type")?.textContent.replace("Show less", "").replace(/(\r\n|\n|\r)/gm, " ").trim() || document.querySelector("#about-section p")?.textContent.replace("Show less", "").replace(/(\r\n|\n|\r)/gm, " ").trim() || ''

	}

	if (isRegularProfile()) {
		name = document.querySelector(".text-heading-xlarge")?.innerText?.replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '').trim().split(' ')[0] || ''
		headline = document.querySelector(".text-body-medium")?.innerText || ''
		about = document.querySelector(".display-flex.pv3 span")?.textContent.replace(/(\r\n|\n|\r)/gm, " ").trim() || ''
	}

	// convert about string to alphanumerical string
	about = about.replace(/[^a-zA-Z0-9 ]/g, "")

	return {
		name,
		headline,
		about
	}
}

//function to get last span in #about section
function getLastSpan() {
	let spans = document.querySelectorAll("#about span")
	let lastSpan = spans[spans.length - 1]
	return lastSpan
}

//function that returns response promise from openai api
async function getResponse(recipientData) {

	return new Promise(async function (resolve, reject) {
		//get json response from firebase function and handle errors

		payload = {
			'action': 'generateMessage',
			'recipientFirstName': recipientData.recipientFirstName,
			'recipientLastName': recipientData.recipientLastName,
			'recipientHeadline': recipientData.recipientHeadline,
			'recipientProfile': recipientData.recipientProfile,
			"selectedMode": recipientData.selectedMode || null,
			'startPhrase': recipientData.startPhrase,
		}
		let response;
		response = await sendMessagePromise(payload)
		if (response.status === "ok") {
			resolve(response.message)
			return;
		}
		//if error is an object unpacking error message
		if (typeof response === 'object') {
			reject(Error(response.message))
			return;
		}		
		reject(Error(response));
	});
}

function sendMessagePromise(item) {
	return new Promise((resolve, reject) => {
		chrome.runtime.sendMessage(item, response => {
			if (response) {
				resolve(response);
			} else {
				reject('Something wrong');
			}
		});
	});
}

//function for typing out the message
function typeWriter(element, text) {
	var i = 0;
	var txt = text;
	var currentText = '';
	element.innerText = '';
	var speed = 4;
	function type() {
		if (i < txt.length) {
			currentText += txt.charAt(i)
			element.innerHTML = currentText;
			i++;
			setTimeout(type, speed);
		}
	}
	type();
}

function isRegularProfile() {
	if (currentPage.includes("linkedin.com/in/")) {
		return true
	} else {
		return false
	}
}

function isSalesNavigatorProfile() {
	if (currentPage.includes("linkedin.com/sales/")) {
		return true
	} else {
		return false
	}
}

function waitForElm(selector) {
	return new Promise(resolve => {
		if (document.querySelector(selector)) {
			return resolve(document.querySelector(selector));
		}

		const observer = new MutationObserver(mutations => {
			if (document.querySelector(selector)) {
				resolve(document.querySelector(selector));
				observer.disconnect();
			}
		});

		observer.observe(document.body, {
			childList: true,
			subtree: true
		});

		activeObservers.push(observer);
	});
}

//function to run an action everytime .msg-form__send-button is added to the DOM
function runOnElementChange(targetNode, config, callback) {
	const observer = new MutationObserver(mutationsList => {
		for (let mutation of mutationsList) {
			if (mutation.type === 'childList') {
				callback();
			}
		}
	});
	observer.observe(targetNode, config);
}
