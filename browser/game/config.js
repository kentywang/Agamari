import {timeSinceStart} from './main';

// our color pallet
export const myColors = function(){
	
	let colArray = [
	{  
		grey: '#556270',
		green: '#C7F464',
		blue: '#4ECDC4',
		pink: '#FF6B6B',
		red: '#C44D58'
	}
	];

	return colArray[0];
}

// variables for physics
export const fixedTimeStep = 1.0 / 60.0; // seconds
export const maxSubSteps = 3;
