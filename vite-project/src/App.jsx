import { useState } from 'react'
import logo from './logo.svg'
import { updateSettings } from './actions';
import './App.css'
const myStorage = window.localStorage;

function App() {
	const [ count,setCount ] = useState( 0 );
	const [ volume,setVolume ] = useState( 1 )
	const [ volumeThresholdValue,setVolumeThresholdValue ] = useState( 0 )
	const [ tolerance,setTolerance ] = useState( 0 )

	if ( myStorage.getItem( 'volumeThreshold' ) ) {
		const val = myStorage.getItem( 'volumeThreshold' );
		myStorage.setItem( 'volumeThreshold',val );
		volumeThresholdValue === 0 && setVolumeThresholdValue( val );
	}

	if ( myStorage.getItem( 'tolerance' ) ) {
		const val = myStorage.getItem( 'tolerance' );
		myStorage.setItem( 'tolerance',val );
		tolerance === 0 && setTolerance( val );
	}


	const handlerUpdate = () => {

		updateSettings( tolerance,volumeThresholdValue )

		console.log( volumeThresholdValue,tolerance );
	}

	return (
		<div className="App">
			<div className="App-header">
				<img src={ logo } className="App-logo" alt="logo" />
				<div>

					<div className='section'>
						TOLERANCE:   { tolerance }
					</div>

					<div className={ 'btn-container' }>
						<input
							type="range"
							min={ 10 }
							max={ 10000 }
							step={ 2 }
							value={ tolerance }
							onChange={ event => {
								setTolerance( event.target.valueAsNumber );
							} }
							onMouseUp={ () => {
								handlerUpdate()
							} }
						/>
					</div>

					<div>
						VOLUME THRESHOLD: { volumeThresholdValue }
					</div>

					<div className={ 'btn-container' }>
						<input
							type="range"
							min={ 10 }
							max={ 5000 }
							step={ 2 }
							value={ volumeThresholdValue }
							onChange={ event => {
								setVolumeThresholdValue( event.target.valueAsNumber );
							} }
							onMouseUp={ () => {
								handlerUpdate()
							} }
						/>
					</div>



					{/* <div className="action-container">
						<button onClick={ () => handlerUpdate() }>
							Update
						</button>
					</div> */}

				</div>
			</div>
		</div>
	)
}

export default App
