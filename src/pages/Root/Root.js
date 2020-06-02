import { hot } from 'react-hot-loader/root';
import React, { Suspense, useEffect, useContext, useCallback, useState } from 'react';
import styled from 'styled-components';

import { isMobileOrTablet } from '../../helpers/browserHelper';
import { Store } from '../../store';

import Landing from '../Landing';
import WalletSelection from '../WalletSelection';
import Main from '../Main';
import MaintenanceMessage from '../MaintenanceMessage';
import MobileLanding from '../MobileLanding';

import NotificationCenter from '../../components/NotificationCenter';
import snxJSConnector from '../../helpers/snxJSConnector';
import { getTronNetwork } from '../../helpers/networkHelper';

const renderCurrentPage = currentPage => {
	if (isMobileOrTablet()) return <MobileLanding />;
	switch (currentPage) {
		case 'landing':
		default:
			return <Landing />;
		case 'walletSelection':
			return <WalletSelection />;
		case 'main':
			return <Main />;
	}
};

const Announcement = styled.div`
	width: 100%;
	display: block;
	background-color: #0e0d14;
	border-bottom: 2px solid #000;
	text-align: center;
	color: #2deb96;
	font-size: 1.2em;
	font-weight: bold;
	& a {
		padding-top: 10px;
		padding-bottom: 10px;
		display: block;
		color: #46bf89;
		font-weight: bold;
		text-decoration: none;
	}
`;

const Root = () => {
	const [isOnMaintenance, setIsOnMaintenance] = useState(false);
	const {
		state: {
			ui: { currentPage },
		},
	} = useContext(Store);
	const getAppState = useCallback(async () => {
		try {
			setIsOnMaintenance(await snxJSConnector.snxJS.DappMaintenance.isPausedMintr());
		} catch (err) {
			console.log('Could not get DappMaintenance contract data', err);
			setIsOnMaintenance(false);
		}
	}, []);
	useEffect(() => {
		if (process.env.REACT_APP_CONTEXT !== 'production') return;
		let intervalId;
		const init = async () => {
			const { networkId } = await getTronNetwork();
			snxJSConnector.setContractSettings({ networkId });
			getAppState();
			intervalId = setInterval(() => {
				getAppState();
			}, 30 * 1000);
		};
		init();
		return () => {
			clearInterval(intervalId);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [getAppState]);

	return (
		<Suspense fallback={<div></div>}>
			<RootWrapper>
 
				{isOnMaintenance ? <MaintenanceMessage /> : renderCurrentPage(currentPage)}
				<NotificationCenter></NotificationCenter>
			</RootWrapper>
		</Suspense>
	);
};

const RootWrapper = styled('div')`
	position: relative;
	background: ${props => props.theme.colorStyles.background};
	width: 100%;
`;

export default hot(Root);
