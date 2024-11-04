// src/App.js
import React, { useEffect } from 'react'
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom'
import { FetchAndUpload, CreateSender } from './pages'
import { AuthProvider, useAuth } from './contexts/AuthProvider'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  )
}

function AppContent() {
  const { isAuthenticated, authUrl, checkAuthStatus, signOut } = useAuth()

  useEffect(() => {
    checkAuthStatus()  // Trigger the authentication check on mount
  }, [checkAuthStatus])

  if (isAuthenticated === null) {
    return <p>Checking Google authentication...</p>
  }

  if (isAuthenticated === false) {
    return (
      <div>
        <h2>You need to authenticate with Google to upload files.</h2>
        <a href={authUrl}>Authenticate with Google</a>
      </div>
    )
  }

  // If authenticated, render the main app routes
  return (
    <div className="App">
      <nav>
        <ul>
          <li><Link to="/">Fetch Files</Link></li>
          <li><Link to="/createsender">Create Sender</Link></li>
          <li><Link onClick={signOut}>Sign Out</Link></li> {/* Sign Out Button */}
        </ul>
      </nav>
      <Routes>
        <Route path="/" element={<FetchAndUpload />} />
        <Route path="/createsender" element={<CreateSender />} />
      </Routes>
    </div>
  )
}

export default App
