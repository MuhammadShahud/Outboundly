import { useAppState } from "@/snippets/system";
const fbEndpoint = process.env.VUE_APP_API_URL
const wpEndpoint =`https://${process.env.VUE_APP_DOMAIN}/wp-json`

export async function loginAccount(username, password) {
	const appState = useAppState()
	const url = `${wpEndpoint}/jwt-auth/v1/token`
	const requestData = {
		'username': username,
		'password': password
	}

	let response = await getResponse(url, requestData);

	if (response.token) {
		let user = await getUser(response.user_email, response.token);

		appState.setUserData(user);
		appState.setLoggedIn();
		return user;
	} else if (response.message) {
		return response.message
	} else {
		return "Unknown error.  Please try again later"
	}

}

export async function getUser(email, token) {
	const url = `${fbEndpoint}/getUser`
	//const appState = useAppState();

	const requestData = {
		'email': email,
		'token': token
	};

	let response = await getResponse(url, requestData);
	if (response.user) {
		return response.user;
		//appState.setUserData(response.user);
	} else {
		return "user not found"
	}
}

export async function validateToken(token) {
	const url = `${wpEndpoint}/jwt-auth/v1/token/validate`

	let response = await fetch(url, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"Authorization": `Bearer ${token}`
		},
		body: ""
	}).then(response => response.json())
		.then(data => {
			return data;
		})
		.catch(error => {
			console.log(error)
			return error;
		})

	return response;
}



export const updateMessageSettings = async (settings) => {

	const appState = useAppState()
	const url = `${fbEndpoint}/updateMessageSettings`

	const userId = appState.user.userId;

	const messageMode = settings.messageMode;
	const messageType = settings.messageType;
	const keyName = `${messageMode}-${messageType}`;
	let id;

	//try setting template id to current active template if there is one
	try {
		id = appState.activeConfigs[keyName].id || null;
	} catch (e) {
		id = null;
	}

	const requestData = {
		'id': id,
		'presetName': settings.presetName,
		'userId': userId,
		'messageMode': settings.messageMode,
		'messageType': settings.messageType,
		'messageSettings': settings.messageSettings,
	};

	let response = await getResponse(url, requestData);

	if (response.status === "ok") {
		let config = response.config
		//merge template into appstate messagesettings, replace duplicate values
		appState.syncMessageSettings(config);
		appState.setMode({
			'mode': keyName,
			'id': response.config.id
		});
		appState.activeConfigs[keyName] = config;
	} else {
		throw "error updating message settings"
	}

	return response;
}

export const savePresetSettings = async (settings) => {

	const appState = useAppState()
	const url = `${fbEndpoint}/savePreset`

	const userId = appState.user.userId;

	const messageMode = settings.messageMode;
	const messageType = settings.messageType;
	const keyName = `${messageMode}-${messageType}`;
	let id;

	//try setting template id to current active template if there is one
	try {
		id = appState.activeConfigs[keyName].id || null;
	} catch (e) {
		id = null;
	}

	const requestData = {
		'id': id,
		'presetName': settings.presetName,
		'userId': userId,
		'messageMode': settings.messageMode,
		'messageType': settings.messageType,
		'messageSettings': settings.messageSettings,
	};

	let response = await getResponse(url, requestData);

	if (response.status === "ok") {
		//console.log(response)
		//merge template into appstate messagesettings, replace duplicate values
		appState.setUserData(response.user)
	} else {
		throw "error updating message settings"
	}

	return response;
}

export async function getPreset(selectedPreset) {
	const url = `${fbEndpoint}/getPreset`
	const appState = useAppState()

	const requestData = {
		'userId': appState.user.userId,
		'presetId': selectedPreset.code
	};

	let response = await getResponse(url, requestData);
	//console.log(response)
	if (response.preset.messageSettings) {
		return response.preset;
		//appState.setUserData(response.user);
	} else {
		return "preset not found"
	}
}


export async function deletePreset(selectedPreset) {
	const url = `${fbEndpoint}/deletePreset`
	const appState = useAppState()

	const requestData = {
		'userId': appState.user.userId,
		'presetId': selectedPreset.code
	};

	let response = await getResponse(url, requestData);
	if (response.user) {
		appState.setUserData(response.user);
		return response;
	} else {
		return "preset not found"
	}
}



export const updateUserSettings = async (settings) => {
	const appState = useAppState()
	const url = `${fbEndpoint}/updateUserSettings`

	const userId = appState.user.userId;

	const requestData = {
		'businessName': settings.businessName,
		'firstName': settings.firstName,
		'lastName': settings.lastName,
		'userId': userId,
		'messageTone': settings.messageTone,
		'messageLength': settings.messageLength,
	};
	let response = await getResponse(url, requestData);

	if (response.status === "ok") {
		let user = response.user
				
		// save user settings to local storage
		appState.setUserData(user)
	}

	return response;
}

async function getResponse(endpoint, requestData) {

	let response = await fetch(endpoint, {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify(requestData)
	}).then(response => response.json())
		.then(data => {
			return data;
		})
		.catch(error => {
			console.log(error)
			return error;
		})

	return response;
}

export function sendMessagePromise(item) {
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

export async function getAnalysis(profileInfo, businessDetails) {
	const url = `${fbEndpoint}/getAnalysis`
	const appState = useAppState();

	const requestData = {
		'userId': appState.user.userId,
		'profileInfo': profileInfo,
		'businessDetails': businessDetails
	};

	let response = await getResponse(url, requestData);
	if (response.status === "ok") {
		return response;
		//appState.setUserData(response.user);
	} else {
		return "analysis error"
	}
}
