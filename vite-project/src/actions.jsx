import axios from 'axios';
const myStorage = window.localStorage;

export async function updateSettings( tolerance,volumeThreshold ) {

	myStorage.setItem( 'volumeThreshold',volumeThreshold );
	myStorage.setItem( 'tolerance',tolerance );

	var config = {
		method: 'post',
		url: 'http://192.168.0.237:7000/updateSettings',
		headers: {
			'Content-Type': 'application/json'
		},
		data: { tolerance,volumeThreshold }
	};
	try {
		let request = await axios( config );

		console.log( "RESPONSE",request )
	} catch ( error ) {
		return error;
	}


}

export async function updateVolumeThreshold( value ) {

	myStorage.setItem( 'volumeThreshold',value );

	var config = {
		method: 'post',
		url: 'http://192.168.0.237:7000/updateVolumneTreshold',
		headers: {
			'Content-Type': 'application/json'
		},
		data: { 'volumeThreshold': value }
	};
	try {
		let request = await axios( config );

		console.log( "RESPONSE",request )
	} catch ( error ) {
		return error;
	}


}

export async function updateTolerance( value ) {

	myStorage.setItem( 'tolerance',value );

	var config = {
		method: 'post',
		url: 'http://192.168.0.237:7000/updateTolerance',
		headers: {
			'Content-Type': 'application/json'
		},
		data: { 'tolerance': value }
	};
	try {
		let request = await axios( config );

		console.log( "RESPONSE",request )
	} catch ( error ) {
		return error;
	}


}