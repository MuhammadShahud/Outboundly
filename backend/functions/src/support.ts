// function to convert camel case to regular text
export function regularCase(camel: string): string {
	const result = camel.replace(/([A-Z])/g, " $1");
	const finalResult = result.charAt(0).toUpperCase() + result.slice(1);
	return finalResult;
}

export function parseLists(text: string) {
	const regex = /(?:\d\. [^\n]+)/g;
	const matches = text.match(regex);

	let personality: string[] = [];
	let personalLife: string[] = [];

	if (matches) {
		let separatorIndex = -1;

		for (let i = 0; i < matches.length - 1; i++) {
			if (parseInt(matches[i].charAt(0)) > parseInt(matches[i + 1].charAt(0))) {
				separatorIndex = i;
				break;
			}
		}

		if (separatorIndex !== -1) {
			personality = matches.slice(0, separatorIndex + 1).map((item) => item.replace(/^\d\.\s*/, ""));
			personalLife = matches.slice(separatorIndex + 1).map((item) => item.replace(/^\d\.\s*/, ""));
		}
	}
	return { personality, personalLife };
}

export function parseList(text: string) {
	const regex = /(?:\d. [^\n]+)/g;
	const matches = text.match(regex);
	let waysToPersonalizeMessage: string[] = [];

	if (matches) {
		waysToPersonalizeMessage = matches.map((item) => item + "\n");
	}

	return waysToPersonalizeMessage;
}
