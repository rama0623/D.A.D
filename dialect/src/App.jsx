import { useState } from 'react'
import './App.css'
import DialectMap from './DialectMap'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <DialectMap />
    </>
  )
}

export default App
