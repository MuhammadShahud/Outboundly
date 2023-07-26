import { firestore } from "firebase-admin";
import { getOpenAI } from "./openai";
import { phraseStarter } from "./phrase-starters";
import { regularCase } from "./support";

export type MessageMode = "general" | "template" | "trained";

export type MessageType = "message" | "connect";

export class MessageHandler {
	static async handleMessage(
		selectedMode: string,
		startPhrase: string,
		messageOptions: { [key: string]: string },
		recipentData: { [key: string]: string },
		userData: firestore.DocumentData,
	): Promise<string> {
		switch (selectedMode.split("-")[0]) {
			case "general":
				return this.handleGeneral(selectedMode, startPhrase, messageOptions, recipentData, userData);
			case "template":
				return this.handleTemplate(selectedMode, startPhrase, messageOptions, recipentData, userData);
			case "connect":
				return this.handleConnect(selectedMode, messageOptions, recipentData, userData);
			default: return "undefined";
		}
	}

	private static async handleGeneral(selectedMode: string, startPhrase: string, messageOptions: { [key: string]: any }, recipentData: { [key: string]: string }, userData: firestore.DocumentData): Promise<string> {
		const selectedType = selectedMode.split("-")[1];
		const userId = userData["userId"];
		const partnerId = userData["partnerId"] || "";
		const messageTone = userData && userData["messageTone"] && userData["messageTone"]["code"] || "mirror";
		const messageLength = userData && userData["messageLength"] && userData["messageLength"]["code"] || "normal";
		const recipientFirstName = recipentData["recipientFirstName"] || "";
		const recipientLastName = recipentData["recipientLastName"] || "";
		const recipientHeadline = recipentData["recipientHeadline"] || "";
		let recipientInfo = recipentData["recipientProfile"] || "";
		const recipientChallenges = messageOptions["messageSettings"]["challenges"] || "";
		const senderFirstName = userData["firstName"] || "";
		const senderLastName = userData["lastName"] || "";

		// const senderBusinessName = userData["businessName"] || "";

		// custom
		const personalizationInstructions = messageOptions["messageSettings"]["instructions"] || "";

		// recruiter
		const offerJobTitle = messageOptions["messageSettings"]["jobTitle"] || "";
		const offeringCompany = messageOptions["messageSettings"]["company"] || "";
		const jobDescription = messageOptions["messageSettings"]["description"] || "";
		// pitch
		const offerName = messageOptions["messageSettings"]["offerName"] || "";
		const offerCategory = messageOptions["messageSettings"]["offerCategory"] || "";
		const offerDescription = messageOptions["messageSettings"]["description"] || "";
		const offerBenefits = messageOptions["messageSettings"]["benefits"] || "";
		const offerType = messageOptions["messageSettings"]["offerType"] || "";
		// other
		const callToAction = messageOptions["messageSettings"]["callToAction"] || "";
		const reasonForSenderMessaging = messageOptions["messageSettings"]["reason"] || "";
		const questionToAsk = messageOptions["messageSettings"]["questionToAsk"] || "";
		const topicOfConversation = messageOptions["messageSettings"]["solution"] || "";
		let instructions = "";

		recipientInfo = `${recipientInfo}\n${recipientHeadline}`;

		// create an object from all the constants
		const messageTemplateData = {
			recipientChallenges,
			offerJobTitle,
			offeringCompany,
			jobDescription,
			offerName,
			offerType,
			offerCategory,
			offerDescription,
			offerBenefits,
			callToAction,
			topicOfConversation,
			reasonForSenderMessaging,
		};

		// loop through the object and form one string with all the values
		let messageTemplate = "";
		// const waysToPersonalizeMessage: string[] = [];
		let personalizeMsg = "";

		for (const key in messageTemplateData) {
			// check if property key is there and value not empty
			if (Object.prototype.hasOwnProperty.call(messageTemplateData, key) && messageTemplateData[key as keyof object] !== "") {
				const value = messageTemplateData[key as keyof object];
				messageTemplate += regularCase(key) + ": " + value + "\n\n";
			}
		}

		let suggestedOpener = await getOpenAI(`${recipientFirstName}'s Profile: ${recipientInfo}\n\nMessage Template: ${messageTemplate}\n\nInstructions: Based on ${recipientFirstName}'s profile, write how ${recipientFirstName}'s profile relates to the message template. Don't overdo it. 4 sentences max.`, userId, partnerId, "gpt-3.5-turbo", 0.7, 1000);

		suggestedOpener = suggestedOpener.replace(/As an AI assistant, /g, "");

		// console.log(suggestedOpener);

		personalizeMsg = "Don't make up things about yourself. Write the entire message so it flows and segues smoothly. Keep personalization thoughout the message. Use casual conversational laid back language but not unprofessional. Be as relatable as possbile.";

		/* if (selectedType === "pitch" || selectedType === "basic") {
			messageTemplate = messageTemplate + "________________\n\n";

			waysToPersonalizeMessage = parseList((await getOpenAI(`${recipientFirstName}'s Profile: ${recipientInfo}\n\nMessage Template: ${messageTemplate}\n\nInstructions: Briefly list specific ways I can make my *message template* relevant to ${recipientFirstName}'s profile. prioritize things in their personal life. Write a numbered list up to 5`, userId, partnerId, "gpt-3.5-turbo", 1, 1000)));

			personalizeMsg = "Start with building rapport. Don't overdo it. Don't make up things about yourself. Write the entire message so it flows and segues smoothly. Keep personalization thoughout the message. Use casual conversational laid back language but not unprofessional.";
		} */

		// const { personality, personalLife } = parseLists((await getOpenAI(`${recipientFirstName}'s Profile: ${recipientInfo}\n\nWrite a numbered list of things you can infer about ${recipientFirstName}'s personality (include the reasoning) then write a numbered list of general inferences about personal life (include the reasoning) that may extend to ${recipientFirstName}'s personal life.`, userId, partnerId, "gpt-3.5-turbo", 0.7, 1000)));
		// convert recipientPersonality and recipientPersonalLife to from array to string where each item is on a new line
		// const recipientPersonality = personality.join("\n");
		// const recipientPersonalLife = personalLife.join("\n");

		// check if message type is connect or message and switch instructions accordingly
		switch (selectedType) {
			case "pitch":
				instructions = `Write a brief personalized cold message from ${senderFirstName} to ${recipientFirstName}. ${personalizeMsg}. Keep it brief.\n\n`;
				break;
			case "basic":
				instructions = `Write a brief personalized cold message from ${senderFirstName} to ${recipientFirstName}. ${personalizeMsg}. Keep it brief.\n\n`;
				break;
			case "custom":
				instructions = `Write a brief personalized cold message in very ${messageTone} tone from ${senderFirstName} to ${recipientFirstName}. First ${personalizationInstructions}.\n`;
				break;
			case "starter":
				instructions = `Write 3 very personalized mid length conversation starters to ${recipientFirstName} from ${senderFirstName}. Write about ${topicOfConversation} in a way that speaks to ${recipientFirstName}. ${personalizeMsg} End each of the 3 conversation starter with the question, ${questionToAsk}.\n1.`;
				break;
			case "recruiter":
				instructions = `Write a brief personalized recruiter message from ${senderFirstName} to ${recipientFirstName}. First build rapport by relating to ${recipientFirstName}. Then include a comment about showing that you have teken the time to research their profile. Speak to the candidates personality, interests, and career goals. Introduce yourself, the open job title and the company it's for, and then opportunity. Then end the message with the call to action.\n`;
				break;
		}

		// create an object from all the constants
		const messageData = {
			recipientFirstName,
			recipientLastName,
			// recipientHeadline,
			recipientInfo,
			recipientChallenges,
			// recipientPersonality,
			// recipientPersonalLife,
			senderFirstName,
			senderLastName,
			// senderBusinessName,
			offerJobTitle,
			offeringCompany,
			jobDescription,
			offerName,
			offerType,
			offerCategory,
			offerDescription,
			offerBenefits,
			callToAction,
			topicOfConversation,
			reasonForSenderMessaging,
			suggestedOpener,
			// waysToPersonalizeMessage,
			instructions,
		};

		// loop through the object and form one string with all the values
		let prompt = "";
		for (const key in messageData) {
			// check if property key is there and value not empty
			if (Object.prototype.hasOwnProperty.call(messageData, key) && messageData[key as keyof object] !== "") {
				const value = messageData[key as keyof object];
				prompt += regularCase(key) + ": " + value + "\n\n";
			}
		}

		// add start phrase to prompt
		if (selectedType !== "starter") {
			prompt = `${prompt}message:${startPhrase}`;
		}

		console.log(prompt);
		const randomPhrase = phraseStarter[Math.floor(Math.random() * phraseStarter.length)];
		let message = await (await getOpenAI(prompt, userId, partnerId, "gpt-3.5-turbo", 0.6)).trim();

		// check if mirror message tone is selected
		// let profileTone = ""
		/* if (messageTone === "mirror") {
			// get profile tone
			profileTone = await getOpenAI(`${recipientFirstName}'s Profile: ${recipientInfo}\n\nDescribe the tone of the profile in 3 words or less`, userId, partnerId, "gpt-3.5-turbo", 0.7, 1000);
		} */

		switch (messageTone) {
			case "neutral":
				prompt = `${message}\n\nWrite as a unique message in very personable tone. First greet then start the message with ${randomPhrase}. The message is from ${senderFirstName} to ${recipientFirstName}. Format the message for LinkedIn cold outreach, don't use emojis.\n\n`;
				break;
			case "mirror":
				prompt = `${recipientFirstName}'s Profile: ${recipientInfo}\n\n--------\n\nMessage:${message}\n\nInstructions:Write message using the same tone and writing style as ${recipientFirstName}'s profile. The message is from ${senderFirstName} to ${recipientFirstName}. Format the message for LinkedIn cold outreach, don't use emojis.\n\n`;
				break;
			default:
				prompt = `${message}\n\nWrite as a ${messageTone} toned message. The message is from ${senderFirstName} to ${recipientFirstName}. Format the message for LinkedIn cold outreach, don't use emojis.\n\n`;
				break;
		}

		// console.log(prompt);

		// Apply tone to starter

		if (selectedType === "starter") {
			let starterTone = messageTone;
			if (starterTone === "mirror") {
				starterTone = "personable";
			}
			message = "1. " + message.trim();
			prompt = `${message}\n\nWrite these 3 messages using a ${starterTone} tone. Keep all the key points. End each message with the question, ${questionToAsk} The message is from ${senderFirstName} to ${recipientFirstName}. Format the message for LinkedIn cold outreach, don't use emojis.\n\n`;
		}

		// Apply tone to message (cutom doesn't apply tones)

		if (selectedType !== "custom") {
			message = await (await getOpenAI(prompt, userId, partnerId, "gpt-3.5-turbo", 0.6, 1000, 1)).trim();
		}

		// Apply length to message

		if (messageLength === "brief" && selectedType !== "starter" && selectedType !== "custom") {
			prompt = `${message}\n\nWrite the above message to be a good length for Linkedin. Keep all the key points. Don't be too brief. Each paragraph can be up to 4 sentences. The message is from ${senderFirstName} to ${recipientFirstName}\n\n`;
			message = await (await getOpenAI(prompt, userId, partnerId, "gpt-3.5-turbo", 0.6, 1000)).trim();
		}
		// console.log(message);

		return new Promise<string>((resolve, reject) => {
			resolve(message);
		});
	}

