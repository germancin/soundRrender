import { useState } from 'react'
import Grid from 'material-grid/dist/Grid/Grid';
import logo from './logo.svg'
import './App.css'

function App() {
  const [ count,setCount ] = useState( 0 )

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
        <Grid>

          <Grid style={ { border: "2px solid yellow" } }>
            <button type="button" onClick={ () => console.log( "less" ) }>
              -
            </button>
            <button type="button" onClick={ () => console.log( "more" ) }>
              +
            </button>
          </Grid>


          { ' | ' }
          <a
            className="App-link"
            href="https://vitejs.dev/guide/features.html"
            target="_blank"
            rel="noopener noreferrer"
          >
            Vite Docs
          </a>
        </Grid>
      </header>
    </div>
  )
}

export default App
