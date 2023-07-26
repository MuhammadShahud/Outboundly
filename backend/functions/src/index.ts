import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as randomstring from "randomstring";
import { MessageHandler } from "./messages";
import { getOpenAI } from "./openai";


import * as cors from "cors";
const corsHandler = cors({ origin: true });

// Init Firebase
admin.initializeApp({
	credential: admin.credential.applicationDefault(),
});

// ------------------ GENERATE MESSAGE --------------//
// -------------------------------------------------//
export const generateMessage = functions.https.onRequest(async (req, res) => {
	corsHandler(req, res, async () => {
		try {
			// console.log(req.body);

			// validate request parameters
			if (!req.body.recipientData || !req.body.userId) {
				throw new Error("missing parameters");
			}

			const startPhrase = req.body.startPhrase;
			const userId = req.body.userId;
			const recipientData = req.body.recipientData;

			// Get user data (fix this security hole later)
			const user = await admin.firestore().collection("users").doc(userId).get();
			const userData = user.data()!;
			const selectedMode = recipientData.selectedMode || userData.selectedMode;
			const selectedModeId = userData[selectedMode];
			// Get user credits and if they have enough
			const userCredits = userData!.credits;

			if (userCredits < 1) {
				throw Error("You don't have enough credits to send a message");
			}

			// Get user message settings from database
			const userMessageSettings = await admin.firestore().collection("users").doc(userId).collection("message-settings").doc(selectedModeId).get();

			const messageOptions = userMessageSettings.data()!;


			// console.log("messageOptions", messageOptions);

			// Check message mode and send to appropriate handler
			const message = await MessageHandler.handleMessage(selectedMode, startPhrase, messageOptions, recipientData, userData);

			// Subtract 1 credit from user
			await admin.firestore().collection("users").doc(userId).update({ credits: userCredits - 1 });

			// Send message back to client as json
			const response = {
				"message": message,
				"status": "ok",
				"creditBalance": userCredits,
			};

			res.status(200).send(JSON.stringify(response));
		} catch (e: any) {
			console.error(e);
			res.status(400).send(JSON.stringify({ status: "error", message: "internal error" }));
		}
	});
});

// ---------------- Analyze Profile --------------//
// -------------------------------------------------//
export const getAnalysis = functions.https.onRequest(async (req, res) => {
	corsHandler(req, res, async () => {
		try {
			// console.log(req.body);

			// validate request parameters
			if (!req.body.profileInfo || !req.body.businessDetails) {
				throw new Error("missing parameters");
			}

			const userId = req.body.userId;
			const name = req.body.profileInfo.name;
			const headline = req.body.profileInfo.headline;
			const about = req.body.profileInfo.about.substring(0, 700);
			const businessDetails = req.body.businessDetails;

			// Get user document reference
			const userCollection = admin.firestore().collection("users");
			const userRef = await userCollection.doc(userId);
			const user = await userRef.get();
			const userData = user.data()!;
			const partnerId = userData.partnerId;

			// Get user credits and if they have enough
			const userCredits = userData!.credits;

			if (userCredits < 3) {
				throw Error("You don't have enough credits to send a message");
			}

			let summary = "1." + await getOpenAI(`${name}'s Profile: ${about}\n${headline}\n\nWhat are the 5 most interesting things about ${name}'s profile?\n1.`, userId, partnerId, "gpt-3.5-turbo", 0.6, 1000);
			let services = "1." + await getOpenAI(`${name}'s Profile: ${about}\n${headline}\n\nList 5 pain points ${name}'s might have in her day to day\n1.`, userId, partnerId, "gpt-3.5-turbo");
			let questions = "1." + await getOpenAI(`${name}'s Profile: ${about}\n${headline}\n\nBased on ${name}'s profile, list 10 questions a person could ask ${name} to build rapport?\n1.`, userId, partnerId, "gpt-3.5-turbo", 0.8, 1000);
			let approach = "1." + await getOpenAI(`${name}'s Profile: ${about}\n${headline}\n\nWrite 5 one liners I can use to sell ${businessDetails} to ${name} -- based on their profile\n1.`, userId, partnerId, "gpt-3.5-turbo", 0.8, 1000);

			// take the summary,services,questions,approach and add a new line after each new line

			summary = summary.replace(/\n/g, "\n\n");
			services = services.replace(/\n/g, "\n\n");
			questions = questions.replace(/\n/g, "\n\n");
			approach = approach.replace(/\n/g, "\n\n");

			// Subtract 3 credit from user
			await userRef.update({ credits: userCredits - 3 });
			const updatedUser = await (await userRef.get()).data()!;
			// Send message back to client as json
			const response = {
				"status": "ok",
				"services": services,
				"summary": summary,
				"questions": questions,
				"user": updatedUser,
				"approach": approach,
			};

			// console.log(response);

			res.status(200).send(JSON.stringify(response));
		} catch (e: any) {
			res.status(400).send(JSON.stringify({ status: "error", message: "unknown error" }));
			console.log(e);
		}
	});
});

