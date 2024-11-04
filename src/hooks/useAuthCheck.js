import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthProvider'

export const useAuthCheck = () => {
    const { checkAuthStatus } = useAuth()
    const location = useLocation()

    useEffect(() => {
        checkAuthStatus(location)
    }, [location, checkAuthStatus])
}
