import React, { useState, useContext } from 'react';
import styled from 'styled-components';
import { withTranslation } from 'react-i18next';

import { createTransaction } from '../../../ducks/transactions';
import snxJSConnector from '../../../helpers/snxJSConnector';
import { Store } from '../../../store';
import { GWEI_UNIT } from '../../../helpers/networkHelper';

import { PageTitle, PLarge } from '../../../components/Typography';
import { ButtonPrimary } from '../../../components/Button';

const ALLOWANCE_LIMIT = 100000000;

const SetAllowance = ({ t }) => {
	const [error, setError] = useState(null);
	const {
		state: {
			network: {
				settings: { gasPrice },
			},
		},
		dispatch,
	} = useContext(Store);

	const onUnlock = async () => {
		const { parseEther } = snxJSConnector.utils;
		const { uniswapstrxContract, unipoolstrxContract } = snxJSConnector;
		try {
			setError(null);

			const gasEstimate = 0; /*await uniswapContract.estimate.approve(
				unipoolContract.address,
				parseEther(ALLOWANCE_LIMIT.toString())
			);*/
			const transactionHash = await uniswapstrxContract
				.approve(unipoolstrxContract.address, parseEther(ALLOWANCE_LIMIT.toString()))
				.send();
			if (transactionHash) {
				createTransaction(
					{
						hash: transactionHash,
						status: 'pending',
						info: `Setting Uni-V1 LP token allowance`,
						hasNotification: true,
					},
					dispatch
				);
			}
		} catch (e) {
			setError(e.message);
			console.log(e);
		}
	};
	return (
		<>
			<TitleContainer>
				<PageTitle>{t('unipool.locked.title')}</PageTitle>
			</TitleContainer>
			<PLarge>{t('unipool.locked.subtitle')}</PLarge>
			<ButtonRow>
				<ButtonPrimary onClick={onUnlock}>{t('unipool.buttons.unlock')}</ButtonPrimary>
			</ButtonRow>
			{error ? <Error>{`Error: ${error}`}</Error> : null}
		</>
	);
};

const Logo = styled.img``;

const TitleContainer = styled.div`
	margin-top: 30px;
	text-align: center;
`;

const ButtonRow = styled.div`
	display: flex;
	width: 100%;
	justify-content: center;
	margin-top: 64px;
`;

const Error = styled.div`
	color: ${props => props.theme.colorStyles.brandRed};
	font-size: 16px;
	font-family: 'apercu-medium', sans-serif;
	display: flex;
	justify-content: center;
	margin-top: 40px;
`;

export default withTranslation()(SetAllowance);
