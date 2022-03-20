import { useState } from 'react'
import logo from './logo.svg'
import { updateVolumeThreshold } from './actions';
import './App.css'
const myStorage = window.localStorage;

function App() {
  const [ count,setCount ] = useState( 0 );
  const [ volumeThresholdValue,setVolumeThresholdValue ] = useState( 0 )

  if ( myStorage.getItem( 'volumeThreshold' ) ) {
    const val = myStorage.getItem( 'volumeThreshold' );
    myStorage.setItem( 'volumeThreshold',val );
    volumeThresholdValue === 0 && setVolumeThresholdValue( val );
  }

  const handleThreshold = ( e,action = null ) => {
    let total = 0;
    if ( action === 'add' ) total = parseInt( e.target.value ) + 1;
    if ( action === 'subs' ) total = parseInt( e.target.value ) - 1;

    setVolumeThresholdValue( total );
    updateVolumeThreshold( total );

  }

  return (
    <div className="App">
      <header className="App-header">
        <img src={ logo } className="App-logo" alt="logo" />
        <p>Hello Vite + React!</p>
        <p>
          <button type="button" onClick={ () => setCount( ( count ) => count + 1 ) }>
            count is: { count }
          </button>
        </p>
        <p>
          Edit <code>App.jsx</code> and save to test HMR updates.
        </p>
        <div>

          { volumeThresholdValue }

          <div container direction={ 'row' } justifyContent={ 'center' } style={ { border: "2px solid blue" } }>

            <button variant="text" value={ volumeThresholdValue } onClick={ ( event ) => handleThreshold( event,'subs' ) }>
              -
            </button>
            <button variant="text" value={ volumeThresholdValue } onClick={ ( event ) => handleThreshold( event,'add' ) }>
              +
            </button>
          </div>


          { ' | ' }
          <a
            className="App-link"
            href="https://vitejs.dev/guide/features.html"
            target="_blank"
            rel="noopener noreferrer"
          >
            Vite Docs
          </a>
        </div>
      </header>
    </div>
  )
}

export default App
