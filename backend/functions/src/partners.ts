interface PartnerConfiguration {
	[key: string]: {
		organization: string;
		apiKey: string;
		usercollection: string;
	};
}

export const partnerConfig: PartnerConfiguration = {
	outboundly: {
		organization: "org-8eLDgzD7J7ARFCFytDmwESVK",
		apiKey: "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",
		usercollection: "users",
	},
	setly: {
		organization: "org-t1QNDOGvkq4zPTmYBmrvL36c",
		apiKey: "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",
		usercollection: "users-setly",
	},
};
