import React from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import FetchAndUpload from './pages/FetchAndUpload'
import './App.css'

function App() {
  return (
    <Router>
      <div className="App">
        <nav>
          <ul>
            <li><a href="/">Fetch Files</a></li>
          </ul>
        </nav>
        <Routes>
          <Route path="/" element={<FetchAndUpload />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
