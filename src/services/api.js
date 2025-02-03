import axios from 'axios'

// export const baseURL = 'https://server.emailer.daichin.kz'
// export const baseURL = 'http://localhost:5001'
export const baseURL = ''
const API_URL = baseURL + '/api'

export const fetchEmails = async (senderId, day, saveFolder) => {
    try {
        const accessToken = sessionStorage.getItem('accessToken')
        const response = await axios.post(`${API_URL}/email/fetch`, {
            senderId,
            day,
            saveFolder
        }, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        })
        return response.data // axios returns the data directly in `response.data`
    } catch (error) {
        return { success: false, message: error.response?.data?.message || error.message }
    }
}

export const uploadFiles = async (mainFolderName, folderId) => {
    try {
        const accessToken = sessionStorage.getItem('accessToken')
        const response = await axios.post(`${API_URL}/drive/upload`, {
            mainFolderName,
            folderId,
        }, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        })
        return response.data
    } catch (error) {
        return { success: false, message: error.response?.data?.message || error.message }
    }
}

export const createSender = async (data) => {
    try {
        const response = await axios.post(`${API_URL}/admin/sender/create`, data)
        return { success: true, message: 'Sender created successfully', data: response.data }
    } catch (error) {
        return { success: false, message: error.response?.data?.message || error.message }
    }
}

export const checkGoogleAuth = async () => {
    try {
        const accessToken = sessionStorage.getItem('accessToken')
        const response = await axios.get(`${API_URL}/drive/auth/check`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        })
        return response.data
    } catch (error) {
        const errorMessage = error.response?.data?.message || error.message
        return { authenticated: false, message: errorMessage }
    }
}

export const getAuthUrl = async () => {
    try {
        const response = await axios.get(`${API_URL}/drive/auth`)
        return response.data
    } catch (error) {
        return { success: false, message: error.response?.data?.message || error.message }
    }
}


export const getSenders = async () => {
    try {
        const response = await axios.get(`${API_URL}/email/senders`)
        return response.data
    } catch (error) {
        return { success: false, message: error.response?.data?.message || error.message }
    }
}

// Add this to services/api.js
export const getFolderId = async () => {
    try {
        const accessToken = sessionStorage.getItem('accessToken')
        const response = await axios.get(`${API_URL}/drive/folder-id`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        })
        return response.data
    } catch (error) {
        return { success: false, message: error.response?.data?.message || error.message }
    }
}

export const listenForStatusUpdates = (onStatusUpdate, onProgressUpdate) => {
    const accessToken = sessionStorage.getItem('accessToken')
    const eventSource = new EventSource(`${API_URL}/fetch-progress/${accessToken}`)

    eventSource.onmessage = event => {
        const data = JSON.parse(event.data)
        onStatusUpdate(data.status)
        onProgressUpdate(data.progress)
        console.log(data)
    }

    eventSource.onerror = () => {
        eventSource.close()
    }

    return eventSource
}