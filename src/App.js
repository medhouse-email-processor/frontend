import React from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import FetchFiles from './pages/FetchFiles'
import UploadFiles from './pages/UploadFiles'
import FetchAndUpload from './pages/FetchAndUpload'
import './App.css'

function App() {
  return (
    <Router>
      <div className="App">
        <nav>
          <ul>
            <li><a href="/">Fetch Files</a></li>
            <li><a href="/upload">Upload Files</a></li>
            <li><a href="/fetchupload">Fetch and Upload</a></li>
          </ul>
        </nav>
        <Routes>
          <Route path="/" element={<FetchFiles />} />
          <Route path="/upload" element={<UploadFiles />} />
          <Route path="/fetchupload" element={<FetchAndUpload />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
