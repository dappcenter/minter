import throttle from 'lodash/throttle';
export const GWEI_UNIT = 1000000000;
/*
export const SUPPORTED_NETWORKS = {
	1: 'MAINNET',
	3: 'ROPSTEN',
	4: 'RINKEBY',
	42: 'KOVAN',
};
*/

export const SUPPORTED_NETWORKS = {
	1: 'mainnet',
	2: 'shasta',
};

export const DEFAULT_GAS_LIMIT = {
	mint: 2200000,
	burn: 2200000,
	claim: 1400000,
	exchange: 220000,
	sendSNX: 120000,
	sendEth: 21000,
	sendSynth: 150000,
};

const INFURA_PROJECT_ID = process.env.REACT_APP_INFURA_PROJECT_ID;

export const INFURA_JSON_RPC_URLS = {
	1: `https://mainnet.infura.io/v3/${INFURA_PROJECT_ID}`,
	3: `https://ropsten.infura.io/v3/${INFURA_PROJECT_ID}`,
	4: `https://rinkeby.infura.io/v3/${INFURA_PROJECT_ID}`,
	42: `https://kovan.infura.io/v3/${INFURA_PROJECT_ID}`,
};

export const SUPPORTED_WALLETS = ['TronLink' /*'Trezor', 'Ledger', 'Coinbase', 'WalletConnect*/];

export const hasWeb3 = () => {
	return window.web3;
};
export const hasTronLink = () => {
	return window.tronWeb;
};
/*
export async function getEthereumNetwork() {
	return await new Promise(function(resolve, reject) {
		if (!window.web3) resolve({ name: 'MAINNET', networkId: '1' });
		window.web3.version.getNetwork((err, networkId) => {
			if (err) {
				reject(err);
			} else {
				const name = SUPPORTED_NETWORKS[networkId];
				resolve({ name, networkId });
			}
		});
	});
}
*/
export async function getTronNetwork() {
	// TODO: @kev change shasta to mainnet
	const defaultNetwork = { name: 'mainnet', networkId: '1' };

	if (!window.tronWeb) {
		return defaultNetwork;
	}
	const apiHost = window.tronWeb.fullNode.host;
	const matches = apiHost.match(/https:\/\/api\.([^.]*)\.trongrid.io/);
	// TODO: more robust: query block 0 to detect network

	if (!matches) return defaultNetwork;
	const name = matches[1];

	const networkId = Object.keys(SUPPORTED_NETWORKS).filter(
		networkId => SUPPORTED_NETWORKS[networkId] === name
	)[0];

	return { name, networkId };
}

export const getNetworkInfo = async () => {
	const result = await fetch('https://ethgasstation.info/json/ethgasAPI.json');
	const networkInfo = await result.json();
	return {
		slow: {
			gwei: networkInfo.safeLow / 10,
			time: networkInfo.safeLowWait,
			getPrice: (ethPrice, gasLimit) =>
				getTransactionPrice(networkInfo.safeLow / 10, gasLimit, ethPrice),
		},
		average: {
			gwei: networkInfo.average / 10,
			time: networkInfo.avgWait,
			getPrice: (ethPrice, gasLimit) =>
				getTransactionPrice(networkInfo.average / 10, gasLimit, ethPrice),
		},
		fast: {
			gwei: networkInfo.fast / 10,
			time: networkInfo.fastWait,
			getPrice: (ethPrice, gasLimit) =>
				getTransactionPrice(networkInfo.fast / 10, gasLimit, ethPrice),
		},
	};
};

export const getTransactionPrice = (gasPrice, gasLimit, ethPrice) => {
	if (!gasPrice || !gasLimit) return 0;
	return (gasPrice * ethPrice * gasLimit) / GWEI_UNIT;
};

export function onMetamaskAccountChange(cb) {
	if (!window.tronWeb) return;
	const listener = throttle(cb, 1000);
	window.tronWeb.publicConfigStore.on('update', listener);
}

export function onMetamaskNetworkChange(cb) {
	if (!window.tronWeb) return;
	const listener = throttle(cb, 1000);
	window.tronWeb.publicConfigStore.on('update', listener);
}
