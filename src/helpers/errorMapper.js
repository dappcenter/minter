/* eslint-disable */
const USER_DENIED = 'transactionProcessing.error.type.userDenied';

const ERROR_CODES = {
	/*Metamask: {
		'-32603': USER_DENIED,
		'4001': USER_DENIED,
	},
	Ledger: {
		'27013': USER_DENIED,
	},
	Trezor: {},
	Coinbase: {
		'-32603': USER_DENIED,
	},*/
	TronLink: {
		'0': USER_DENIED,
	},	
};

export default (error, walletType) => {
	console.log(error);
	const code = 0;// (error.code || error.statusCode).toString();
	if (error.indexOf("declined") > -1) {
		return { message: error };
	} else {
		//if (!code || !ERROR_CODES[walletType][code]) {
		return { message: error.message || 'transactionProcessing.error.type.generic' };
	}
	return { code, message: ERROR_CODES[walletType][code] };
};
