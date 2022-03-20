import axios from 'axios';
const myStorage = window.localStorage;

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