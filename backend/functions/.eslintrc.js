module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript",
    "google",
    "plugin:@typescript-eslint/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: ["tsconfig.json", "tsconfig.dev.json"],
    sourceType: "module",
  },
  ignorePatterns: [
    "/lib/**/*", // Ignore built files.
  ],
  plugins: [
    "@typescript-eslint",
    "import",
  ],
  rules: {
	"quotes": ["error", "double"],
	"import/no-unresolved": 0,
	"linebreak-style": 0,
	"indent": 0,
	"allowIndentationTabs": 0,
	"no-tabs": 0,
	"object-curly-spacing": 0,
	"max-len": 0,
	"no-mixed-spaces-and-tabs": 0,
	"require-jsdoc": 0,
	"no-prototype-builtins": 0,
  },
};


module.exports = {
	root: true,
	env: {
	  es6: true,
	  node: true,
	},
	extends: [
	  "eslint:recommended",
	  "plugin:import/errors",
	  "plugin:import/warnings",
	  "plugin:import/typescript",
	  "google",
	  "plugin:@typescript-eslint/recommended",
	],
	parser: "@typescript-eslint/parser",
	parserOptions: {
	  project: ["tsconfig.json", "tsconfig.dev.json"],
	  sourceType: "module",
	},
	ignorePatterns: [
	  "/lib/**/*", // Ignore built files.
	],
	plugins: [
	  "@typescript-eslint",
	  "import",
	],
	rules: {
	  "quotes": ["error", "double"],
	  "import/no-unresolved": 0,
	  "linebreak-style": 0,
	  "indent": 0,
	  "allowIndentationTabs": 0,
	  "no-tabs": 0,
	  "object-curly-spacing": 0,
	  "max-len": 0,
	  "no-mixed-spaces-and-tabs": 0,
	  "require-jsdoc": 0,
  },
  };
