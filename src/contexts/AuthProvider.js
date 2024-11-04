// src/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from 'react'
import { checkGoogleAuth, getAuthUrl } from '../services/api'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [authUrl, setAuthUrl] = useState('')

    const checkAuthStatus = async (location) => {
        try {
            const searchParams = new URLSearchParams(location?.search)
            const authSuccess = searchParams.get('authSuccess')
            const accessToken = searchParams.get('accessToken')
            const refreshToken = searchParams.get('refreshToken')

            if (authSuccess && accessToken && refreshToken) {
                sessionStorage.setItem('accessToken', accessToken)
                sessionStorage.setItem('refreshToken', refreshToken)
                setIsAuthenticated(true)
                // window.history.replaceState({}, document.title, '/')
            } else {
                const storedAccessToken = sessionStorage.getItem('accessToken')
                const storedRefreshToken = sessionStorage.getItem('refreshToken')

                if (storedAccessToken && storedRefreshToken) {
                    const authStatus = await checkGoogleAuth()
                    if (authStatus.authenticated)
                        setIsAuthenticated(true)
                    if (!authStatus.authenticated) {
                        setIsAuthenticated(false)
                        const authResponse = await getAuthUrl()
                        setAuthUrl(authResponse.authUrl)
                    }
                } else {
                    setIsAuthenticated(false)
                    const authResponse = await getAuthUrl()
                    setAuthUrl(authResponse.authUrl)
                }
            }
        } catch (error) {
            console.error('Error checking Google authentication:', error)
            setIsAuthenticated(false)
        }
    }

    const signOut = () => {
        sessionStorage.removeItem('accessToken')
        sessionStorage.removeItem('refreshToken')
        setIsAuthenticated(false)
    }

    useEffect(() => {
        checkAuthStatus(window.location)
    }, [])

    return (
        <AuthContext.Provider value={{ isAuthenticated, authUrl, checkAuthStatus, signOut }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
