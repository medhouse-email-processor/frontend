import React from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { FetchAndUpload, CreateSender } from './pages'
import './App.css'

function App() {
  return (
    <Router>
      <div className="App">
        <nav>
          <ul>
            <li><a href="/">Fetch Files</a></li>
            <li><a href="/createsender">Create Sender</a></li>
          </ul>
        </nav>
        <Routes>
          <Route path="/" element={<FetchAndUpload />} />
          <Route path="/createsender" element={<CreateSender />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
