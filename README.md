[![Twitter Follow](https://img.shields.io/twitter/follow/oikos_cash.svg?label=oikos_cash&style=social)](https://twitter.com/oikos_cash)

# Mintr v2

This is the code for the new Oikos Mintr dApp: https://mint.oikos.cash.

For translator instructions, [go here](#translator-instructions).

The dApp communicates with the Oikos contracts, allowing users to perform the following actions:

- Mint (aka Issue) `sUSD` by locking `OKS`
- Claim rewards of both `OKS` (inflation) and `sUSD` (exchange fees) every week
- Burn `sUSD` to unlock `OKS`
- Transfer `OKS` to other accounts
- Deposit (or withdrawl) `sUSD` into the `Depot` contract, to go in the queue for exchanging with `ETH` at current market price

Mintr v2 supports the following wallet providers:

- Metamask
- Trezor
- Ledger
- Coinbase Wallet

![mintrv2](https://user-images.githubusercontent.com/799038/67426237-aa7a5c00-f5a7-11e9-96a6-1d721f3c58ba.gif)

---

> Note: This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Translator instructions

1. Fork this repo using the fork button on the top right ^^^.
2. Create language folder using your language code https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes in the `public/locales` folder e.g public/locales/es/.
3. Copy the `public/locales/en/translation.json` file.
4. Paste it into your langage folder e.g. public/locales/es/translation.json
5. Translate English to your language
6. Submit PR back to this repo

Before submitting a translation, please make sure to respect the following repository architecture:
`public/locales/{LANG-CODE}/translation.json`
with {LANG-CODE} the language code for your language to translate.

Examples:

```
public/locales/fr/translation.json
public/locales/es/translation.json
```

Please make sure to use the latest version of the english (en) file as a reference before starting the translation.

`translation.json` follows a simple key:value format which has to be respected in order to be published.

```
	"home": {
		"intro": {
			"title": "What would you like to do?",
			"subtitle": "Click any button below to view more info, confirm or change the amount before submitting."
		},
	},
```

With the example above, a new translation should look like:

```
	"home": {
		"intro": {
			"title": "YOUR_TRANSLATION",
			"subtitle": "YOUR_TRANSLATION"
		},
	},
```

To be merged and published a translation will have to cover every key:value.

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.<br>
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.
