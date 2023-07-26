import { Configuration, OpenAIApi } from "openai";
import { partnerConfig } from "./partners";

// iupressive, impressed, noticed, inspiring,stumbled, hope, profile
const logitBias = {
	8036: -10,
	12617: -10,
	31696: -10,
	42138: -10,
	4003: -10,
	6810: -10,
	20886: -10,
	24241: -10,
	2911: -10,
	13317: -10,
};


export async function getOpenAI(prompt: string, userid: string, partnerId: string, model = "text-davinci-003", temperature = 0.8, tokens = 2048, presencePenalty = 0) {
	// Init Open AI
	const partner = partnerConfig[partnerId] || partnerConfig.outboundly;

	const configuration = new Configuration({
		organization: partner.organization,
		apiKey: partner.apiKey,
	});

	const openai = new OpenAIApi(configuration);

	if (model == "gpt-3.5-turbo") {
		const openAiChatResponse = await openai.createChatCompletion({
			model: "gpt-3.5-turbo",
			messages: [{ "role": "system", "content": prompt }],
			temperature: temperature,
			max_tokens: tokens,
			top_p: 1,
			frequency_penalty: 0.5,
			presence_penalty: presencePenalty,
			user: userid,
			logit_bias: logitBias,
		});
		// console.log(openAiChatResponse.data.usage?.total_tokens)
		return openAiChatResponse.data.choices[0].message!.content!;
	}


	// Use regular gpt3 if chat model isn't choosen
	const openAiHashtagResponse = await openai.createCompletion({
		model: model,
		prompt: prompt,
		temperature: temperature,
		max_tokens: tokens,
		top_p: 1,
		frequency_penalty: 0,
		presence_penalty: presencePenalty,
		user: userid,
		logit_bias: logitBias,
	});

	// console.log(openAiHashtagResponse.data.usage?.total_tokens)
	return openAiHashtagResponse.data.choices[0].text!;
}
