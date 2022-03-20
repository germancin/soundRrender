import { useState } from 'react'
import logo from './logo.svg'
import { updateVolumeThreshold,updateTolerance } from './actions';
import './App.css'
const myStorage = window.localStorage;

function App() {
  const [ count,setCount ] = useState( 0 );
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

  const handleThreshold = ( e,action = null ) => {
    let total = 0;
    if ( action === 'add' ) total = parseInt( e.target.value ) + 1;
    if ( action === 'subs' ) total = parseInt( e.target.value ) - 1;

    setVolumeThresholdValue( total );
    updateVolumeThreshold( total );

  }

  const handleTolerance = ( e,action = null ) => {
    let total = 0;
    if ( action === 'add' ) total = parseInt( e.target.value ) + 1;
    if ( action === 'subs' ) total = parseInt( e.target.value ) - 1;

    setTolerance( total );
    updateTolerance( total );

  }

  return (
    <div className="App">
      <header className="App-header">
        <img src={ logo } className="App-logo" alt="logo" />
        <p>
          Edit <code>App.jsx</code> and save to test HMR updates.
        </p>
        <div>

          <div>
            VOLUME THRESHOLD: { volumeThresholdValue }
          </div>

          <div container direction={ 'row' } justifyContent={ 'center' } style={ { border: "2px solid blue" } }>

            <button variant="text" value={ volumeThresholdValue } onClick={ ( event ) => handleThreshold( event,'subs' ) }>
              -
            </button>
            <button variant="text" value={ volumeThresholdValue } onClick={ ( event ) => handleThreshold( event,'add' ) }>
              +
            </button>
          </div>




          <div>
            TOLERANCE:   { tolerance }
          </div>

          <div container direction={ 'row' } justifyContent={ 'center' } style={ { border: "2px solid yellow" } }>

            <button variant="text" value={ tolerance } onClick={ ( event ) => handleTolerance( event,'subs' ) }>
              -
            </button>
            <button variant="text" value={ tolerance } onClick={ ( event ) => handleTolerance( event,'add' ) }>
              +
            </button>
          </div>



        </div>
      </header>
    </div>
  )
}

export default App
