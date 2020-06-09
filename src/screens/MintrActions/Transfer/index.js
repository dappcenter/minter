import React, { useContext, useState, useEffect } from 'react';
import Action from './Action';
import Confirmation from './Confirmation';
import Complete from './Complete';

import snxJSConnector from '../../../helpers/snxJSConnector';
import { SliderContext } from '../../../components/ScreenSlider';
import { Store } from '../../../store';

import errorMapper from '../../../helpers/errorMapper';
import { createTransaction } from '../../../ducks/transactions';
import { updateGasLimit, fetchingGasLimit } from '../../../ducks/network';
import { bigNumberFormatter, shortenAddress } from '../../../helpers/formatters';
import { GWEI_UNIT } from '../../../helpers/networkHelper';
import { useTranslation } from 'react-i18next';

const useGetBalances = (walletAddress, setCurrentCurrency) => {
	const [data, setData] = useState([]);
	useEffect(() => {
		const getBalances = async () => {
			try {
				const [transferable, trxBalance] = await Promise.all([
					snxJSConnector.snxJS.Synthetix.transferableSynthetix(walletAddress),
					snxJSConnector.provider.getBalance(walletAddress),
				]);
				let readableTrxBalance = window.tronWeb.fromSun(
					window.tronWeb.BigNumber(trxBalance._hex).toString()
				);
				let walletBalances = [
					{
						name: 'OKS',
						balance: bigNumberFormatter(transferable),
						rawBalance: transferable,
					},
					{
						name: 'TRX',
						balance: readableTrxBalance, //bigNumberFormatter(trxBalance),
						rawBalance: trxBalance,
					},
				];

				const synthList = snxJSConnector.synths
					.filter(({ asset }) => asset)
					.map(({ name }) => name)
					.filter(name => {
						return name !== 'sBTT' && name !== 'iBTT';
					});

				const balanceResults = await Promise.all(
					synthList.map(synth => snxJSConnector.snxJS[synth].balanceOf(walletAddress))
				);

				balanceResults.forEach((synthBalance, index) => {
					const balance = bigNumberFormatter(synthBalance);
					if (balance && balance > 0)
						walletBalances.push({
							name: synthList[index],
							rawBalance: synthBalance,
							balance,
						});
				});
				setData(walletBalances);
				setCurrentCurrency(walletBalances[0]);
			} catch (e) {
				console.log(e);
			}
		};
		getBalances();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [walletAddress]);
	return data;
};

const useGetGasEstimate = (currency, amount, destination) => {
	const { dispatch } = useContext(Store);
	const [error, setError] = useState(null);
	const { t } = useTranslation();
	useEffect(() => {
		if (!currency || !currency.name || !amount || !destination) return;
		const getGasEstimate = async () => {
			setError(null);
			let gasEstimate;
			try {
				if (amount > currency.balance) throw new Error('input.error.balanceTooLow');
				if (!Number(amount)) throw new Error('input.error.invalidAmount');
				const amountBN = snxJSConnector.utils.parseEther(amount.toString());
				fetchingGasLimit(dispatch);
				if (currency.name === 'OKS') {
					gasEstimate = await snxJSConnector.snxJS.Synthetix.contract.estimate.transfer(
						destination,
						amountBN
					);
				} else if (currency.name === 'TRX') {
					if (amount === currency.balance) throw new Error('input.error.balanceTooLow');
					gasEstimate = 0; //await snxJSConnector.provider.estimateGas({
					//	value: amountBN,
					//	to: destination,
					//});
				} else {
					gasEstimate = 0; // await snxJSConnector.snxJS[currency.name].contract.estimate.transfer(
					//	destination,
					//	amountBN
					//);
				}
			} catch (e) {
				console.log(e);
				const errorMessage = (e && e.message) || 'input.error.gasEstimate';
				setError(t(errorMessage));
			}
			//updateGasLimit(Number(gasEstimate), dispatch);
		};
		//getGasEstimate();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [amount, currency, destination]);
	return error;
};

const sendTransaction = async (currency, amount, destination, settings) => {

	const sunDecimals = 6;
	if (!currency) return null;
	if (currency === 'OKS') {
		console.log('signerObject', snxJSConnector.signer);

		const txHash = await snxJSConnector.snxJS.Synthetix.contract
			.transfer(destination, amount)
			.send(settings);
		return { hash: txHash };
	} else if (currency === 'TRX') {
		const res = await window.tronWeb.transactionBuilder.sendTrx(
			destination,
			Number(amount) / (10 ** (18- sunDecimals)),
			window.tronWeb.defaultAddress.base58
		);
		const signedTransaction = await window.tronWeb.trx.sign(res);	
		const obj = await window.tronWeb.trx.sendRawTransaction(signedTransaction); // error
		console.log(obj.transaction.txID);
		return { hash: obj.transaction.txID };
	} else
		return snxJSConnector.snxJS[currency].contract.transfer(destination, amount).send(settings);
};

const Send = ({ onDestroy }) => {
	const { handleNext, handlePrev } = useContext(SliderContext);
	const [sendAmount, setSendAmount] = useState('');
	const [sendDestination, setSendDestination] = useState('');
	const [currentCurrency, setCurrentCurrency] = useState(null);
	const [transactionInfo, setTransactionInfo] = useState({});
	const {
		state: {
			wallet: { currentWallet, walletType, networkName },
			network: {
				settings: { gasPrice, gasLimit, isFetchingGasLimit },
			},
		},
		dispatch,
	} = useContext(Store);

	const balances = useGetBalances(currentWallet, setCurrentCurrency);
	const gasEstimateError = useGetGasEstimate(currentCurrency, sendAmount, sendDestination);

	const onSend = async () => {
		try {
			const realSendAmount =
				sendAmount === currentCurrency.balance
					? currentCurrency.rawBalance
					: snxJSConnector.utils.parseEther(sendAmount.toString());

			handleNext(1);
			const transaction = await sendTransaction(
				currentCurrency.name,
				realSendAmount,
				sendDestination,
				{ gasPrice: gasPrice * GWEI_UNIT, gasLimit }
			);

			//console.log('got tx', transaction);

		
			if (transaction) {
				setTransactionInfo({ transactionHash: transaction.hash });
				createTransaction(
					{
						hash: transaction.hash,
						status: 'pending',
						info: `Sending ${Math.round(sendAmount, 3)} ${currentCurrency.name} to ${shortenAddress(
							sendDestination
						)}`,
						hasNotification: true,
					},
					dispatch
				);
				handleNext(2);
			}
		} catch (e) {
			console.log(e);
			//const errorMessage = errorMapper(e, walletType);
			//console.log(errorMessage);
			setTransactionInfo({
				...transactionInfo,
				transactionError: e,
			});
			handleNext(2);
		}
	};

	const props = {
		onDestroy,
		onSend,
		sendAmount,
		sendDestination,
		setSendAmount,
		setSendDestination,
		...transactionInfo,
		goBack: handlePrev,
		balances,
		currentCurrency,
		onCurrentCurrencyChange: synth => setCurrentCurrency(synth),
		walletType,
		networkName,
		gasEstimateError,
		isFetchingGasLimit,
	};

	return [Action, Confirmation, Complete].map((SlideContent, i) => (
		<SlideContent key={i} {...props} />
	));
};

export default Send;
