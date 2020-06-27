import { formatCurrency } from '../../../helpers/formatters';
import { toNumber, isFinite, isNil } from 'lodash';

export function getStakingAmount({ issuanceRatio, mintAmount, OKSprice = 0.06 }) {
	if (!mintAmount || !issuanceRatio || !OKSprice) return '0';
	return formatCurrency(mintAmount / issuanceRatio / OKSprice);
}

export function estimateCRatio({ OKSprice = 0.06, debtBalance, oksBalance, mintAmount }) {
	console.log(OKSprice, debtBalance, oksBalance, mintAmount);
	if (isNil(OKSprice) || isNil(debtBalance) || isNil(oksBalance)) {
		return 0;
	}

	const parsedMintAmount = toNumber(mintAmount);
	const mintAmountNumber = isFinite(parsedMintAmount) ? parsedMintAmount : 0;
	const oksValue = oksBalance * OKSprice;
	return Math.round((oksValue / (debtBalance + mintAmountNumber)) * 100);
}
