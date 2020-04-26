import { SynthetixJs } from '@oikos/oikos-js';
import { getTronNetwork } from './networkHelper';

let snxJSConnector = {
	initialized: false,
	signers: SynthetixJs.signers,
	setContractSettings: function(contractSettings) {
		console.log({ contractSettings });
		this.initialized = true;
		contractSettings.tronWeb = window.tronWeb;
		this.snxJS = new SynthetixJs(contractSettings);
		this.synths = this.snxJS.contractSettings.synths;
		this.signer = this.snxJS.contractSettings.signer;
		this.provider = this.signer.provider;
		this.utils = this.snxJS.utils;
		this.ethersUtils = this.snxJS.ethers.utils;
		this.uniswapContract = window.tronWeb.contract().at(uniswap.address); //new ethers.Contract(uniswap.address, uniswap.abi, this.signer);
		//this.unipoolContract = new ethers.Contract(unipool.address, unipool.abi, this.signer);
		//this.synthSummaryUtilContractAddress = "410fd440ab8be763f0eef27356f0f84a5e852c4a03";
	},
};

const connectToTronlink = async (networkId, networkName) => {
	try {
		// Otherwise we enable ethereum if needed (modern browsers)
		if (!window.tronWeb) {
			//window.ethereum.autoRefreshOnNetworkChange = true;
			//await window.ethereum.enable();
			return;
		}

		console.log('connector', snxJSConnector);

		const accounts = await snxJSConnector.signer.getNextAddresses();
		if (accounts && accounts.length > 0) {
			return {
				currentWallet: accounts[0],
				walletType: 'TronLink',
				unlocked: true,
				networkId,
				networkName: networkName.toLowerCase(),
			};
		} else {
			return {
				walletType: 'TronLink',
				unlocked: false,
				unlockReason: 'MetamaskNoAccounts',
			};
		}
		// We updateWalletStatus with all the infos
	} catch (e) {
		console.log(e);
		return {
			walletType: 'TronLink',
			unlocked: false,
			unlockReason: 'ErrorWhileConnectingToMetamask',
			unlockMessage: e,
		};
	}
};
/*
const connectToCoinbase = async (networkId, networkName) => {
	try {
		const accounts = await snxJSConnector.signer.getNextAddresses();
		if (accounts && accounts.length > 0) {
			return {
				currentWallet: accounts[0],
				walletType: 'Coinbase',
				unlocked: true,
				networkId: 1,
				networkName: networkName.toLowerCase(),
			};
		} else {
			return {
				walletType: 'Coinbase',
				unlocked: false,
				unlockReason: 'CoinbaseNoAccounts',
			};
		}
		// We updateWalletStatus with all the infos
	} catch (e) {
		console.log(e);
		return {
			walletType: 'Coinbase',
			unlocked: false,
			unlockReason: 'ErrorWhileConnectingToCoinbase',
			unlockMessage: e,
		};
	}
};

const connectToHardwareWallet = (networkId, networkName, walletType) => {
	return {
		walletType,
		unlocked: true,
		networkId,
		networkName: networkName.toLowerCase(),
	};
};

const connectToWalletConnect = async (networkId, networkName) => {
	try {
		await snxJSConnector.signer.provider._web3Provider.enable();
		const accounts = await snxJSConnector.signer.getNextAddresses();
		if (accounts && accounts.length > 0) {
			return {
				currentWallet: accounts[0],
				walletType: 'WalletConnect',
				unlocked: true,
				networkId,
				networkName: networkName.toLowerCase(),
			};
		}
	} catch (e) {
		console.log(e);
		return {
			walletType: 'WalletConnect',
			unlocked: false,
			unlockReason: 'ErrorWhileConnectingToWalletConnect',
			unlockMessage: e,
		};
	}
};
*/
const getSignerConfig = ({ type, networkId, derivationPath }) => {
	/*if (type === 'Ledger') {
		const DEFAULT_LEDGER_DERIVATION_PATH = "44'/60'/0'/";
		return { derivationPath: derivationPath || DEFAULT_LEDGER_DERIVATION_PATH };
	}
	if (type === 'Coinbase') {
		return {
			appName: 'Mintr',
			appLogoUrl: `${window.location.origin}/images/mintr-leaf-logo.png`,
			jsonRpcUrl: INFURA_JSON_RPC_URLS[networkId],
			networkId,
		};
	}

	if (type === 'WalletConnect') {
		return {
			infuraId: process.env.REACT_APP_INFURA_PROJECT_ID,
		};
	}*/

	return {};
};

export const setSigner = ({ type, networkId, derivationPath }) => {
	const signer = new snxJSConnector.signers[type](
		getSignerConfig({ type, networkId, derivationPath })
	);

	snxJSConnector.setContractSettings({
		networkId,
		signer,
	});
};

export const connectToWallet = async ({ wallet, derivationPath }) => {
	const { name, networkId } = await getTronNetwork();
	if (!name) {
		return {
			walletType: '',
			unlocked: false,
			unlockReason: 'NetworkNotSupported',
		};
	}
	setSigner({ type: wallet, networkId, derivationPath });

	switch (wallet) {
		case 'TronLink':
			return connectToTronlink(networkId, name);
		//case 'Coinbase':
		//	return connectToCoinbase(networkId, name);
		//case 'Trezor':
		//case 'Ledger':
		//	return connectToHardwareWallet(networkId, name, wallet);
		//case 'WalletConnect':
		//	return connectToWalletConnect(networkId, name);
		default:
			return {};
	}
};

export default snxJSConnector;
