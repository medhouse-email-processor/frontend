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
    return <p>Проверяем Goodle аутентификацию...</p>
  }

  if (isAuthenticated === false) {
    return (
      <div className='unauthenticated'>
        <h2>Вы должны войти с помощью вашего Google аккаунта.</h2>
        <a className='auth-link' href={authUrl}>Авторизоваться через Google</a>
      </div>
    )
  }

  // If authenticated, render the main app routes
  return (
    <div className='App'>
      <nav>
        <ul>
          <li><Link to='/'>Извлечь файлы</Link></li>
          <li><Link to='/createsender'>Добавить отправителя</Link></li>
          <li><Link onClick={signOut}>Выйти</Link></li> {/* Sign Out Button */}
        </ul>
      </nav>
      <Routes>
        <Route path='/' element={<FetchAndUpload />} />
        <Route path='/createsender' element={<CreateSender />} />
      </Routes>
    </div>
  )
}

export default App
