import { formatCurrency } from '../../../helpers/formatters';
import { toNumber, isFinite, isNil } from 'lodash';

export function getStakingAmount({ issuanceRatio, mintAmount, OKSprice }) {
	if (!mintAmount || !issuanceRatio || !OKSprice) return '0';
	return formatCurrency(mintAmount / issuanceRatio / OKSprice);
}

export function estimateCRatio({ OKSPrice, debtBalance, oksBalance, mintAmount }) {
	//console.log(OKSPrice, debtBalance, oksBalance, mintAmount);
	if (isNil(OKSPrice) || isNil(debtBalance) || isNil(oksBalance)) {
		return 0;
	}

	const parsedMintAmount = toNumber(mintAmount);
	const mintAmountNumber = isFinite(parsedMintAmount) ? parsedMintAmount : 0;
	const oksValue = oksBalance * OKSPrice;
	return Math.round((oksValue / (debtBalance + mintAmountNumber)) * 100);
}