// ------------------ LOG MESSAGE ------------------//
// ------------------------------------------------//
export const logMessage = functions.https.onRequest(async (req, res) => {
	try {
		const message = req.body.message;
		const userId = req.body.userId;
		const messageType = req.body.messageType;
		const messageMode = req.body.messageMode;


		// get user message settings from database
		const userMessageSettings = await admin.firestore().collection("users").doc(userId).collection("message-settings").doc(messageMode).get();

		const messageOptions = userMessageSettings.data()![messageType];

		// save message to user's messages
		await admin.firestore().collection("messages").add({
			userId: userId,
			message: message,
			type: messageType,
			mode: messageMode,
			options: messageOptions,
			createdAt: admin.firestore.FieldValue.serverTimestamp(),
		});

		res.send("success");
	} catch (e: any) {
		console.error(e);
		res.status(500).send(JSON.stringify({
			"status": "error",
			"errorMessage": "unknown error",
		}));

		throw new functions.https.HttpsError("internal", e.message, e.details);
	}
});


// ------------------ UPDATE MESSAGE SETTINGS ------------------//
// ------------------------------------------------------------//
export const updateMessageSettings = functions.https.onRequest(async (req, res) => {
	corsHandler(req, res, async () => {
		try {
			// console.log(req.body);

			const userCollection = admin.firestore().collection("users");
			let config;

			const userId = req.body.userId;
			const messageMode = req.body.messageMode;
			const messageSettings = req.body.messageSettings;
			const messageType = req.body.messageType;
			let id = req.body.id ?? "";
			const fieldName = `${messageMode}-${messageType}-settings`;


			// validate request parameters
			if (!userId || !messageMode || !messageSettings || !messageType) {
				throw new Error("missing parameters");
			}

			const messageData = {
				"userId": userId,
				"messageMode": messageMode,
				"messageType": messageType,
				"id": id,
				"messageSettings": messageSettings,
				"dateCreated": admin.firestore.FieldValue.serverTimestamp(),
			};

			// console.log("Template ID "+ JSON.stringify(id));
			// if template id is empty create new document in database, if not update it.
			if (id) {
				await userCollection.doc(userId).collection("message-settings").doc(id).set(messageData);
				config = await (await userCollection.doc(userId).collection("message-settings").doc(id).get()).data();

				await userCollection.doc(userId).update({ "selectedMode": fieldName });
				await userCollection.doc(userId).update({ [fieldName]: id });
			} else {
				const randomstr = randomstring.generate({
					length: 16,
					charset: "alphanumeric",
				});
				messageData.id = randomstr;

				await userCollection.doc(userId).collection("message-settings").doc(randomstr).set(messageData);
				config = await (await userCollection.doc(userId).collection("message-settings").doc(randomstr).get()).data();

				id = randomstr;
				// add template id to field name array document
				await userCollection.doc(userId).update({ "selectedMode": fieldName });
				// the current messagesettings for the selected mode
				await userCollection.doc(userId).update({ [fieldName]: id });
			}

			// Send message back to client as json
			const response = {
				"status": "ok",
				"config": config,
			};

			res.status(200).send(JSON.stringify(response));
		} catch (e: any) {
			console.error(e);
			throw new functions.https.HttpsError("internal", e.message, e.details);
		}
	});
});

// ------------------ SAVE PRESET SETTINGS ------------------//
// ------------------------------------------------------------//
export const savePreset = functions.https.onRequest(async (req, res) => {
	corsHandler(req, res, async () => {
		try {
			// console.log(req.body);

			const userCollection = admin.firestore().collection("users");

			const userId = req.body.userId;
			const messageMode = req.body.messageMode;
			const messageSettings = req.body.messageSettings;
			const messageType = req.body.messageType;
			const presetName = req.body.presetName ?? "";
			const id = req.body.id ?? "";
			const fieldName = `presets-${messageMode}-${messageType}`;
			// validate request parameters
			if (!userId || !messageMode || !messageSettings || !messageType) {
				throw new Error("missing parameters");
			}

			const messageData = {
				"userId": userId,
				"messageMode": messageMode,
				"messageType": messageType,
				"presetName": presetName,
				"id": id,
				"messageSettings": messageSettings,
				"dateCreated": admin.firestore.FieldValue.serverTimestamp(),
			};

			const randomstr = randomstring.generate({
				length: 16,
				charset: "alphanumeric",
			});

			// try to get preset by preset name. if no preset found throw error
			const preset = await userCollection.doc(userId).collection("presets").where("presetName", "==", presetName).where("messageType", "==", messageType).get();
			if (preset.empty) {
				// create preset document in database with preset name
				await userCollection.doc(userId).collection("presets").doc(randomstr).set(messageData);
				// let newpreset = await (await userCollection.doc(userId).collection("presets").doc(randomstr).get()).data();

				const presetInfo = {
					code: randomstr,
					name: presetName,
				};
				// add template id to field name array document
				// append template id to array
				await userCollection.doc(userId).set({ [fieldName]: admin.firestore.FieldValue.arrayUnion(presetInfo) }, { merge: true });
			} else {
				// update the found presets document
				await userCollection.doc(userId).collection("presets").doc(preset.docs[0].id).set(messageData);
			}

			const user = await (await userCollection.doc(userId).get()).data();

			// Send message back to client as json
			const response = {
				"status": "ok",
				"user": user,
			};
			// console.log(response);

			res.status(200).send(JSON.stringify(response));
		} catch (e: any) {
			console.error(e);
			throw new functions.https.HttpsError("internal", e.message, e.details);
		}
	});
});


