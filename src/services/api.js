import axios from 'axios'

export const baseURL = ''
const API_URL = baseURL + '/api'

// Toggle logging by commenting/uncommenting the appropriate line
const enableLogging = false // Set to false to disable logging globally

// Function to append `logs=true` only if logging is enabled
const withLogs = (url) => enableLogging ? `${url}${url.includes('?') ? '&' : '?'}logs=true` : url

export const fetchEmails = async (senderId, day, saveFolder) => {
    try {
        const accessToken = sessionStorage.getItem('accessToken')
        const response = await axios.post(withLogs(`${API_URL}/email/fetch`), {
            senderId,
            day,
            saveFolder
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

export const uploadFiles = async (mainFolderName, folderId) => {
    try {
        const accessToken = sessionStorage.getItem('accessToken')
        const response = await axios.post(withLogs(`${API_URL}/drive/upload`), {
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
    console.log(data.cities)
    try {
        const response = await axios.post(withLogs(`${API_URL}/admin/sender/create`), data)
        return { success: true, message: 'Sender created successfully', data: response.data }
    } catch (error) {
        return { success: false, message: error.response?.data?.message || error.message }
    }
}

export const checkGoogleAuth = async () => {
    try {
        const accessToken = sessionStorage.getItem('accessToken')
        const response = await axios.get(withLogs(`${API_URL}/drive/auth/check`), {
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
        const response = await axios.get(withLogs(`${API_URL}/drive/auth`))
        return response.data
    } catch (error) {
        return { success: false, message: error.response?.data?.message || error.message }
    }
}

export const getSenders = async () => {
    try {
        const response = await axios.get(withLogs(`${API_URL}/email/senders`))
        return response.data
    } catch (error) {
        return { success: false, message: error.response?.data?.message || error.message }
    }
}

export const getFolderId = async () => {
    try {
        const accessToken = sessionStorage.getItem('accessToken')
        const response = await axios.get(withLogs(`${API_URL}/drive/folder-id`), {
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
    const eventSource = new EventSource(withLogs(`${API_URL}/fetch-progress/${accessToken}`))

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
