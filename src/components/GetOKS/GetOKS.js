import React, { useState, useContext, useEffect } from 'react';
import styled from 'styled-components';

import { ButtonPrimary, ButtonSecondary } from '../Button';
import { initGA, GAevent } from '../../helpers/google-analytics.js';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

const buyWithTRX = () => {
	//onDestroy();
	GAevent('User', 'Buy OKS with TRX', 'BuyOKSwTRX');
};
const buyWithETHBTC = () => {
	//onDestroy();
	GAevent('User', 'Buy OKS with ETH/BTC', 'BuyOKSwETHBTC');
};

const GetOKS = ({ test }) => {
	useEffect(() => {
		initGA();
	}, []);
	return (
		<>
			<Pane>
				<Title>Got Tron?</Title>
				<ButtonRow>
					<Link
						width="260px"
						height="56px"
						href="https://swap.oikos.cash/swap/TWVVcRqRmpyAi9dASvTXrqnS7FrwvDezMn"
						target="_new"
						onClick={buyWithTRX}
					>
						Buy OKS with TRX
					</Link>
				</ButtonRow>
			</Pane>
			<Pane>
				<Title>Got ETH/BTC?</Title>
				<ButtonRow>
					<Link
						width="260px"
						height="56px"
						href="https://www.biki.cc/en_US/trade/OKS_ETH"
						target="_new"
						onClick={buyWithETHBTC}
					>
						Buy OKS with ETH/BTC
					</Link>
				</ButtonRow>
			</Pane>
		</>
	);
};

const Button = styled.button`
	height: 80px;
	width: 100%;
	border-radius: 2px;
	padding: 16px 48px;
	margin: 10px 0;
	display: flex;
	justify-content: left;
	align-items: center;
	background-color: ${props => props.theme.colorStyles.panelButton};
	border: 1px solid ${props => props.theme.colorStyles.borders};
	box-shadow: 0px 5px 10px 5px ${props => props.theme.colorStyles.shadow1};
	opacity: ${props => (props.disabled ? '0.4' : 1)};
	cursor: pointer;
	transition: all 0.1s ease;
	:hover {
		background-color: ${props => props.theme.colorStyles.panelButtonHover};
	}
`;

const ButtonRow = styled.div`
	display: flex;
	width: 100%;
	margin: auto;
	justify-content: space-around;
	max-width: 800px;
`;

const Link = styled.a`
	border-radius: 7px;
	padding: 16px 48px;
	margin: 10px 0;
	display: flex;
	justify-content: left;
	align-items: center;
	background-color: #727cff;
	border: 1px solid ${props => props.theme.colorStyles.borders};
	box-shadow: 0px 5px 10px 5px ${props => props.theme.colorStyles.shadow1};
	opacity: ${props => (props.disabled ? '0.4' : 1)};
	cursor: pointer;
	transition: all 0.1s ease;
	:hover {
		background-color: ${props => props.theme.colorStyles.panelButtonHover};
	}
	font-size: 24px;
	color: white;
`;

const Pane = styled.div`
	display: inline-grid;
	grid-column-gap: 50px;
	margin-left: 20%;
	margin-top: 40px;
	margin-bottom: 40px;
`;

const Title = styled.h1`
	color: white;
	font-size: 36px;
`;
export default GetOKS;
