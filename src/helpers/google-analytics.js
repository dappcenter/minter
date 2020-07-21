import ReactGA from 'react-ga';

export const initGA = () => {
	ReactGA.initialize('UA-163808255-1'); // put your tracking id here
};

export const GAevent = (categoryName, eventName, labelName) => {
	ReactGA.event({
		category: categoryName, // Required
		action: eventName, // Required
		label: labelName,
		value: 10,
		nonInteraction: false,
	});
};
