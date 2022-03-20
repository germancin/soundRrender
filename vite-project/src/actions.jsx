import axios from 'axios';
const myStorage = window.localStorage;

export function updateVolumeThreshold( value ) {

	myStorage.setItem( 'volumeThreshold',value );


}