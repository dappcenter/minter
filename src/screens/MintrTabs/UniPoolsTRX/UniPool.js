import React, { useState, useCallback, useEffect, useContext } from 'react';
import styled from 'styled-components';
import { ButtonPrimary, ButtonTertiary } from '../../../components/Button';

import snxJSConnector from '../../../helpers/snxJSConnector';
import { Store } from '../../../store';

import { bigNumberFormatter, formatUniv1 } from '../../../helpers/formatters';

import PageContainer from '../../../components/PageContainer';
import Spinner from '../../../components/Spinner';

import SetAllowance from './SetAllowance';
import Stake from './Stake';

const UniPool = ({ goBack }) => {
	const [hasAllowance, setAllowance] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const {
		state: {
			wallet: { currentWallet },
		},
	} = useContext(Store);

	const fetchAllowance = useCallback(async () => {
		console.log({ snxJSConnector });

		if (!snxJSConnector.initialized) return;
		const { uniswapstrxContract, unipoolstrxContract } = snxJSConnector;

		console.log({ uniswapstrxContract, unipoolstrxContract });
		try {
			setIsLoading(true);
			const allowance = await uniswapstrxContract
				.allowance(currentWallet, unipoolstrxContract.address)
				.call();
			setAllowance(!!bigNumberFormatter(allowance));
			setIsLoading(false);
		} catch (e) {
			console.log(e);
			setIsLoading(false);
			setAllowance(true);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentWallet, snxJSConnector.initialized]);

	useEffect(() => {
		fetchAllowance();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [fetchAllowance]);

	useEffect(
		onDestroy => {
			if (!currentWallet) return;
			const { uniswapstrxContract, unipoolstrxContract } = snxJSConnector;

			/*uniswapstrxContract.on('Approval', (owner, spender) => {
				if (owner === currentWallet && spender === unipoolstrxContract.address) {
					setAllowance(true);
				}
			});*/

			return () => {
				if (snxJSConnector.initialized) {
					//	uniswapContract.removeAllListeners('Approval');
				}
			};
			// eslint-disable-next-line react-hooks/exhaustive-deps
		},
		[currentWallet]
	);

	return (
		<>
			{isLoading ? (
				<SpinnerContainer>
					<Spinner />
				</SpinnerContainer>
			) : !hasAllowance ? (
				<SetAllowance />
			) : (
				<>
					<Stake goBack={goBack} />
				</>
			)}
		</>
	);
};

const SpinnerContainer = styled.div`
	margin: 100px;
`;
const Navigation = styled.div`
	width: 100%;
	display: flex;
	justify-content: space-between;
	padding: 20px 0;
`;
export default UniPool;
