import {timeSinceStart} from './main';

let randStartPallete = ~~(Math.random() * 9);

// our color pallet
export const myColors = function(){
	
	let colArray = [
	{  
		grey: '#556270',
		green: '#C7F464',
		blue: '#4ECDC4',
		pink: '#FF6B6B',
		red: '#C44D58'
	},
	{
		grey: '#F8B195',
		green: '#F67280',
		blue: '#C06C84',
		pink: '#6C5B7B',
		red: '#355C7D'
	},
	{
		grey: '#99B898',
		green: '#FECEAB',
		blue: '#FF847C',
		pink: '#E84A5F',
		red: '#2A363B'
	},
	{
		grey: '#A8E6CE',
		green: '#DCEDC2',
		blue: '#FFD3B5',
		pink: '#FFAAA6',
		red: '#FF8C94'
	},
	{
		grey: '#A8A7A7',
		green: '#CC527A',
		blue: '#E8175D',
		pink: '#474747',
		red: '#363636'
	},
	{
		grey: '#A7226E',
		green: '#EC2049',
		blue: '#F26B38',
		pink: '#F7DB4F',
		red: '#2F9599'
	},
	{
		grey: '#E1F5C4',
		green: '#EDE574',
		blue: '#F9D423',
		pink: '#FC913A',
		red: '#FF4E50'
	},
	{
		grey: '#E5FCC2',
		green: '#9DE0AD',
		blue: '#45ADA8',
		pink: '#547980',
		red: '#594F4F'
	},
	{
		grey: '#FE4365',
		green: '#FC9D9A',
		blue: '#F9CDAD',
		pink: '#C8C8A9',
		red: '#83AF9B'
	}
	];
		
	let palletetoReturn;
	// return color pallete based on time played
	let minPlayed = ~~((Date.now() - timeSinceStart)/1000/60)

	if(minPlayed < 2)
		palletetoReturn = randStartPallete;
	else if(minPlayed < 3)
		palletetoReturn = randStartPallete + 1;
	else if(minPlayed < 4)
		palletetoReturn = randStartPallete + 2;
	else if(minPlayed < 5)
		palletetoReturn = randStartPallete + 3;
	else if(minPlayed < 6)
		palletetoReturn = randStartPallete + 4;
	else if(minPlayed < 7)
		palletetoReturn = randStartPallete + 5;
	else if(minPlayed < 8)
		palletetoReturn = randStartPallete + 6;
	else if(minPlayed < 9)
		palletetoReturn = randStartPallete + 7;
	else if(minPlayed >= 9)
		palletetoReturn = randStartPallete + 8;

	return colArray[0];

	// I've temp disabled random colors because they aren't too great. Reorganize labels and try again.
	//return colArray[randStartPallete % colArray.length];
}

// variables for physics
export const fixedTimeStep = 1.0 / 60.0; // seconds
export const maxSubSteps = 3;
