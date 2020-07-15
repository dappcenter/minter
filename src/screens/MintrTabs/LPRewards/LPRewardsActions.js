import React from 'react';
import UniPool from '../UniPoolsTRX/UniPool';
import sETH from '../UniPoolsETH/UniPool';

import Slider from '../../../components/ScreenSlider';

const getActionComponent = action => {
	switch (action) {
		case 'unipool':
			return UniPool;
		case 'seth':
			return sETH;
		default:
			return;
	}
};

const LPRewardsAction = ({ action, onDestroy }) => {
	if (!action) return null;
	const ActionComponent = getActionComponent(action);
	return (
		<Slider>
			<ActionComponent onDestroy={onDestroy} />
		</Slider>
	);
};

export default LPRewardsAction;
