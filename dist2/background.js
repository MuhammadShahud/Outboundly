const fbEndpoint = "https://us-central1-outboundlyappai.cloudfunctions.net"
//const fbEndpoint = "http://127.0.0.1:5001/outboundlyappai/us-central1"
//onboarding
chrome.runtime.onInstalled.addListener(r => {
	if (r.reason == 'install') {
		chrome.tabs.create({
			url: 'onboarding.html'
		});
	}
});

//listen to page changes and inject proper script
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
		if (changeInfo.status == 'complete' && tab.status == 'complete') {
			if (tab.url.includes("linkedin.com/sales/") || tab.url.includes("linkedin.com/in/") ) {	

				injectIfNotAsync(tabId) 
				console.log('tab updated');
				
			}
		}
});

//listen to messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {		

	if (request.action === "generateMessage") {
		generateMessage(request, sendResponse);
		return true;
	}
	generateMessage(request, sendResponse);

	return true;
		
});

function generateMessage(request, sendResponse) {
	const { startPhrase, recipientFirstName, recipientLastName, recipientHeadline, recipientProfile, selectedMode } = request;

	console.log(selectedMode, "selectedMode");

	getStorageData()
		.then((data) => {
			const user = data.user;
			console.log("the user is ", user);
			if (!user) {
				sendResponse("no user found");
				return;
			}
			const userId = user.userId;

			fetch(`${fbEndpoint}/generateMessage`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					'userId': userId,
					'startPhrase': startPhrase,
					'recipientData': {
						'recipientFirstName': recipientFirstName,
						'recipientLastName': recipientLastName,
						'recipientHeadline': recipientHeadline,
						'recipientProfile': recipientProfile,
						'selectedMode': selectedMode				}
				})
			})
				.then(response => response.json())
				.then(data => {
					if (data.status === "ok") {
						sendResponse(data);
					} else {
						sendResponse(data);
						throw data;
					}
					return;
				})
				.catch((error) => {
					console.error('Error:', error);
					return;
				});
		});
}

//a function for that gets teh data stored in sync storage and returns a promise
function getStorageData() {
	return new Promise((resolve, reject) => {
		chrome.storage.sync.get(function (result) {
			if (result) {
				resolve(result);			
			} else {
				reject("no data found");
			}			
		});			
	});
}

async function injectIfNotAsync(tabId) {
	let injected = false;
	try {
		injected = await new Promise((r, rej) => {
			chrome.tabs.sendMessage(tabId, { op: "confirm" }, (res) => {
				const err = chrome.runtime.lastError;
				if (err) {
					rej(err);
				}

				r(res);
			});
		});
	} catch {
		injected = false;
	}
	if (injected) { return tabId; }

	await chrome.scripting.executeScript({
		target: {
			tabId
		},
		files: ["content-linkedin.js"]
	});
	console.log('content-linkedin.js injected');
	return tabId;
}