// --------------- GET PRESET ------------//
// --------------------------------------//
export const getPreset = functions.https.onRequest(async (req, res) => {
	corsHandler(req, res, async () => {
		try {
			console.log(req.body);

			const userCollection = admin.firestore().collection("users");

			const userId = req.body.userId;
			const presetId = req.body.presetId;

			// validate request parameters
			if (!userId || !presetId) {
				throw new Error("missing parameters");
			}

			// try to get preset by preset name if no preset found throw error
			const dbresponse = await userCollection.doc(userId).collection("presets").doc(presetId).get();
			if (!dbresponse.exists) throw Error("no preset found");

			const preset = dbresponse.data();

			// Send message back to client as json
			const response = {
				"status": "ok",
				"preset": preset,
			};
			// console.log(response);

			res.status(200).send(JSON.stringify(response));
		} catch (e: any) {
			console.error(e);
			throw new functions.https.HttpsError("internal", e.message, e.details);
		}
	});
});

// ------------- DELETE PRESET -----------//
// --------------------------------------//
export const deletePreset = functions.https.onRequest(async (req, res) => {
	corsHandler(req, res, async () => {
		try {
			// console.log(req.body);

			const userCollection = admin.firestore().collection("users");

			const userId = req.body.userId;
			const presetId = req.body.presetId;

			// validate request parameters
			if (!userId || !presetId) {
				throw new Error("missing parameters");
			}

			// try to get preset by preset name if no preset found throw error
			const presetRef = await userCollection.doc(userId).collection("presets").doc(presetId);
			const presetData = (await presetRef.get()).data()!;
			if (!presetData.messageType) {
				throw Error("no preset found");
			}
			const messageType = presetData["messageType"];
			const messageMode = presetData["messageMode"];
			const keyName = `presets-${messageMode}-${messageType}`;

			// get user doc
			const userRef = await userCollection.doc(userId);
			const presetArray = (await userRef.get()).data()![keyName];
			let newArray = presetArray.filter((object: { code: any; }) => {
				return object.code !== presetId;
			});
			if (newArray === undefined) newArray = [];
			console.log(newArray);

			// update presets in user doc
			await userRef.update({ [keyName]: newArray });
			// delete from db
			await presetRef.delete();
			// get updated user data
			const user = await (await userCollection.doc(userId).get()).data();

			// Send message back to client as json
			const response = {
				"status": "ok",
				"user": user,
			};
			// console.log(response);
			res.status(200).send(JSON.stringify(response));
		} catch (e: any) {
			console.error(e);
			throw new functions.https.HttpsError("internal", e.message, e.details);
		}
	});
});


// ------------------ Start Subscription --------------------//
// ---------------------------------------------------------//
export const startSubscriptionWP = functions.https.onRequest(async (req, res) => {
	corsHandler(req, res, async () => {
		try {
			console.log(req.body);

			const userCollection = admin.firestore().collection("users");
			const userId = req.body.userId;
			const subscriptionLevel = req.body.subscriptionLevel;
			const businessName = req.body.businessName;
			const firstName = req.body.firstName;
			const lastName = req.body.lastName;
			const username = req.body.username;
			const credits = Number(req.body.credits);
			const email = req.body.email;
			const partnerId = req.body.partnerId;
			const role = req.body.role;
			const dateRegistered = admin.firestore.FieldValue.serverTimestamp();

			// create a new user
			const user = {
				userId: userId,
				subscriptionLevel: subscriptionLevel,
				businessName: businessName,
				firstName: firstName,
				lastName: lastName,
				username: username,
				credits: credits,
				email: email,
				dateRegistered: dateRegistered,
				partnerId: partnerId,
				role: role,
			};

			// check if user exists by email, if exis

			// add user to db
			await userCollection.doc(userId).set(user);

			// get user doc
			const userDoc = await userCollection.doc(userId).get();
			const userData = userDoc.data();

			// Send message back to wordpress as json
			const response = {
				"status": "ok",
				"user": userData,
			};
			res.status(200).send(JSON.stringify(response));
		} catch (e: any) {
			console.error(e);
			throw new functions.https.HttpsError("internal", e.message, e.details);
		}
	});
});