	private static async handleTemplate(selectedMode: string, startPhrase: string, messageOptions: { [key: string]: any }, recipentData: { [key: string]: string }, userData: firestore.DocumentData): Promise<string> {
		const userId = userData["userId"];
		const partnerId = userData["partnerId"] || "";
		const messageTone = userData && userData["messageTone"] && userData["messageTone"]["code"] || "neutral";
		const messageLength = userData && userData["messageLength"] && userData["messageLength"]["code"] || "normal";
		const recipientFirstName = recipentData["recipientFirstName"] || "";
		const recipientLastName = recipentData["recipientLastName"] || "";
		const recipientHeadline = recipentData["recipientHeadline"] || "";
		let recipientInfo = recipentData["recipientProfile"] || "";
		recipientInfo = recipientInfo + `\n${recipientHeadline}`;
		const senderFirstName = userData["firstName"] || "";
		const senderLastName = userData["lastName"] || "";
		// const messageTone = userData && userData["messageTone"] && userData["messageTone"]["code"] || "neutral";
		// const messageLength = userData && userData["messageLength"] && userData["messageLength"]["code"] || "normal";

		const senderBusinessName = userData["businessName"] || "";
		let messageTemplate = messageOptions["messageSettings"]["template"] || "";

		// dynamically replace the template variables with the data
		messageTemplate = messageTemplate.replace(/{{firstname}}/g, recipientFirstName);
		messageTemplate = messageTemplate.replace(/{{lastname}}/g, recipientLastName);

		// const { personality, personalLife } = parseLists((await getOpenAI(`${recipientFirstName}'s Profile: ${recipientInfo}\n\nList things you can infer about ${recipientFirstName} personality then list general inferences about hobbies or day to day activities that may extend to Alvin's personal life.`, userId, partnerId, "gpt-3.5-turbo", 0.5, 1000)));
		// const { personality, personalLife } = parseLists((await getOpenAI(`${recipientFirstName}'s Profile: ${recipientInfo}\n\nInstructions: 1. Write a brief numbered list of things you can infer about ${recipientFirstName}'s personality and the reasoning. 2. write another brief numbered list of general inferences about that may extend to ${recipientFirstName}'s personal life and the reasoning.`, userId, partnerId, "gpt-3.5-turbo", 0.7, 1000)));
		// convert recipientPersonality and recipientPersonalLife to from array to string where each item is on a new line
		// const recipientPersonality = personality.join("\n");
		// const recipientPersonalLife = personalLife.join("\n");

		// const waysToPersonalizeMessage = parseList((await getOpenAI(`${recipientFirstName}'s Profile: ${recipientInfo}\n\nMessage Template: ${messageTemplate}\n\nInstructions: List specific ways I can make the *message template* relevant to ${recipientFirstName}'s profile. Write a numbered list of the up to 5 ways, short descriptions only.`, userId, partnerId, "gpt-3.5-turbo", 1, 1000)));
		let waysToPersonalizeMessage = await getOpenAI(`${recipientFirstName}'s Profile: ${recipientInfo}\n\nMessage Template: ${messageTemplate}\n\nInstructions: Based on ${recipientFirstName}'s profile, write an example of a crafty remark about what you read in their profile to start the message to ${recipientFirstName}. Don't overdo it. 4 sentences max.`, userId, partnerId, "gpt-3.5-turbo", 0.7, 1000);
		waysToPersonalizeMessage = waysToPersonalizeMessage.replace(/As an AI assistant, /g, "");


		// choose a random phrase from the starter phrases array
		const randomPhrase = phraseStarter[Math.floor(Math.random() * phraseStarter.length)];

		// if message template contains a link, add instructions to the message
		let linkInstructions = "";
		const urlRegex = /(ftp|http|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:/~+#-]*[\w@?^=%&amp;/~+#-])?/;

		if (urlRegex.test(messageTemplate)) {
			linkInstructions = "Include any links in the *message template*.";
		}

		const instructions = `Personalize the *message template* as a personalized message from ${senderFirstName} to ${recipientFirstName}. Mention somthing from the suggested ways to personalize. Start with building rapport. Don't overdo it. Don't make up things about yourself. Write the entire message so it flows and segues smoothly. write it in ${messageTone} tone. Retain all the key points from the *message template*. ${linkInstructions} Use casual conversational laid back language but not unprofessional. It is important to write it consise.\n\nMessage:Hi ${recipientFirstName},\n\n${randomPhrase}`;

		// create an object from all the constants
		const messageData = {
			recipientFirstName,
			recipientLastName,
			// recipientHeadline,
			recipientInfo,
			// recipientPersonality,
			// recipientPersonalLife,
			// recipientChallenges,
			waysToPersonalizeMessage,
			senderFirstName,
			senderLastName,
			senderBusinessName,
			messageTemplate,
			// aboutRecipient,
		};

		// loop through the object and form one string with all the values
		let prompt = "";
		for (const key in messageData) {
			// check if property key is there and value not empty
			if (Object.prototype.hasOwnProperty.call(messageData, key) && messageData[key as keyof object] !== "") {
				const value = messageData[key as keyof object];
				prompt += regularCase(key) + ": ";

				if (Array.isArray(value)) {
					prompt += (value as string[]).join("\n");
				} else {
					prompt += value;
				}

				prompt += "\n";
			}
		}

		// add start phrase to prompt
		prompt = prompt + instructions;
		console.log(prompt);

		const opener = await getOpenAI(prompt, userId, partnerId, "gpt-3.5-turbo", 0.7);

		// append hi recipientFirstName to the start of the opener
		let message = `Hi ${recipientFirstName},\n\n${randomPhrase} ${opener}`;

		if (messageLength === "brief") {
			prompt = `${message}\n\nWrite the above message to be a good length and formated for Linkedin. Keep all the key points and links.The message is from ${senderFirstName} to ${recipientFirstName}\n\n`;
			message = await (await getOpenAI(prompt, userId, partnerId, "gpt-3.5-turbo", 0.5, 1000)).trim();
		}
		return new Promise<string>((resolve, reject) => {
			resolve(message);
		});
	}

	private static async handleConnect(selectedMode: string, messageOptions: { [key: string]: any }, recipentData: { [key: string]: string }, userData: firestore.DocumentData): Promise<string> {
		const userId = userData["userId"];
		const partnerId = userData["partnerId"] || "";
		const recipientFirstName = recipentData["recipientFirstName"] || "";
		// const recipientLastName = recipentData["recipientLastName"] || "";
		const recipientHeadline = recipentData["recipientHeadline"] || "";
		let recipientProfile = recipentData["recipientProfile"] || "";
		recipientProfile = recipientProfile + `\n${recipientHeadline}`;
		// const senderFirstName = userData["firstName"] || "";
		// const senderLastName = userData["lastName"] || "";

		const personalization = messageOptions["messageSettings"]["personalization"] || "";
		const reasonForRequest = messageOptions["messageSettings"]["reason"] || "";

		const messageTone = userData && userData["messageTone"] && userData["messageTone"]["code"] || "neutral";

		// summarize the profile
		recipientProfile = await getOpenAI(`${recipientFirstName}'s Profile: ${recipientProfile}\n${recipientHeadline}\n\nGive a detailed summary of ${recipientFirstName}'s profile`, userId, partnerId, "gpt-3.5-turbo", 0.6, 1000);

		// switch personalization based on the personalization option
		let personalizationText = "";
		switch (personalization) {
			case "general":
				personalizationText = "something about profile";
				break;
			case "achievement":
				personalizationText = "something about their achievements";
				break;
			case "job-industry":
				personalizationText = "something about their job or industry";
				break;
			case "shared-interest":
				personalizationText = "that you have shared interest";
				break;
			case "share-goals":
				personalizationText = "that you share goals";
				break;
			case "expand-network":
				personalizationText = "that you want to expand your network";
				break;
			default:
				personalizationText = "something about profile";
				break;
		}

		const instructions = `Write a LinkedIn connection request under 300 characters to ${recipientFirstName}. First mention *${personalizationText}* about ${recipientFirstName}, then mention your reason for requesting a connection.\n`;

		// create an object from all the constants
		const messageData = {
			recipientFirstName,
			// recipientLastName,
			recipientProfile,
			// recipientHeadline,
			// recipientProfile,
			// recipientChallenges,
			// senderFirstName,
			// senderLastName,
			reasonForRequest,
			// senderBusinessName,
			// template,
			instructions,
		};

		// loop through the object and form one string with all the values
		let prompt = "";
		for (const key in messageData) {
			// check if property key is there and value not empty
			if (Object.prototype.hasOwnProperty.call(messageData, key) && messageData[key as keyof object] !== "") {
				const value = messageData[key as keyof object];
				prompt += regularCase(key) + ": " + value + "\n";
			}
		}

		// add start phrase to prompt
		// prompt = prompt + instructions;

		const message = await (await getOpenAI(prompt, userId, partnerId, "gpt-3.5-turbo", 0.5, 59, 0)).trim();
		prompt = `${message}\n rewrite this message to be less wordy, and ${messageTone}`;
		const messageFinal = await (await getOpenAI(prompt, userId, partnerId, "gpt-3.5-turbo", 0.5, 59, 0)).trim();
		// const messageFinal = await (await getOpenAI(`${message}\n rewrite this message to be less wordy, and ${messageTone}`, userId, partnerId, "gpt-3.5-turbo",  0.5, 100, 0)).trim();
		// console.log(prompt);

		return new Promise<string>((resolve, reject) => {
			resolve(messageFinal);
		});
	}
}
