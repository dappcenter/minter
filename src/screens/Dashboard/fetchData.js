import { addSeconds } from 'date-fns';
import snxJSConnector from '../../helpers/snxJSConnector';

import { bytesFormatter } from '../../helpers/formatters';
import promiseRetry from 'promise-retry';

const bigNumberFormatter = value => Number(snxJSConnector.utils.formatEther(value));

const retry = fn => {
	return promiseRetry(
		async retry => {
			try {
				return await fn();
			} catch (err) {
				retry(err);
			}
		},
		{ retries: 10 }
	);
};

const getBalances = async walletAddress => {
	try {
		const result = await Promise.all([
			retry(() => snxJSConnector.snxJS.Synthetix.collateral(walletAddress)),
			retry(() => snxJSConnector.snxJS.sUSD.balanceOf(walletAddress)),
			retry(() => snxJSConnector.provider.getBalance(walletAddress)),
			retry(() => snxJSConnector.provider.getBalance(walletAddress)),
		]);
		const trxRaw = result.pop();
		const [oks, susd, eth] = result.map(bigNumberFormatter);
		const trx = window.tronWeb.fromSun(window.tronWeb.BigNumber(trxRaw._hex).toString());

		return { oks, susd, eth, trx };
	} catch (e) {
		console.log(e);
	}
};

const convertFromSynth = (fromSynthRate, toSynthRate) => {
	return fromSynthRate * (1 / toSynthRate);
};

// exported for tests
export const getSusdInUsd = (synthRates, sethToEthRate) => {
	const sEth = convertFromSynth(synthRates.susd, synthRates.seth);
	const eth = sEth * sethToEthRate;
	return eth * synthRates.seth;
};

const getSETHtoETH = async () => {
	const exchangeAddress = '0xe9cf7887b93150d4f2da7dfc6d502b216438f244';
	const data = await fetch(
		`https://uniswap-api.loanscan.io/v1/ticker?exchangeAddress=${exchangeAddress}`
	).then(x => x.json());
	return data.invPrice;
};

const getPrices = async () => {
	try {
		const synthsP = retry(() =>
			snxJSConnector.snxJS.ExchangeRates.ratesForCurrencies(
				['OKS', 'sUSD', 'sETH', 'sTRX'].map(bytesFormatter)
			)
		);
		// TODO: get sTRX to TRX rate?
		const sethToEthRateP = 1; //getSETHtoETH();
		const [synths, sethToEthRate] = await Promise.all([synthsP, sethToEthRateP]);
		const [oks, susd, seth, strx] = synths.map(bigNumberFormatter);

		const susdInUsd = getSusdInUsd(
			{
				susd,
				seth,
			},
			sethToEthRate
		);

		return { oks, susd: susdInUsd, eth: seth, trx: strx };
	} catch (e) {
		console.log(e);
	}
};
const getRewards = async walletAddress => {
	try {
		const [feesAreClaimable, currentFeePeriod, feePeriodDuration] = await Promise.all([
			retry(() => snxJSConnector.snxJS.FeePool.isFeesClaimable(walletAddress)),
			retry(() => snxJSConnector.snxJS.FeePool.recentFeePeriods(0)),
			retry(() => snxJSConnector.snxJS.FeePool.feePeriodDuration()),
		]);

		const currentPeriodStart =
			currentFeePeriod && currentFeePeriod.startTime
				? new Date(parseInt(currentFeePeriod.startTime * 1000))
				: null;
		const currentPeriodEnd =
			currentPeriodStart && feePeriodDuration
				? addSeconds(currentPeriodStart, feePeriodDuration)
				: null;
		return { feesAreClaimable, currentPeriodEnd };
	} catch (e) {
		console.log(e);
	}
};

const getDebt = async walletAddress => {
	try {
		const result = await Promise.all([
			retry(() => snxJSConnector.snxJS.SynthetixState.issuanceRatio()),
			retry(() => snxJSConnector.snxJS.Synthetix.collateralisationRatio(walletAddress)),
			retry(() => snxJSConnector.snxJS.Synthetix.transferableSynthetix(walletAddress)),
			retry(() =>
				snxJSConnector.snxJS.Synthetix.debtBalanceOf(walletAddress, bytesFormatter('sUSD'))
			),
		]);
		const [targetCRatio, currentCRatio, transferable, debtBalance] = result.map(bigNumberFormatter);
		return {
			targetCRatio,
			currentCRatio,
			transferable,
			debtBalance,
		};
	} catch (e) {
		console.log(e);
	}
};

const getEscrow = async walletAddress => {
	try {
		const results = await Promise.all([
			retry(() => snxJSConnector.snxJS.RewardEscrow.totalEscrowedAccountBalance(walletAddress)),
			retry(() => snxJSConnector.snxJS.SynthetixEscrow.balanceOf(walletAddress)),
		]);
		const [reward, tokenSale] = results.map(bigNumberFormatter);
		return {
			reward,
			tokenSale,
		};
	} catch (e) {
		console.log(e);
	}
};

const getSynths = async walletAddress => {
	try {
		const synths = snxJSConnector.synths.filter(({ asset }) => asset).map(({ name }) => name);
		//.filter((synth) => {
		//	return synth !== "sBTT" && synth !== "iBTT"
		//});
		console.log({ synths });

		const result = await Promise.all(
			synths.map(async synth => {
				try {
					return await retry(() => snxJSConnector.snxJS[synth].balanceOf(walletAddress));
				} catch (err) {
					throw new Error(`error fetching balance of ${synth}: ${err}`);
				}
			})
		);

		console.log({ result });
		const balances = await Promise.all(
			result.map((balance, i) => {
				return retry(() => {
					console.log(`getting ${synths[i]}`);
					return snxJSConnector.snxJS.Synthetix.effectiveValue(
						bytesFormatter(synths[i]),
						balance,
						bytesFormatter('sUSD')
					);
				});
			})
		);
		console.log({ balances });
		let totalBalance = 0;
		const formattedBalances = balances.map((balance, i) => {
			const formattedBalance = bigNumberFormatter(balance);
			totalBalance += formattedBalance;
			return {
				synth: synths[i],
				balance: formattedBalance,
			};
		});
		return {
			balances: formattedBalances,
			total: totalBalance,
		};
	} catch (e) {
		console.log(e);
	}
};

export const fetchData = async walletAddress => {
	const [balances, prices, rewardData, debtData, escrowData, synthData] = await Promise.all([
		getBalances(walletAddress),
		getPrices(),
		getRewards(walletAddress),
		getDebt(walletAddress),
		getEscrow(walletAddress),
		getSynths(walletAddress),
	]).catch(e => console.log(e));

	return {
		balances,
		prices,
		rewardData,
		debtData,
		escrowData,
		synthData,
	};
};