// ------------------  Renew Subscription  ------------------//
// ---------------------------------------------------------//
export const renewSubcriptionWP = functions.https.onRequest(async (req, res) => {
	corsHandler(req, res, async () => {
		try {
			console.log(req.body);

			const userCollection = admin.firestore().collection("users");
			const userId = String(req.body.userId);
			const credits = Number(req.body.credits);

			// create a new user
			const user = {
				userId: userId,
				credits: credits,
			};

			// update user document
			await userCollection.doc(userId).update(user);
			// Send message back to wordpress as json
			const response = {
				"status": "ok",
			};
			res.status(200).send(JSON.stringify(response));
		} catch (e: any) {
			console.error(e);
			throw new functions.https.HttpsError("internal", e.message, e.details);
		}
	});
});


// ------------------ UPDATE USER SETTINGS ------------------//
// ---------------------------------------------------------//
export const updateUserSettings = functions.https.onRequest(async (req, res) => {
	corsHandler(req, res, async () => {
		try {
			const userCollection = admin.firestore().collection("users");
			const userId = req.body.userId;
			const businessName = req.body.businessName;
			const firstName = req.body.firstName;
			const lastName = req.body.lastName;
			const messageTone = req.body.messageTone || "neutral";
			const messageLength = req.body.messageLength || "normal";

			// validate request parameters
			if (!userId || !firstName || !lastName || !businessName) {
				throw new Error("missing parameters");
			}

			const messageData = {
				"userId": userId,
				"businessName": businessName,
				"firstName": firstName,
				"lastName": lastName,
				"messageTone": messageTone,
				"messageLength": messageLength,
			};

			await userCollection.doc(userId).update(messageData);

			// get newly updated document
			const user = await (await userCollection.doc(userId).get()).data();
			console.log(user);

			// Send message back to client as json
			const response = {
				"status": "ok",
				"user": user,
			};

			res.status(200).send(JSON.stringify(response));
		} catch (e: any) {
			console.error(e);
			throw new functions.https.HttpsError("internal", e.message, e.details);
		}
	});
});


// ------------------ Get User -------------------//
// ----------------------------------------------//
export const getUser = functions.https.onRequest(async (req, res) => {
	corsHandler(req, res, async () => {
		try {
			// console.log(req.body);

			const userCollection = admin.firestore().collection("users");
			const email = req.body.email;
			const token = req.body.token;
			const lastLogin = admin.firestore.FieldValue.serverTimestamp();
			// validate request parameters
			if (!email || !token) {
				throw new Error("missing parameters");
			}

			const queryData = await userCollection.where("email", "==", email).get();

			// if queryData is has data set user data to first document in queryData
			if (queryData.size > 0) {
				let user = queryData.docs[0].data();

				// update user token
				await userCollection.doc(user.userId).update({ token: token, lastLogin: lastLogin });

				// get updated user document
				const updatedUser = await userCollection.doc(user.userId).get();

				user = updatedUser.data()!;

				// Send message back to client as json
				const response = {
					"status": "ok",
					"user": user,
				};
				res.status(200).send(JSON.stringify(response));
			} else {
				throw Error("no user found");
			}
		} catch (e: any) {
			console.error(e);
			throw new functions.https.HttpsError("internal", e.message, e.details);
		}
	});
});


// ------------------ Buy Credits -------------------//
// -------------------------------------------------//
export const buyCreditsWP = functions.https.onRequest(async (req, res) => {
	corsHandler(req, res, async () => {
		try {
			// console.log(req.body);

			// validate request parameters
			if (!req.body.credits || !req.body.userId) {
				throw new Error("missing parameters");
			}

			const userId = req.body.userId;
			const credits = Number(req.body.credits);

			const user = await admin.firestore().collection("users").doc(userId).get();
			const userData = user.data()!;
			const userCredits = userData!.credits;
			const newCredits = userCredits + credits;

			// Add credits to user
			await admin.firestore().collection("users").doc(userId).update({ credits: newCredits });

			// Send message back to client as json
			const response = {
				"status": "ok",
				"creditBalance": newCredits,
			};

			res.status(200).send(JSON.stringify(response));
		} catch (e: any) {
			console.error(e);
			res.status(400).send(JSON.stringify({ status: "error", message: e.message }));
		}
	});
});
